import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { db } from '../db/schema.js';
import { sendAlert } from './whatsappService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in meters
 */
export function haversineDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Decode and save base64 image string to disk
 */
export function saveBase64Image(base64Str) {
  if (!base64Str || typeof base64Str !== 'string') return null;

  try {
    // Strip data URL header if present (e.g. data:image/jpeg;base64,)
    const cleanBase64 = base64Str.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const filename = `snap_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[DetectionService] Failed to save image:', err.message);
    return null;
  }
}

/**
 * Fetch dynamic active thresholds for a given drone (per-drone or global default)
 */
export function getActiveConfig(droneId) {
  // Check for drone-specific config first
  let config = db.prepare('SELECT * FROM config WHERE drone_id = ?').get(droneId);
  if (!config) {
    // Fall back to global default (drone_id IS NULL)
    config = db.prepare('SELECT * FROM config WHERE drone_id IS NULL').get();
  }

  // Fallback defaults if table is empty
  return {
    alert_threshold_celsius: config?.alert_threshold_celsius ?? 8.0,
    dedup_radius_meters: config?.dedup_radius_meters ?? 50.0,
    dedup_time_window_minutes: config?.dedup_time_window_minutes ?? 10
  };
}

/**
 * Check if a recent detection already triggered an alert within radius & time window
 */
export function isDeduplicated(droneId, lat, lng, timestampStr, radiusMeters, timeWindowMinutes) {
  const eventTime = new Date(timestampStr).getTime();
  const windowStart = new Date(eventTime - timeWindowMinutes * 60 * 1000).toISOString();
  const windowEnd = new Date(eventTime + timeWindowMinutes * 60 * 1000).toISOString();

  // Find all detections from this drone within time window where alert_sent = 1
  const recentAlerts = db.prepare(`
    SELECT latitude, longitude, timestamp FROM detections
    WHERE drone_id = ? AND alert_sent = 1 AND timestamp BETWEEN ? AND ?
  `).all(droneId, windowStart, windowEnd);

  for (const prev of recentAlerts) {
    const dist = haversineDistanceMeters(lat, lng, prev.latitude, prev.longitude);
    if (dist <= radiusMeters) {
      return true; // Already alerted nearby within time window
    }
  }

  return false;
}

/**
 * Main ingestion & processing pipeline
 */
export async function processDetection(data) {
  // 1. Validation
  const errors = [];
  if (!data.drone_id || typeof data.drone_id !== 'string') {
    errors.push('drone_id is required and must be a string');
  }

  const lat = Number(data.latitude);
  const lng = Number(data.longitude);
  if (data.latitude === undefined || data.latitude === null || isNaN(lat)) {
    errors.push('latitude is required and must be a valid number');
  }
  if (data.longitude === undefined || data.longitude === null || isNaN(lng)) {
    errors.push('longitude is required and must be a valid number');
  }

  const objTemp = Number(data.object_temp_celsius);
  const ambTemp = Number(data.ambient_temp_celsius);
  if (data.object_temp_celsius === undefined || data.object_temp_celsius === null || isNaN(objTemp)) {
    errors.push('object_temp_celsius is required and must be a valid number');
  }
  if (data.ambient_temp_celsius === undefined || data.ambient_temp_celsius === null || isNaN(ambTemp)) {
    errors.push('ambient_temp_celsius is required and must be a valid number');
  }

  if (errors.length > 0) {
    return { success: false, statusCode: 400, errors };
  }

  // 2. Timestamp handling: stamp server time if missing or invalid
  let timestamp = data.timestamp;
  if (!timestamp || isNaN(new Date(timestamp).getTime())) {
    timestamp = new Date().toISOString();
  }

  // 3. Battery percent (optional, null if absent)
  let batteryPercent = null;
  if (data.battery_percent !== undefined && data.battery_percent !== null && !isNaN(Number(data.battery_percent))) {
    batteryPercent = Math.max(0, Math.min(100, Math.round(Number(data.battery_percent))));
  }

  // 4. Decode base64 image if present
  let imageUrl = null;
  if (data.image_base64) {
    imageUrl = saveBase64Image(data.image_base64);
  }

  // 5. Server-side Delta Calculation (Do not trust client)
  const delta = Math.round((objTemp - ambTemp) * 10) / 10;

  // 6. Fetch dynamic configuration
  const config = getActiveConfig(data.drone_id);

  // 7. Decision logic & Deduplication
  let status = 'below_threshold';
  let alertSent = false;
  let dedupTriggered = false;

  if (delta >= config.alert_threshold_celsius) {
    status = 'confirmed_candidate';
    
    // Check deduplication
    dedupTriggered = isDeduplicated(
      data.drone_id,
      lat,
      lng,
      timestamp,
      config.dedup_radius_meters,
      config.dedup_time_window_minutes
    );

    if (!dedupTriggered) {
      alertSent = true;
    }
  }

  const createdAt = new Date().toISOString();

  // 8. Upsert Drone record in drones table
  const existingDrone = db.prepare('SELECT id FROM drones WHERE drone_id = ?').get(data.drone_id);
  if (!existingDrone) {
    db.prepare(`
      INSERT INTO drones (drone_id, name, last_seen_at, last_known_lat, last_known_lng, last_battery_percent)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(data.drone_id, `Drone ${data.drone_id}`, timestamp, lat, lng, batteryPercent);
  } else {
    db.prepare(`
      UPDATE drones 
      SET last_seen_at = ?, last_known_lat = ?, last_known_lng = ?, last_battery_percent = COALESCE(?, last_battery_percent)
      WHERE drone_id = ?
    `).run(timestamp, lat, lng, batteryPercent, data.drone_id);
  }

  // 9. Save Detection to database
  const insertDetection = db.prepare(`
    INSERT INTO detections 
    (drone_id, timestamp, latitude, longitude, object_temp_celsius, ambient_temp_celsius, delta, image_url, status, alert_sent, reviewed_status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'unreviewed', ?)
  `);

  const result = insertDetection.run(
    data.drone_id,
    timestamp,
    lat,
    lng,
    objTemp,
    ambTemp,
    delta,
    imageUrl,
    status,
    alertSent ? 1 : 0,
    createdAt
  );

  const newDetectionId = result.lastInsertRowid;
  const savedRecord = {
    id: newDetectionId,
    drone_id: data.drone_id,
    timestamp,
    latitude: lat,
    longitude: lng,
    object_temp_celsius: objTemp,
    ambient_temp_celsius: ambTemp,
    delta,
    image_url: imageUrl,
    status,
    alert_sent: alertSent,
    reviewed_status: 'unreviewed',
    created_at: createdAt
  };

  // 10. Dispatch WhatsApp alerts asynchronously if triggered
  if (alertSent) {
    const activeRecipients = db.prepare('SELECT phone_number FROM alert_recipients WHERE active = 1').all();
    for (const recipient of activeRecipients) {
      // Non-blocking sendAlert
      sendAlert(recipient.phone_number, savedRecord).catch((err) => {
        console.error('[DetectionService] Error sending alert to', recipient.phone_number, err);
      });
    }
  }

  return {
    success: true,
    statusCode: 201,
    data: {
      id: newDetectionId,
      status,
      delta,
      alert_sent: alertSent,
      dedup_applied: dedupTriggered,
      active_threshold: config.alert_threshold_celsius,
      image_url: imageUrl
    }
  };
}
