import express from 'express';
import { db } from '../db/schema.js';
import { processDetection } from '../services/detectionService.js';

const router = express.Router();

/**
 * POST /api/v1/detections
 * Ingest telemetry & detection from ESP32 hardware or simulator
 */
router.post('/', async (req, res) => {
  try {
    const result = await processDetection(req.body);
    if (!result.success) {
      return res.status(result.statusCode).json({
        error: 'Validation failed',
        details: result.errors
      });
    }

    return res.status(201).json({
      message: 'Detection accepted and processed',
      id: result.data.id,
      status: result.data.status,
      delta: result.data.delta,
      alert_sent: result.data.alert_sent,
      dedup_applied: result.data.dedup_applied,
      image_url: result.data.image_url
    });
  } catch (err) {
    console.error('[API] POST /detections error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * GET /api/v1/detections
 * Paginated and filtered list of detections
 */
router.get('/', (req, res) => {
  try {
    const {
      drone_id,
      from,
      to,
      status,
      reviewed_status,
      page = 1,
      limit = 50
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(200, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (drone_id) {
      whereClause += ' AND drone_id = ?';
      params.push(drone_id);
    }
    if (from) {
      whereClause += ' AND timestamp >= ?';
      params.push(from);
    }
    if (to) {
      whereClause += ' AND timestamp <= ?';
      params.push(to);
    }
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (reviewed_status) {
      whereClause += ' AND reviewed_status = ?';
      params.push(reviewed_status);
    }

    const countRow = db.prepare(`SELECT COUNT(*) as count FROM detections ${whereClause}`).get(...params);
    const total = countRow?.count || 0;

    const rows = db.prepare(`
      SELECT * FROM detections 
      ${whereClause} 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `).all(...params, limitNum, offset);

    return res.json({
      data: rows,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (err) {
    console.error('[API] GET /detections error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * GET /api/v1/detections/:id
 * Retrieve single detection record along with its alert dispatch logs
 */
router.get('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const detection = db.prepare('SELECT * FROM detections WHERE id = ?').get(id);

    if (!detection) {
      return res.status(404).json({ error: 'Detection not found' });
    }

    const alerts = db.prepare('SELECT * FROM alerts_log WHERE detection_id = ? ORDER BY sent_at DESC').all(id);

    return res.json({
      ...detection,
      alerts
    });
  } catch (err) {
    console.error('[API] GET /detections/:id error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

/**
 * PATCH /api/v1/detections/:id
 * Update reviewed_status ('unreviewed' | 'confirmed_real' | 'false_alarm')
 */
router.patch('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { reviewed_status } = req.body;

    const allowedStatuses = ['unreviewed', 'confirmed_real', 'false_alarm'];
    if (!allowedStatuses.includes(reviewed_status)) {
      return res.status(400).json({
        error: `Invalid reviewed_status. Must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const info = db.prepare(`
      UPDATE detections SET reviewed_status = ? WHERE id = ?
    `).run(reviewed_status, id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Detection not found' });
    }

    const updated = db.prepare('SELECT * FROM detections WHERE id = ?').get(id);
    return res.json({ message: 'Reviewed status updated', data: updated });
  } catch (err) {
    console.error('[API] PATCH /detections/:id error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

export default router;
