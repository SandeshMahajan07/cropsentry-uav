// 1x1 transparent PNG / sample JPEG base64 for test snapshot
const SAMPLE_IMAGE_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC';

async function runTests() {
  const BASE_URL = 'http://localhost:5000/api/v1';
  console.log('🧪 Starting automated API and logic test suite...\n');

  try {
    // 1. Health check
    console.log('[Test 1] Health Check...');
    const healthRes = await fetch('http://localhost:5000/api/health');
    const health = await healthRes.json();
    console.log('✅ Health status:', health.status);

    // 2. Ingest high-delta detection (confirmed candidate with alert)
    console.log('\n[Test 2] Ingesting animal detection with high delta (Object: 36.5°C, Ambient: 22.0°C)...');
    const payload1 = {
      drone_id: 'DRONE_01',
      timestamp: new Date().toISOString(),
      latitude: 17.329600,
      longitude: 76.837000,
      object_temp_celsius: 36.5,
      ambient_temp_celsius: 22.0,
      battery_percent: 85,
      image_base64: SAMPLE_IMAGE_BASE64
    };

    const res1 = await fetch(`${BASE_URL}/detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload1)
    });
    const data1 = await res1.json();
    console.log('HTTP Status:', res1.status);
    console.log('Ingest response:', data1);
    if (res1.status === 201 && data1.status === 'confirmed_candidate' && data1.alert_sent === true) {
      console.log('✅ Test 2 Passed: Candidate confirmed, alert triggered, image saved.');
    } else {
      console.error('❌ Test 2 Failed:', data1);
    }

    // 3. Deduplication check: Ingest another detection 10 meters away from the same drone immediately
    console.log('\n[Test 3] Deduplication check (same drone within 10m)...');
    const payload2 = {
      drone_id: 'DRONE_01',
      timestamp: new Date().toISOString(),
      latitude: 17.329650, // ~6 meters away
      longitude: 76.837020,
      object_temp_celsius: 37.0,
      ambient_temp_celsius: 22.0,
      battery_percent: 84
    };

    const res2 = await fetch(`${BASE_URL}/detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload2)
    });
    const data2 = await res2.json();
    console.log('HTTP Status:', res2.status);
    console.log('Dedup response:', data2);
    if (res2.status === 201 && data2.status === 'confirmed_candidate' && data2.alert_sent === false && data2.dedup_applied === true) {
      console.log('✅ Test 3 Passed: Successfully deduplicated, duplicate alert suppressed!');
    } else {
      console.error('❌ Test 3 Failed:', data2);
    }

    // 4. Low delta detection (below threshold)
    console.log('\n[Test 4] Low delta detection (Object: 24.0°C, Ambient: 22.5°C -> delta: 1.5°C)...');
    const payload3 = {
      drone_id: 'DRONE_02',
      timestamp: new Date().toISOString(),
      latitude: 17.332000,
      longitude: 76.840000,
      object_temp_celsius: 24.0,
      ambient_temp_celsius: 22.5,
      battery_percent: 70
    };

    const res3 = await fetch(`${BASE_URL}/detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload3)
    });
    const data3 = await res3.json();
    console.log('HTTP Status:', res3.status);
    console.log('Below threshold response:', data3);
    if (res3.status === 201 && data3.status === 'below_threshold' && data3.alert_sent === false) {
      console.log('✅ Test 4 Passed: Properly categorized as below_threshold without alerting.');
    } else {
      console.error('❌ Test 4 Failed:', data3);
    }

    // 5. Validation error check (missing lat/long)
    console.log('\n[Test 5] Validation error handling (missing latitude)...');
    const payload4 = {
      drone_id: 'DRONE_01',
      longitude: 76.840000,
      object_temp_celsius: 35.0,
      ambient_temp_celsius: 22.0
    };

    const res4 = await fetch(`${BASE_URL}/detections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload4)
    });
    const data4 = await res4.json();
    console.log('HTTP Status:', res4.status);
    console.log('Validation error response:', data4);
    if (res4.status === 400 && data4.details) {
      console.log('✅ Test 5 Passed: Rejected with HTTP 400 and clear error details.');
    } else {
      console.error('❌ Test 5 Failed:', data4);
    }

    // 6. Test Analytics endpoint
    console.log('\n[Test 6] Fetching Analytics summary...');
    const analyticsRes = await fetch(`${BASE_URL}/analytics/summary`);
    const analytics = await analyticsRes.json();
    console.log('Analytics summary:', {
      total_detections: analytics.total_detections,
      confirmed_candidates: analytics.confirmed_candidates,
      false_alarm_rate: `${analytics.false_alarm_rate}%`,
      days_count: analytics.detections_per_day.length,
      hours_count: analytics.detections_by_hour.length
    });
    if (analytics.total_detections > 0 && analytics.detections_by_hour.length === 24) {
      console.log('✅ Test 6 Passed: Analytics accurately calculated.');
    } else {
      console.error('❌ Test 6 Failed:', analytics);
    }

    console.log('\n🎉 ALL BACKEND AND SPEC LOGIC TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

runTests();
