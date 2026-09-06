import express from 'express';
import { db } from '../db/schema.js';

const router = express.Router();

/**
 * GET /api/v1/drones
 * List all registered drones with last seen status and computed stale/offline flag
 */
router.get('/', (req, res) => {
  try {
    const drones = db.prepare('SELECT * FROM drones ORDER BY drone_id ASC').all();
    const now = Date.now();
    const STALE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

    const enhancedDrones = drones.map(drone => {
      const lastSeenTime = drone.last_seen_at ? new Date(drone.last_seen_at).getTime() : 0;
      const isOnline = lastSeenTime > 0 && (now - lastSeenTime <= STALE_THRESHOLD_MS);

      // Count total detections for this drone
      const countRow = db.prepare('SELECT COUNT(*) as count FROM detections WHERE drone_id = ?').get(drone.drone_id);

      return {
        ...drone,
        is_online: isOnline,
        stale_threshold_minutes: 30,
        total_detections: countRow?.count || 0
      };
    });

    return res.json({ data: enhancedDrones });
  } catch (err) {
    console.error('[API] GET /drones error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * GET /api/v1/drones/:drone_id
 * Single drone detail with last detections
 */
router.get('/:drone_id', (req, res) => {
  try {
    const drone = db.prepare('SELECT * FROM drones WHERE drone_id = ?').get(req.params.drone_id);
    if (!drone) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const lastDetections = db.prepare(`
      SELECT * FROM detections WHERE drone_id = ? ORDER BY timestamp DESC LIMIT 5
    `).all(req.params.drone_id);

    return res.json({
      ...drone,
      recent_detections: lastDetections
    });
  } catch (err) {
    console.error('[API] GET /drones/:drone_id error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * PATCH /api/v1/drones/:drone_id
 * Rename drone display name
 */
router.patch('/:drone_id', (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required and must be a string' });
    }

    const info = db.prepare('UPDATE drones SET name = ? WHERE drone_id = ?').run(name.trim(), req.params.drone_id);
    if (info.changes === 0) {
      return res.status(404).json({ error: 'Drone not found' });
    }

    const updated = db.prepare('SELECT * FROM drones WHERE drone_id = ?').get(req.params.drone_id);
    return res.json({ message: 'Drone display name updated', data: updated });
  } catch (err) {
    console.error('[API] PATCH /drones/:drone_id error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

export default router;
