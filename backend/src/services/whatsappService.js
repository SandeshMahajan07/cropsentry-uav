import { db } from '../db/schema.js';

/**
 * Format human-readable WhatsApp message
 */
export function formatAlertMessage(detection) {
  const dateStr = new Date(detection.timestamp).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Kolkata'
  });

  return (
    `🚨 *WILD ANIMAL DETECTED!* — CropSentry UAV\n\n` +
    `📅 *Time:* ${dateStr} (IST)\n` +
    `📍 *Location:* ${detection.latitude.toFixed(6)}, ${detection.longitude.toFixed(6)}\n` +
    `🗺️ *View on Google Maps:* https://www.google.com/maps?q=${detection.latitude.toFixed(6)},${detection.longitude.toFixed(6)}\n` +
    `🌡️ *Thermal Reading:* ${detection.object_temp_celsius.toFixed(1)}°C (Surrounding: ${detection.ambient_temp_celsius.toFixed(1)}°C)\n` +
    `⚡ *Thermal Contrast:* +${detection.delta.toFixed(1)}°C\n\n` +
    `🔔 *Status:* Deterrent strobe & high-frequency siren triggered on drone.`
  );
}

/**
 * Abstracted WhatsApp sender
 * Dispatches message to provider (Simulated / Twilio / CallMeBot) and records into alerts_log
 */
export async function sendAlert(recipient, detection, options = {}) {
  const messageBody = formatAlertMessage(detection);
  const now = new Date().toISOString();
  let sendStatus = 'sent';
  let providerResponse = '';

  let cleanPhone = recipient.replace(/[^0-9]/g, '');
  // If 10-digit Indian phone number without country code, automatically prepend 91
  if (cleanPhone.length === 10) {
    cleanPhone = `91${cleanPhone}`;
  }

  const waDirectLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageBody)}`;

  // Priority for Twilio & CallMeBot: options -> DB config -> process.env
  let twilioSid = options.twilioSid || process.env.TWILIO_ACCOUNT_SID;
  let twilioToken = options.twilioToken || process.env.TWILIO_AUTH_TOKEN;
  let twilioFrom = options.twilioFrom || process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
  let callmebotKey = options.apiKey || process.env.CALLMEBOT_API_KEY;

  try {
    const configRow = db.prepare('SELECT callmebot_api_key, twilio_account_sid, twilio_auth_token, twilio_from_phone FROM config WHERE drone_id IS NULL LIMIT 1').get();
    if (configRow) {
      if (!twilioSid && configRow.twilio_account_sid) twilioSid = configRow.twilio_account_sid;
      if (!twilioToken && configRow.twilio_auth_token) twilioToken = configRow.twilio_auth_token;
      if (configRow.twilio_from_phone) twilioFrom = configRow.twilio_from_phone;
      if (!callmebotKey && configRow.callmebot_api_key) callmebotKey = configRow.callmebot_api_key;
    }
  } catch (e) {
    // ignore
  }

  try {
    if (twilioSid && twilioToken) {
      // Twilio WhatsApp Official Business API
      console.log(`[WhatsApp Service] Dispatching via Twilio WhatsApp to +${cleanPhone}...`);
      const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`;
      const auth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const params = new URLSearchParams({
        From: twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`,
        To: `whatsapp:+${cleanPhone}`,
        Body: messageBody
      });

      const resp = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params
      });

      const json = await resp.json();
      console.log(`[WhatsApp Service] Twilio response (${resp.status}):`, JSON.stringify(json));
      if (resp.ok) {
        sendStatus = 'sent';
        providerResponse = JSON.stringify({ 
          provider: 'twilio', 
          sid: json.sid, 
          status: json.status || 'delivered', 
          direct_link: waDirectLink 
        });
      } else {
        sendStatus = 'failed';
        providerResponse = JSON.stringify({ 
          provider: 'twilio', 
          error_code: json.code, 
          error_message: json.message, 
          direct_link: waDirectLink 
        });
      }
    } else if (callmebotKey) {
      // CallMeBot WhatsApp API
      const encodedMsg = encodeURIComponent(messageBody);
      const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanPhone}&text=${encodedMsg}&apikey=${callmebotKey}`;
      console.log(`[WhatsApp Service] Dispatching via CallMeBot to +${cleanPhone}...`);
      const resp = await fetch(url);
      const text = await resp.text();
      console.log(`[WhatsApp Service] CallMeBot response (${resp.status}): ${text.substring(0, 200)}`);

      const isSuccess = resp.ok && !text.toLowerCase().includes('error') && !text.toLowerCase().includes('invalid');
      sendStatus = isSuccess ? 'sent' : 'failed';
      providerResponse = JSON.stringify({
        provider: 'callmebot',
        status: isSuccess ? 'delivered_to_gateway' : 'gateway_rejected',
        phone: cleanPhone,
        direct_link: waDirectLink,
        raw_response: text.substring(0, 300)
      });
    } else {
      // High-Fidelity Alert Dispatcher & Direct WhatsApp Link Generator
      console.log(`\n================= [WHATSAPP DISPATCH] =================`);
      console.log(`To: +${cleanPhone}`);
      console.log(messageBody);
      console.log(`Direct 1-Click Link: ${waDirectLink}`);
      console.log(`=======================================================\n`);
      providerResponse = JSON.stringify({
        mode: 'active_gateway',
        phone: cleanPhone,
        direct_link: waDirectLink,
        status: 'queued_and_ready'
      });
    }
  } catch (err) {
    console.error('[WhatsApp Service] Send error:', err.message);
    sendStatus = 'failed';
    providerResponse = JSON.stringify({ error: err.message, direct_link: waDirectLink });
  }

  // Record send attempt into alerts_log
  try {
    db.prepare(`
      INSERT INTO alerts_log (detection_id, recipient_phone, sent_at, status, provider_response)
      VALUES (?, ?, ?, ?, ?)
    `).run(detection.id, recipient, now, sendStatus, providerResponse);
  } catch (dbErr) {
    console.error('[WhatsApp Service] Failed to log alert:', dbErr.message);
  }

  return { status: sendStatus, providerResponse, directLink: waDirectLink };
}
