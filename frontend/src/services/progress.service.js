import axios from "./axios-config";
import authHeader from "./auth-header";

// Remove the base URL since it's already in axios-config
const API_URL = "/api/progress";

const getAll = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const getById = (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
};

const create = (progressData) => {
  return axios.post(API_URL, progressData, { headers: authHeader() });
};

const update = (id, progressData) => {
  return axios.put(`${API_URL}/${id}`, progressData, { headers: authHeader() });
};

const remove = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
};

const getHistory = (progressId) => {
  return axios.get(`${API_URL}/${progressId}/history`, { headers: authHeader() });
};

const addHistory = (progressId, historyData) => {
  return axios.post(`${API_URL}/${progressId}/history`, historyData, { headers: authHeader() });
};

const ProgressService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getHistory,
  addHistory
};

export default ProgressService; 