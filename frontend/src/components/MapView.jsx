import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, 
  Thermometer, 
  ExternalLink, 
  Battery, 
  Clock, 
  AlertCircle,
  Crosshair,
  Layers,
  Maximize2,
  Copy,
  Check,
  MapPin,
  Compass
} from 'lucide-react';

// Custom SVG icon generator for Drones
function createDroneIcon(drone) {
  const isOnline = drone.is_online !== false;
  const color = isOnline ? '#10b981' : '#ef4444'; // Emerald if online, Red if offline
  
  return L.divIcon({
    className: 'custom-drone-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 40px; height: 40px;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${color}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #0b1710; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.5); color: white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
}

// Custom SVG icon generator for Detections
function createDetectionIcon(detection) {
  const isCandidate = detection.status === 'confirmed_candidate';
  const isReviewedReal = detection.reviewed_status === 'confirmed_real';
  const isFalseAlarm = detection.reviewed_status === 'false_alarm';

  let bgColor = '#64748b'; // default slate for normal
  let borderColor = '#ffffff';
  let badgeText = '•';

  if (isCandidate) {
    if (isReviewedReal) {
      bgColor = '#16a34a'; // Verified Real Animal: Rich Emerald
      badgeText = '🐗';
    } else if (isFalseAlarm) {
      bgColor = '#f97316'; // False alarm: Bright Orange
      badgeText = '⚠️';
    } else {
      bgColor = '#dc2626'; // Confirmed Candidate (Unreviewed): Red Alert
      badgeText = '🚨';
    }
  }

  return L.divIcon({
    className: 'custom-detection-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        ${isCandidate ? `<div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${bgColor}; opacity: 0.3; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="width: 26px; height: 26px; border-radius: 50%; background-color: ${bgColor}; border: 2.5px solid ${borderColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
          ${badgeText}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
}

// User Device GPS Pin Icon
function createUserPinIcon() {
  return L.divIcon({
    className: 'custom-user-gps-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: #3b82f6; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #2563eb; border: 3px solid #ffffff; box-shadow: 0 0 12px rgba(37,99,235,0.6); display: flex; align-items: center; justify-content: center; color: white;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background-color: white;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
}

// Click Inspector Pin Icon
function createClickPinIcon() {
  return L.divIcon({
    className: 'custom-click-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="width: 14px; height: 14px; border-radius: 50%; background-color: #eab308; border: 2.5px solid #000; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>
        <div style="width: 2px; height: 8px; background-color: #000;"></div>
      </div>
    `,
    iconSize: [16, 22],
    iconAnchor: [8, 22],
    popupAnchor: [0, -22]
  });
}

// Active Map View Controller for React-Leaflet
function MapViewController({ bounds, targetLocation, forceFitCounter }) {
  const map = useMap();
  const hasInitialized = useRef(false);

  // Resize invalidation to fix Leaflet layout in flex/grid/animation containers
  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 200);
    const t2 = setTimeout(() => map.invalidateSize(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [map]);

  // Initial bounds fitting when data first arrives
  useEffect(() => {
    if (bounds && bounds.isValid() && (!hasInitialized.current || forceFitCounter > 0)) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      hasInitialized.current = true;
    }
  }, [bounds, forceFitCounter, map]);

  // Target location flyTo (Locate Me or Focus Drone)
  useEffect(() => {
    if (targetLocation) {
      map.flyTo([targetLocation.lat, targetLocation.lng], targetLocation.zoom || 17, {
        duration: 1.2
      });
    }
  }, [targetLocation, map]);

  return null;
}

// Map Click Inspector
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });
  return null;
}

export default function MapView({ drones = [], detections = [], onSelectDetection }) {
  const [layerType, setLayerType] = useState('satellite'); // 'satellite' | 'street'
  const [targetLocation, setTargetLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locating, setLocating] = useState(false);
  const [clickedLocation, setClickedLocation] = useState(null);
  const [copied, setCopied] = useState(false);
  const [forceFitCounter, setForceFitCounter] = useState(0);

  // Default coordinate center (Karnataka Farmlands)
  const defaultCenter = [17.329500, 76.836900];

  // Calculate dynamic bounds encompassing all drones and detections
  const bounds = useMemo(() => {
    const latLngs = [];

    drones.forEach((d) => {
      if (d.last_known_lat && d.last_known_lng) {
        latLngs.push([d.last_known_lat, d.last_known_lng]);
      }
    });

    detections.forEach((det) => {
      if (det.latitude && det.longitude) {
        latLngs.push([det.latitude, det.longitude]);
      }
    });

    if (userLocation) {
      latLngs.push([userLocation.lat, userLocation.lng]);
    }

    if (latLngs.length > 0) {
      return L.latLngBounds(latLngs);
    }
    return null;
  }, [drones, detections, userLocation]);

  // Initial center position
  const initialCenter = useMemo(() => {
    if (drones.length > 0 && drones[0].last_known_lat && drones[0].last_known_lng) {
      return [drones[0].last_known_lat, drones[0].last_known_lng];
    }
    if (detections.length > 0 && detections[0].latitude && detections[0].longitude) {
      return [detections[0].latitude, detections[0].longitude];
    }
    return defaultCenter;
  }, [drones, detections]);

  // Locate User's Device via Browser Geolocation
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          zoom: 17
        };
        setUserLocation(coords);
        setTargetLocation(coords);
        setLocating(false);
      },
      (err) => {
        console.warn('Geolocation failed:', err.message);
        alert(`Location access denied or unavailable: ${err.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Center on Primary Drone
  const handleFocusDrone = () => {
    if (drones.length > 0 && drones[0].last_known_lat && drones[0].last_known_lng) {
      setTargetLocation({
        lat: drones[0].last_known_lat,
        lng: drones[0].last_known_lng,
        zoom: 17
      });
    } else {
      alert('Drone GPS position not currently available.');
    }
  };

  // Fit All Points
  const handleFitAll = () => {
    setTargetLocation(null);
    setForceFitCounter((c) => c + 1);
  };

  // Handle map click
  const handleMapClick = (coords) => {
    setClickedLocation(coords);
    setCopied(false);
  };

  const copyCoordinates = (lat, lng) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden shadow-md border border-slate-200/90 bg-slate-950">
      <MapContainer
        center={initialCenter}
        zoom={16}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <MapViewController 
          bounds={bounds} 
          targetLocation={targetLocation} 
          forceFitCounter={forceFitCounter} 
        />
        <MapClickHandler onMapClick={handleMapClick} />

        {/* Tile Layers: Satellite Hybrid vs OpenStreetMap */}
        {layerType === 'satellite' ? (
          <>
            <TileLayer
              attribution='&copy; <a href="https://www.esri.com/">Esri</a> &mdash; World Imagery, Maxar, Earthstar Geographics'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            {/* Reference labels overlay for roads and boundaries */}
            <TileLayer
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
              opacity={0.8}
            />
          </>
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}

        {/* User Device GPS Marker & Accuracy Circle */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lng]}
              icon={createUserPinIcon()}
            >
              <Popup>
                <div className="p-1 text-xs space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-blue-600" />
                    <span>Your Device Location</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-700">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    GPS Accuracy: &plusmn;{userLocation.accuracy} meters
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userLocation.accuracy || 20}
              pathOptions={{ color: '#3b82f6', fillColor: '#60a5fa', fillOpacity: 0.15, weight: 1.5 }}
            />
          </>
        )}

        {/* Clicked Coordinate Marker */}
        {clickedLocation && (
          <Marker
            position={[clickedLocation.lat, clickedLocation.lng]}
            icon={createClickPinIcon()}
          >
            <Popup onClose={() => setClickedLocation(null)}>
              <div className="p-1 text-xs space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>Selected Coordinates</span>
                </div>
                <div className="font-mono text-[11px] font-semibold text-slate-800 bg-slate-100 p-1.5 rounded-lg">
                  {clickedLocation.lat.toFixed(6)}, {clickedLocation.lng.toFixed(6)}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => copyCoordinates(clickedLocation.lat, clickedLocation.lng)}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <a
                    href={`https://www.google.com/maps?q=${clickedLocation.lat},${clickedLocation.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 bg-forest-800 hover:bg-forest-700 text-white rounded-md text-[11px] font-semibold flex items-center gap-1"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

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
                      {drone.is_online ? 'PATROL ACTIVE' : 'OFFLINE'}
                    </span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-slate-400" />
                    <span>Battery: <strong>{drone.last_battery_percent !== null ? `${drone.last_battery_percent}%` : 'N/A'}</strong></span>
                  </div>
                  <div className="text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Last Telemetry: {drone.last_seen_at ? new Date(drone.last_seen_at).toLocaleTimeString() : 'Never'}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-slate-700 font-mono font-bold flex items-center justify-between">
                    <span>{drone.last_known_lat.toFixed(6)}, {drone.last_known_lng.toFixed(6)}</span>
                    <a
                      href={`https://www.google.com/maps?q=${drone.last_known_lat},${drone.last_known_lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forest-700 hover:text-forest-900 inline-flex items-center gap-0.5 font-sans font-semibold text-[10px]"
                    >
                      Maps <ExternalLink className="w-2.5 h-2.5" />
                    </a>
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
                <div className="p-1 text-xs space-y-2 max-w-[230px]">
                  <div className="flex items-center justify-between border-b pb-1 gap-2">
                    <span className="font-bold text-slate-900">Detection #{d.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      d.status === 'confirmed_candidate' 
                        ? 'bg-rose-100 text-rose-800' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {d.status === 'confirmed_candidate' ? '🚨 Candidate' : 'Normal'}
                    </span>
                  </div>

                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <p><strong>Drone:</strong> {d.drone_id}</p>
                    <p><strong>Time:</strong> {new Date(d.timestamp).toLocaleString()}</p>
                    <p className="flex items-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-600" />
                      <span>Obj: <strong>{d.object_temp_celsius}°C</strong> (Amb: {d.ambient_temp_celsius}°C)</span>
                    </p>
                    <p><strong>Thermal Delta:</strong> <span className="text-rose-600 font-bold">+{d.delta}°C</span></p>
                    <p className="font-mono text-[10px] text-slate-500 font-semibold">
                      GPS: {d.latitude.toFixed(6)}, {d.longitude.toFixed(6)}
                    </p>
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
                      className="text-forest-700 hover:text-forest-900 font-semibold flex items-center gap-1 text-[11px]"
                    >
                      Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                    {onSelectDetection && (
                      <button
                        onClick={() => onSelectDetection(d.id)}
                        className="text-xs bg-forest-900 text-white px-2 py-0.5 rounded-md hover:bg-forest-800 font-semibold"
                      >
                        Inspect
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating HUD Controls Bar (Top Left) */}
      <div className="absolute top-4 left-4 z-[400] flex flex-wrap items-center gap-2">
        {/* Layer Switcher */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 p-1 flex items-center">
          <button
            onClick={() => setLayerType('satellite')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              layerType === 'satellite'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Switch to High-Resolution Satellite Aerial View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>🛰️ Satellite</span>
          </button>
          <button
            onClick={() => setLayerType('street')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              layerType === 'street'
                ? 'bg-forest-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title="Switch to Street & Road Map"
          >
            <span>🗺️ Map</span>
          </button>
        </div>

        {/* Locate My Device Button */}
        <button
          onClick={handleLocateMe}
          disabled={locating}
          className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white text-xs font-bold shadow-lg border border-slate-200/90 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
          title="Center map on your device's live GPS coordinates"
        >
          <Crosshair className={`w-3.5 h-3.5 text-blue-600 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Acquiring GPS...' : '📍 Locate Me'}</span>
        </button>

        {/* Focus Drone Button */}
        <button
          onClick={handleFocusDrone}
          className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white text-xs font-bold shadow-lg border border-slate-200/90 flex items-center gap-1.5 transition active:scale-95"
          title="Center on CropSentry-01 Drone"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>🚁 Center Drone</span>
        </button>

        {/* Fit All Points */}
        <button
          onClick={handleFitAll}
          className="px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white text-xs font-bold shadow-lg border border-slate-200/90 flex items-center gap-1.5 transition active:scale-95"
          title="Zoom out to frame all detections and drone markers"
        >
          <Maximize2 className="w-3.5 h-3.5 text-forest-700" />
          <span>🎯 Fit All</span>
        </button>
      </div>

      {/* Map Hint Overlay (Top Right) */}
      <div className="absolute top-4 right-4 z-[400] hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/60 backdrop-blur-md text-white/90 text-[11px] font-medium pointer-events-none">
        <MapPin className="w-3 h-3 text-amber-400" />
        <span>Click anywhere on map to inspect exact GPS coordinates</span>
      </div>

      {/* Legend Badge (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-slate-200/90 text-xs text-slate-700 space-y-1">
        <div className="font-bold text-[10px] text-slate-900 uppercase tracking-wider mb-1">Perimeter Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm"></span>
          <span className="text-[11px] font-semibold text-slate-800">CropSentry-01 (Patrol)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-600 border border-white shadow-sm"></span>
          <span className="text-[11px] font-semibold text-slate-800">Intrusion Alert (Hot Body)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-slate-400 border border-white shadow-sm"></span>
          <span className="text-[11px] font-semibold text-slate-800">Baseline Scan (&Delta;T &lt; 8&deg;C)</span>
        </div>
        {userLocation && (
          <div className="flex items-center gap-2 pt-0.5 border-t border-slate-100">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white shadow-sm"></span>
            <span className="text-[11px] font-semibold text-blue-800">Your Device Position</span>
          </div>
        )}
      </div>
    </div>
  );
}
