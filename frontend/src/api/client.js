import axios from 'axios';

// Use relative URL in production (or when served on same origin), fallback to localhost:5000 in dev
const API_BASE = window.location.port === '5173'
  ? 'http://localhost:5000/api/v1'
  : '/api/v1';

const HEALTH_URL = window.location.port === '5173'
  ? 'http://localhost:5000/api/health'
  : '/api/health';

export const api = {
  // Health
  checkHealth: async () => {
    const res = await axios.get(HEALTH_URL);
    return res.data;
  },

  // Detections
  getDetections: async (params = {}) => {
    const res = await axios.get(`${API_BASE}/detections`, { params });
    return res.data;
  },

  getDetectionById: async (id) => {
    const res = await axios.get(`${API_BASE}/detections/${id}`);
    return res.data;
  },

  updateReviewedStatus: async (id, reviewed_status) => {
    const res = await axios.patch(`${API_BASE}/detections/${id}`, { reviewed_status });
    return res.data;
  },

  ingestDetection: async (payload) => {
    const res = await axios.post(`${API_BASE}/detections`, payload);
    return res.data;
  },

  // Drones
  getDrones: async () => {
    const res = await axios.get(`${API_BASE}/drones`);
    return res.data;
  },

  getDroneById: async (droneId) => {
    const res = await axios.get(`${API_BASE}/drones/${droneId}`);
    return res.data;
  },

  updateDroneName: async (droneId, name) => {
    const res = await axios.patch(`${API_BASE}/drones/${droneId}`, { name });
    return res.data;
  },

  // Config
  getConfig: async (droneId = null) => {
    const params = droneId ? { drone_id: droneId } : {};
    const res = await axios.get(`${API_BASE}/config`, { params });
    return res.data;
  },

  updateConfig: async (configData) => {
    const res = await axios.put(`${API_BASE}/config`, configData);
    return res.data;
  },

  // Recipients
  getRecipients: async () => {
    const res = await axios.get(`${API_BASE}/recipients`);
    return res.data;
  },

  addRecipient: async (recipientData) => {
    const res = await axios.post(`${API_BASE}/recipients`, recipientData);
    return res.data;
  },

  deleteRecipient: async (id) => {
    const res = await axios.delete(`${API_BASE}/recipients/${id}`);
    return res.data;
  },

  testWhatsAppAlert: async (phoneNumber, callmebotApiKey = null) => {
    const res = await axios.post(`${API_BASE}/recipients/test-alert`, { 
      phone_number: phoneNumber,
      callmebot_api_key: callmebotApiKey
    });
    return res.data;
  },

  // Analytics
  getAnalyticsSummary: async (params = {}) => {
    const res = await axios.get(`${API_BASE}/analytics/summary`, { params });
    return res.data;
  }
};
