import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

export const fetchFindings = async (limit = 50, offset = 0) => {
  const response = await axios.get(`${API_BASE_URL}/findings`, {
    params: { limit, offset }
  });
  return response.data;
};

export const fetchEvidence = async (findingId) => {
  const response = await axios.get(`${API_BASE_URL}/findings/${findingId}/evidence`);
  return response.data;
};

export const fetchTelemetry = async (limit = 50) => {
  const response = await axios.get(`${API_BASE_URL}/telemetry`, {
    params: { limit }
  });
  return response.data;
};

export const fetchSystemStatus = async () => {
  const response = await axios.get(`${API_BASE_URL}/status`);
  return response.data;
};
