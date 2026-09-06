import express from 'express';
import { db } from '../db/schema.js';
import { sendAlert } from '../services/whatsappService.js';

const router = express.Router();

/**
 * GET /api/v1/recipients
 * List all alert recipients
 */
router.get('/', (req, res) => {
  try {
    const rows = db.prepare('SELECT * FROM alert_recipients ORDER BY id ASC').all();
    return res.json({ data: rows });
  } catch (err) {
    console.error('[API] GET /recipients error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * POST /api/v1/recipients
 * Add a new alert recipient
 */
router.post('/', (req, res) => {
  try {
    const { name, phone_number, active = 1 } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'name is required and must be a non-empty string' });
    }
    if (!phone_number || typeof phone_number !== 'string' || !phone_number.trim()) {
      return res.status(400).json({ error: 'phone_number is required and must be a non-empty string' });
    }

    const insert = db.prepare(`
      INSERT INTO alert_recipients (name, phone_number, active)
      VALUES (?, ?, ?)
    `);

    const result = insert.run(name.trim(), phone_number.trim(), active ? 1 : 0);
    const created = db.prepare('SELECT * FROM alert_recipients WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({
      message: 'Alert recipient added',
      data: created
    });
  } catch (err) {
    console.error('[API] POST /recipients error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * POST /api/v1/recipients/test-alert
 * Trigger an instant test WhatsApp alert to any user-inputted phone number
 */
router.post('/test-alert', async (req, res) => {
  try {
    const { phone_number = '+91 6360911344' } = req.body;
    const cleanPhone = phone_number.replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please provide a valid phone number (at least 10 digits)' });
    }

    // Auto-register recipient in database if not present
    const existing = db.prepare('SELECT id FROM alert_recipients WHERE phone_number LIKE ?').get(`%${cleanPhone.slice(-10)}%`);
    if (!existing) {
      db.prepare(`
        INSERT INTO alert_recipients (name, phone_number, active)
        VALUES (?, ?, 1)
      `).run(`Farmer (${cleanPhone})`, phone_number);
    }

    // Get latest detection or fallback
    let latest = db.prepare('SELECT * FROM detections ORDER BY id DESC LIMIT 1').get();
    if (!latest) {
      latest = {
        id: 1,
        drone_id: 'CROPSENTRY_01',
        timestamp: new Date().toISOString(),
        latitude: 17.329700,
        longitude: 76.837100,
        object_temp_celsius: 37.2,
        ambient_temp_celsius: 22.0,
        delta: 15.2
      };
    }

    const dispatchResult = await sendAlert(phone_number, latest);

    const messageText = 
      `🚨 *WILD ANIMAL DETECTED!* — CropSentry UAV\n\n` +
      `📅 *Time:* ${new Date(latest.timestamp).toLocaleTimeString('en-IN')} (IST)\n` +
      `📍 *Location:* ${latest.latitude.toFixed(6)}, ${latest.longitude.toFixed(6)}\n` +
      `🗺️ *View on Google Maps:* https://www.google.com/maps?q=${latest.latitude.toFixed(6)},${latest.longitude.toFixed(6)}\n` +
      `🌡️ *Thermal Reading:* ${latest.object_temp_celsius}°C (Ambient: ${latest.ambient_temp_celsius}°C)\n` +
      `⚡ *Contrast ΔT:* +${latest.delta}°C\n` +
      `🔔 *Deterrent Status:* Strobe & 110dB Acoustic Siren Fired on Drone.`;

    const directWaLink = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

    return res.json({
      message: `Alert dispatched to +${cleanPhone}`,
      phone: phone_number,
      clean_phone: cleanPhone,
      status: dispatchResult.status,
      direct_whatsapp_url: directWaLink,
      message_body: messageText,
      details: dispatchResult.providerResponse
    });
  } catch (err) {
    console.error('[API] POST /recipients/test-alert error:', err);
    return res.status(500).json({ error: 'Failed to send alert simulation', message: err.message });
  }
});

/**
 * DELETE /api/v1/recipients/:id
 * Remove an alert recipient
 */
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const info = db.prepare('DELETE FROM alert_recipients WHERE id = ?').run(id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    return res.json({ message: 'Recipient deleted successfully' });
  } catch (err) {
    console.error('[API] DELETE /recipients/:id error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

export default router;
