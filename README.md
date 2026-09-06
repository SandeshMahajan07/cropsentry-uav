# Nocturnal Animal Detection & Deterrent Drone System (Agri-Shield)

An intelligent, low-cost UAV surveillance and wildlife deterrence system engineered for agricultural crop protection against nocturnal animal raids (wild boars, deer, elephants, stray cattle).

---

## 1. System Architecture

```
                 +----------------------------------------------------+
                 |                   DRONE PAYLOAD                    |
                 |  - ESP32-WROOM / ESP32-CAM                         |
                 |  - MLX90614 Infrared Contactless Temp Sensor      |
                 |  - NEO-6M GPS Module (Lat, Lng)                    |
                 |  - Deterrent Relay (High-dB Buzzer & Strobe Light) |
                 +-------------------------+--------------------------+
                                           | HTTP POST /api/v1/detections
                                           v
                 +----------------------------------------------------+
                 |               BACKEND GROUND SERVER                |
                 |  - Node.js & Express (Port 5000)                   |
                 |  - Native SQLite (Zero-config relational database) |
                 |  - Delta T Computation: T_obj - T_amb              |
                 |  - Spatial Deduplication (Haversine Formula)       |
                 |  - Abstracted WhatsApp Notification Engine         |
                 +-------------------------+--------------------------+
                                           | REST APIs
                                           v
                 +----------------------------------------------------+
                 |               FARMER WEB DASHBOARD                 |
                 |  - React + Vite + Tailwind CSS                     |
                 |  - Leaflet GIS Drone & Detection Map               |
                 |  - Recharts Nocturnal Hourly Activity Analytics    |
                 |  - Dynamic Thresholds & Emergency Alert Contacts   |
                 +----------------------------------------------------+
```

---

## 2. Quick Start Instructions

### Prerequisites
- Node.js (v20+ or v24+)
- npm

### 1. Start the Backend Server
```bash
cd d:\drone\backend
npm start
```
* Backend runs at: `http://localhost:5000`
* Ingestion Endpoint: `POST http://localhost:5000/api/v1/detections`
* Health Check: `GET http://localhost:5000/api/health`

### 2. Start the Frontend Dashboard
```bash
cd d:\drone\frontend
npm run dev
```
* Dashboard URL: `http://localhost:5173`

### 3. Run the Ingestion Test Suite
```bash
cd d:\drone
node simulator/test_ingest.js
```

---

## 3. API Contract Reference

### Ingest Detection (from ESP32 or Simulator)
`POST /api/v1/detections`
```json
{
  "drone_id": "DRONE_01",
  "timestamp": "2026-09-06T23:14:02Z",
  "latitude": 17.329500,
  "longitude": 76.836900,
  "object_temp_celsius": 36.8,
  "ambient_temp_celsius": 22.4,
  "battery_percent": 78,
  "image_base64": "<optional_base64_jpeg>"
}
```

**Response (201 Created):**
```json
{
  "message": "Detection accepted and processed",
  "id": 14,
  "status": "confirmed_candidate",
  "delta": 14.4,
  "alert_sent": true,
  "dedup_applied": false,
  "image_url": "/uploads/snap_1788713122.jpg"
}
```

---

## 4. WhatsApp Alert Integration

The system formats emergency alerts with clickable Google Maps links:
```
🚨 Animal Detected — DRONE_01
Time: Sep 6, 2026, 11:14:02 PM UTC
Location: 17.329500, 76.836900
View on map: https://www.google.com/maps?q=17.329500,76.836900
Temp reading: 36.8°C (ambient: 22.4°C)
```

### Provider Configuration in `.env`:
- **Simulated Mode (Default):** Runs immediately for demos without requiring paid credentials. Full dispatch records are saved in the `alerts_log` database table.
- **CallMeBot (Free):** Set `CALLMEBOT_API_KEY=your_key` in `backend/.env`.
- **Twilio:** Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in `backend/.env`.

---

## 5. Sample ESP32 Firmware Sketch (Arduino C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <Adafruit_MLX90614.h>
#include <TinyGPS++.h>

const char* ssid = "YOUR_WIFI_HOTSPOT";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "http://YOUR_LAPTOP_IP:5000/api/v1/detections";

Adafruit_MLX90614 mlx = Adafruit_MLX90614();
TinyGPSPlus gps;
HardwareSerial gpsSerial(2); // GPIO 16 (RX), GPIO 17 (TX)

const int BUZZER_PIN = 12;
const int STROBE_PIN = 13;

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17);
  mlx.begin();

  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(STROBE_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  digitalWrite(STROBE_PIN, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
}

void loop() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  float objTemp = mlx.readObjectTempC();
  float ambTemp = mlx.readAmbientTempC();
  float delta = objTemp - ambTemp;

  // Local deterrent activation if heat anomaly detected
  if (delta >= 8.0) {
    digitalWrite(BUZZER_PIN, HIGH);
    digitalWrite(STROBE_PIN, HIGH);
    delay(1000);
    digitalWrite(BUZZER_PIN, LOW);
    digitalWrite(STROBE_PIN, LOW);
  }

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"drone_id\":\"DRONE_01\",";
    json += "\"latitude\":" + String(gps.location.isValid() ? gps.location.lat() : 17.329500, 6) + ",";
    json += "\"longitude\":" + String(gps.location.isValid() ? gps.location.lng() : 76.836900, 6) + ",";
    json += "\"object_temp_celsius\":" + String(objTemp, 1) + ",";
    json += "\"ambient_temp_celsius\":" + String(ambTemp, 1) + ",";
    json += "\"battery_percent\":75";
    json += "}";

    int httpCode = http.POST(json);
    Serial.printf("POST Response code: %d\n", httpCode);
    http.end();
  }

  delay(5000); // 5 second scan cycle
}
```
