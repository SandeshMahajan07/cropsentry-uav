import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, Thermometer, ExternalLink, Battery, Clock, AlertCircle } from 'lucide-react';

// Custom SVG icon generator for Drones
function createDroneIcon(drone) {
  const isOnline = drone.is_online !== false;
  const color = isOnline ? '#15803d' : '#dc2626'; // Green if online, Red if offline/stale
  
  return L.divIcon({
    className: 'custom-drone-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.2; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 30px; height: 30px; border-radius: 50%; background-color: #0f1c14; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.3); color: white;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
}

// Custom SVG icon generator for Detections
function createDetectionIcon(detection) {
  const isCandidate = detection.status === 'confirmed_candidate';
  const isReviewedReal = detection.reviewed_status === 'confirmed_real';
  const isFalseAlarm = detection.reviewed_status === 'false_alarm';

  let bgColor = '#64748b'; // default gray for below threshold
  let borderColor = '#ffffff';

  if (isCandidate) {
    if (isReviewedReal) {
      bgColor = '#16a34a'; // Verified Real Animal: Rich Emerald
    } else if (isFalseAlarm) {
      bgColor = '#ea580c'; // False alarm: Orange/Amber
    } else {
      bgColor = '#dc2626'; // Confirmed Candidate (Unreviewed): Urgent Red
    }
  }

  return L.divIcon({
    className: 'custom-detection-pin',
    html: `
      <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${bgColor}; border: 2px solid ${borderColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; color: white; font-size: 10px; font-weight: bold;">
        ${isCandidate ? '🚨' : '•'}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
  });
}

export default function MapView({ drones = [], detections = [], onSelectDetection }) {
  // Center map around first drone or detection, fallback to Karnataka farmland default (17.3295, 76.8369)
  const defaultCenter = [17.329500, 76.836900];
  const center = (drones.length > 0 && drones[0].last_known_lat && drones[0].last_known_lng)
    ? [drones[0].last_known_lat, drones[0].last_known_lng]
    : (detections.length > 0 && detections[0].latitude && detections[0].longitude)
    ? [detections[0].latitude, detections[0].longitude]
    : defaultCenter;

  return (
    <div className="relative w-full h-[460px] rounded-3xl overflow-hidden shadow-sm border border-slate-200/80">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Drone Location Markers */}
        {drones.map((drone) => {
          if (!drone.last_known_lat || !drone.last_known_lng) return null;
          return (
            <Marker
              key={`drone-${drone.drone_id}`}
              position={[drone.last_known_lat, drone.last_known_lng]}
              icon={createDroneIcon(drone)}
            >
              <Popup>
                <div className="p-1 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2 border-b pb-1">
                    <span className="font-bold text-slate-900">{drone.name || drone.drone_id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      drone.is_online ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {drone.is_online ? 'LIVE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                    <span>Battery: <strong>{drone.last_battery_percent !== null ? `${drone.last_battery_percent}%` : 'N/A'}</strong></span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Seen: {drone.last_seen_at ? new Date(drone.last_seen_at).toLocaleTimeString() : 'Never'}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-500 font-mono">
                    {drone.last_known_lat.toFixed(5)}, {drone.last_known_lng.toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Detection Markers */}
        {detections.map((d) => {
          if (!d.latitude || !d.longitude) return null;
          return (
            <Marker
              key={`det-${d.id}`}
              position={[d.latitude, d.longitude]}
              icon={createDetectionIcon(d)}
            >
              <Popup>
                <div className="p-1 text-xs space-y-2 max-w-[220px]">
                  <div className="flex items-center justify-between border-b pb-1 gap-2">
                    <span className="font-bold text-slate-900">Detection #{d.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      d.status === 'confirmed_candidate' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.status === 'confirmed_candidate' ? 'Candidate' : 'Normal'}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <p><strong>Drone:</strong> {d.drone_id}</p>
                    <p><strong>Time:</strong> {new Date(d.timestamp).toLocaleString()}</p>
                    <p className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-600" />
                      <span>Obj: <strong>{d.object_temp_celsius}°C</strong> (Amb: {d.ambient_temp_celsius}°C)</span>
                    </p>
                    <p><strong>Delta:</strong> <span className="text-rose-600 font-bold">+{d.delta}°C</span></p>
                    <p><strong>Review:</strong> <span className="capitalize font-semibold">{d.reviewed_status.replace('_', ' ')}</span></p>
                  </div>

                  {d.image_url && (
                    <img 
                      src={`http://localhost:5000${d.image_url}`} 
                      alt="Thermal snapshot" 
                      className="w-full h-20 object-cover rounded-lg border border-slate-200"
                    />
                  )}

                  <div className="flex items-center justify-between pt-1 border-t gap-2">
                    <a
                      href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-700 hover:text-forest-900 font-medium flex items-center gap-1 text-[11px]"
                    >
                      Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                    {onSelectDetection && (
                      <button
                        onClick={() => onSelectDetection(d.id)}
                        className="text-xs bg-forest-900 text-white px-2 py-0.5 rounded-md hover:bg-forest-800"
                      >
                        Detail
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Legend Badge */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-200/80 text-xs text-slate-700 space-y-1">
        <div className="font-bold text-[11px] text-slate-900 uppercase tracking-wider mb-1">Map Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-700 border border-white"></span>
          <span>Drone (Active Patrol)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-600 border border-white"></span>
          <span>Candidate (High Heat Δ)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-500 border border-white"></span>
          <span>Normal Field Scan</span>
        </div>
      </div>
    </div>
  );
}
