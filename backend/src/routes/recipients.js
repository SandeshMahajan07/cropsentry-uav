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
    const { phone_number = '+91 6360911344', callmebot_api_key } = req.body;
    let cleanPhone = phone_number.replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please provide a valid phone number (at least 10 digits)' });
    }

    if (cleanPhone.length === 10) {
      cleanPhone = `91${cleanPhone}`;
    }

    // Save CallMeBot API Key to database config if provided
    if (callmebot_api_key && typeof callmebot_api_key === 'string' && callmebot_api_key.trim()) {
      const trimmedKey = callmebot_api_key.trim();
      const existingConfig = db.prepare('SELECT id FROM config WHERE drone_id IS NULL').get();
      const now = new Date().toISOString();
      if (existingConfig) {
        db.prepare('UPDATE config SET callmebot_api_key = ?, updated_at = ? WHERE drone_id IS NULL').run(trimmedKey, now);
      } else {
        db.prepare(`
          INSERT INTO config (drone_id, alert_threshold_celsius, dedup_radius_meters, dedup_time_window_minutes, callmebot_api_key, updated_at)
          VALUES (NULL, 8.0, 50.0, 10, ?, ?)
        `).run(trimmedKey, now);
      }
    }

    // Auto-register recipient in database if not present
    const existing = db.prepare('SELECT id FROM alert_recipients WHERE phone_number LIKE ?').get(`%${cleanPhone.slice(-10)}%`);
    if (!existing) {
      db.prepare(`
        INSERT INTO alert_recipients (name, phone_number, active)
        VALUES (?, ?, 1)
      `).run(`Primary Field Owner (+${cleanPhone})`, `+${cleanPhone}`);
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

    const dispatchResult = await sendAlert(
      phone_number, 
      latest, 
      callmebot_api_key ? { apiKey: callmebot_api_key.trim() } : {}
    );

    let parsedDetails = {};
    try {
      parsedDetails = JSON.parse(dispatchResult.providerResponse || '{}');
    } catch (e) {
      parsedDetails = { raw: dispatchResult.providerResponse };
    }

    return res.json({
      message: dispatchResult.status === 'sent' 
        ? `Alert successfully dispatched to +${cleanPhone}` 
        : `Alert dispatch failed to gateway for +${cleanPhone}`,
      phone: phone_number,
      clean_phone: cleanPhone,
      status: dispatchResult.status,
      direct_whatsapp_url: dispatchResult.directLink,
      details: parsedDetails
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
