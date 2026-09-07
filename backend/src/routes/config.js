import express from 'express';
import { db } from '../db/schema.js';

const router = express.Router();

/**
 * GET /api/v1/config
 * Retrieve active configuration for a specific drone or global default
 */
router.get('/', (req, res) => {
  try {
    const { drone_id } = req.query;

    if (drone_id) {
      const droneConfig = db.prepare('SELECT * FROM config WHERE drone_id = ?').get(drone_id);
      if (droneConfig) {
        return res.json({ data: droneConfig, scope: 'drone_override' });
      }
    }

    // Global default configuration (drone_id IS NULL)
    let globalConfig = db.prepare('SELECT * FROM config WHERE drone_id IS NULL').get();

    if (!globalConfig) {
      // Create global default if missing
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO config (drone_id, alert_threshold_celsius, dedup_radius_meters, dedup_time_window_minutes, updated_at)
        VALUES (NULL, 8.0, 50.0, 10, ?)
      `).run(now);
      globalConfig = db.prepare('SELECT * FROM config WHERE drone_id IS NULL').get();
    }

    return res.json({ data: globalConfig, scope: 'global' });
  } catch (err) {
    console.error('[API] GET /config error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * PUT /api/v1/config
 * Update configuration thresholds (drone-specific or global)
 */
router.put('/', (req, res) => {
  try {
    const {
      drone_id = null,
      alert_threshold_celsius,
      dedup_radius_meters,
      dedup_time_window_minutes,
      callmebot_api_key = undefined
    } = req.body;

    const threshold = Number(alert_threshold_celsius);
    const radius = Number(dedup_radius_meters);
    const windowMins = parseInt(dedup_time_window_minutes, 10);

    const errors = [];
    if (isNaN(threshold) || threshold <= 0) {
      errors.push('alert_threshold_celsius must be a positive number');
    }
    if (isNaN(radius) || radius <= 0) {
      errors.push('dedup_radius_meters must be a positive number');
    }
    if (isNaN(windowMins) || windowMins <= 0) {
      errors.push('dedup_time_window_minutes must be a positive integer');
    }

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    const now = new Date().toISOString();

    if (drone_id) {
      // Check if drone exists
      const drone = db.prepare('SELECT id FROM drones WHERE drone_id = ?').get(drone_id);
      if (!drone) {
        return res.status(404).json({ error: `Drone ${drone_id} does not exist` });
      }

      const existing = db.prepare('SELECT id, callmebot_api_key FROM config WHERE drone_id = ?').get(drone_id);
      const apiKeyToSave = callmebot_api_key !== undefined ? (callmebot_api_key ? callmebot_api_key.trim() : null) : existing?.callmebot_api_key;
      if (existing) {
        db.prepare(`
          UPDATE config 
          SET alert_threshold_celsius = ?, dedup_radius_meters = ?, dedup_time_window_minutes = ?, callmebot_api_key = ?, updated_at = ?
          WHERE drone_id = ?
        `).run(threshold, radius, windowMins, apiKeyToSave, now, drone_id);
      } else {
        db.prepare(`
          INSERT INTO config (drone_id, alert_threshold_celsius, dedup_radius_meters, dedup_time_window_minutes, callmebot_api_key, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(drone_id, threshold, radius, windowMins, apiKeyToSave, now);
      }
    } else {
      // Global config
      const existing = db.prepare('SELECT id, callmebot_api_key FROM config WHERE drone_id IS NULL').get();
      const apiKeyToSave = callmebot_api_key !== undefined ? (callmebot_api_key ? callmebot_api_key.trim() : null) : existing?.callmebot_api_key;
      if (existing) {
        db.prepare(`
          UPDATE config 
          SET alert_threshold_celsius = ?, dedup_radius_meters = ?, dedup_time_window_minutes = ?, callmebot_api_key = ?, updated_at = ?
          WHERE drone_id IS NULL
        `).run(threshold, radius, windowMins, apiKeyToSave, now);
      } else {
        db.prepare(`
          INSERT INTO config (drone_id, alert_threshold_celsius, dedup_radius_meters, dedup_time_window_minutes, callmebot_api_key, updated_at)
          VALUES (NULL, ?, ?, ?, ?, ?)
        `).run(threshold, radius, windowMins, apiKeyToSave, now);
      }
    }

    const updated = drone_id
      ? db.prepare('SELECT * FROM config WHERE drone_id = ?').get(drone_id)
      : db.prepare('SELECT * FROM config WHERE drone_id IS NULL').get();

    return res.json({
      message: 'Configuration saved successfully',
      data: updated
    });
  } catch (err) {
    console.error('[API] PUT /config error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

export default router;
