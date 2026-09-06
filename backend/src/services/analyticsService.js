import { db } from '../db/schema.js';

/**
 * Compute analytics summary including daily counts, hourly night distribution, and false-alarm metrics
 */
export function getAnalyticsSummary(from, to) {
  let whereClause = 'WHERE 1=1';
  const params = [];

  if (from) {
    whereClause += ' AND timestamp >= ?';
    params.push(from);
  }
  if (to) {
    whereClause += ' AND timestamp <= ?';
    params.push(to);
  }

  // 1. Total detections
  const totalRow = db.prepare(`SELECT COUNT(*) as count FROM detections ${whereClause}`).get(...params);
  const totalDetections = totalRow?.count || 0;

  // 2. Confirmed candidates
  const candidatesRow = db.prepare(`
    SELECT COUNT(*) as count FROM detections ${whereClause} AND status = 'confirmed_candidate'
  `).get(...params);
  const confirmedCandidates = candidatesRow?.count || 0;

  // 3. False alarm rate calculation from reviewed statuses
  const reviewedCounts = db.prepare(`
    SELECT 
      SUM(CASE WHEN reviewed_status = 'false_alarm' THEN 1 ELSE 0 END) as false_alarms,
      SUM(CASE WHEN reviewed_status = 'confirmed_real' THEN 1 ELSE 0 END) as confirmed_reals,
      SUM(CASE WHEN reviewed_status = 'unreviewed' THEN 1 ELSE 0 END) as unreviewed
    FROM detections ${whereClause}
  `).get(...params);

  const falseAlarms = reviewedCounts?.false_alarms || 0;
  const confirmedReals = reviewedCounts?.confirmed_reals || 0;
  const reviewedTotal = falseAlarms + confirmedReals;
  const falseAlarmRate = reviewedTotal > 0 ? Math.round((falseAlarms / reviewedTotal) * 1000) / 10 : 0;

  // 4. Detections grouped by Day (YYYY-MM-DD)
  const daysRows = db.prepare(`
    SELECT 
      substr(timestamp, 1, 10) as date,
      COUNT(*) as count,
      SUM(CASE WHEN status = 'confirmed_candidate' THEN 1 ELSE 0 END) as candidates,
      SUM(CASE WHEN status = 'below_threshold' THEN 1 ELSE 0 END) as below
    FROM detections ${whereClause}
    GROUP BY substr(timestamp, 1, 10)
    ORDER BY date ASC
  `).all(...params);

  const detectionsPerDay = daysRows.map(r => ({
    date: r.date,
    total: r.count,
    confirmed_candidates: r.candidates || 0,
    below_threshold: r.below || 0
  }));

  // 5. Detections by hour of night / day (00 to 23)
  const hourRows = db.prepare(`
    SELECT 
      cast(substr(timestamp, 12, 2) as integer) as hour,
      COUNT(*) as count,
      SUM(CASE WHEN status = 'confirmed_candidate' THEN 1 ELSE 0 END) as candidates
    FROM detections ${whereClause}
    GROUP BY hour
    ORDER BY hour ASC
  `).all(...params);

  // Fill in all 24 hours so chart has full continuous distribution
  const hourMap = new Map(hourRows.map(r => [r.hour, r]));
  const detectionsByHour = [];
  for (let h = 0; h < 24; h++) {
    const data = hourMap.get(h);
    const hourLabel = `${h.toString().padStart(2, '0')}:00`;
    detectionsByHour.push({
      hour: h,
      label: hourLabel,
      is_nocturnal: h >= 20 || h <= 5, // 8 PM to 5 AM nocturnal window
      count: data?.count || 0,
      candidates: data?.candidates || 0
    });
  }

  return {
    total_detections: totalDetections,
    confirmed_candidates: confirmedCandidates,
    reviewed_stats: {
      false_alarms: falseAlarms,
      confirmed_reals: confirmedReals,
      unreviewed: reviewedCounts?.unreviewed || 0
    },
    false_alarm_rate: falseAlarmRate, // in %
    detections_per_day: detectionsPerDay,
    detections_by_hour: detectionsByHour
  };
}
