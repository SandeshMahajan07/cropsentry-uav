import express from 'express';
import { getAnalyticsSummary } from '../services/analyticsService.js';

const router = express.Router();

/**
 * GET /api/v1/analytics/summary
 * Fetch summary statistics, charts, and false-alarm rates with optional date filtering
 */
router.get('/summary', (req, res) => {
  try {
    const { from, to } = req.query;
    const summary = getAnalyticsSummary(from, to);
    return res.json(summary);
  } catch (err) {
    console.error('[API] GET /analytics/summary error:', err);
    return res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

export default router;
