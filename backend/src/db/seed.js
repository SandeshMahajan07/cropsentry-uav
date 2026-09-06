import { db, initializeDatabase } from './schema.js';

export function seedData() {
  initializeDatabase();

  // Reset or ensure single drone: CropSentry-01
  db.prepare(`
    INSERT INTO drones (drone_id, name, last_seen_at, last_known_lat, last_known_lng, last_battery_percent)
    VALUES ('CROPSENTRY_01', 'CropSentry Falcon-1 (Night Patrol)', ?, 17.329500, 76.836900, 84)
    ON CONFLICT(drone_id) DO UPDATE SET
      name = 'CropSentry Falcon-1 (Night Patrol)',
      last_battery_percent = 84
  `).run(new Date().toISOString());

  // Ensure global config
  const existingConfig = db.prepare('SELECT COUNT(*) as count FROM config WHERE drone_id IS NULL').get();
  if (existingConfig.count === 0) {
    db.prepare(`
      INSERT INTO config (drone_id, alert_threshold_celsius, dedup_radius_meters, dedup_time_window_minutes, updated_at)
      VALUES (NULL, 8.0, 50.0, 10, ?)
    `).run(new Date().toISOString());
  }

  // Ensure User's Phone Number (+91 6360911344) is registered as primary alert recipient
  const userRecipient = db.prepare('SELECT id FROM alert_recipients WHERE phone_number LIKE ?').get('%6360911344%');
  if (!userRecipient) {
    db.prepare(`
      INSERT INTO alert_recipients (name, phone_number, active)
      VALUES ('Primary Field Owner', '+91 6360911344', 1)
    `).run();
    console.log('[Seed] Added user phone +91 6360911344 to alert recipients.');
  }

  // Seed sample detections for CROPSENTRY_01 if empty
  const detectionCount = db.prepare("SELECT COUNT(*) as count FROM detections WHERE drone_id = 'CROPSENTRY_01'").get();
  if (detectionCount.count === 0) {
    const insertDetection = db.prepare(`
      INSERT INTO detections 
      (drone_id, timestamp, latitude, longitude, object_temp_celsius, ambient_temp_celsius, delta, image_url, status, alert_sent, reviewed_status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertAlertLog = db.prepare(`
      INSERT INTO alerts_log (detection_id, recipient_phone, sent_at, status, provider_response)
      VALUES (?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    const mockEvents = [
      { hoursAgo: 0.5, lat: 17.32955, lng: 76.83695, obj: 37.2, amb: 22.0, status: 'confirmed_candidate', alert: 1, reviewed: 'confirmed_real' },
      { hoursAgo: 2.0, lat: 17.32980, lng: 76.83730, obj: 24.5, amb: 22.2, status: 'below_threshold', alert: 0, reviewed: 'unreviewed' },
      { hoursAgo: 4.5, lat: 17.32940, lng: 76.83660, obj: 36.5, amb: 21.8, status: 'confirmed_candidate', alert: 1, reviewed: 'confirmed_real' },
      { hoursAgo: 7.0, lat: 17.33010, lng: 76.83780, obj: 31.0, amb: 22.5, status: 'confirmed_candidate', alert: 1, reviewed: 'false_alarm' },
      { hoursAgo: 11.5, lat: 17.32910, lng: 76.83620, obj: 23.0, amb: 21.5, status: 'below_threshold', alert: 0, reviewed: 'unreviewed' },
      { hoursAgo: 18.0, lat: 17.32970, lng: 76.83710, obj: 36.8, amb: 22.0, status: 'confirmed_candidate', alert: 1, reviewed: 'confirmed_real' }
    ];

    for (const ev of mockEvents) {
      const time = new Date(now - ev.hoursAgo * 60 * 60 * 1000).toISOString();
      const delta = Math.round((ev.obj - ev.amb) * 10) / 10;
      
      const res = insertDetection.run(
        'CROPSENTRY_01',
        time,
        ev.lat,
        ev.lng,
        ev.obj,
        ev.amb,
        delta,
        null,
        ev.status,
        ev.alert,
        ev.reviewed,
        time
      );

      if (ev.alert === 1) {
        insertAlertLog.run(
          res.lastInsertRowid,
          '+91 6360911344',
          time,
          'sent',
          '{"status":"delivered","phone":"+916360911344"}'
        );
      }
    }
  }

  console.log('[Seed] Database initialization and single-drone sync complete.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedData();
}
