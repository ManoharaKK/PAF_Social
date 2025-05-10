import axios from "./axios-config";
import authHeader from "./auth-header";

const API_URL = "/api/workout-schedule";

const getAll = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

const getById = (id) => {
  return axios.get(`${API_URL}/${id}`, { headers: authHeader() });
};

const create = (scheduleData) => {
  return axios.post(API_URL, scheduleData, { headers: authHeader() });
};

const update = (id, scheduleData) => {
  return axios.put(`${API_URL}/${id}`, scheduleData, { headers: authHeader() });
};

const remove = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
};

const completeExercise = (scheduleId, exerciseId) => {
  return axios.put(`${API_URL}/${scheduleId}/exercises/${exerciseId}/complete`, {}, { headers: authHeader() });
};

const WorkoutScheduleService = {
  getAll,
  getById,
  create,
  update,
  remove,
  completeExercise
};

export default WorkoutScheduleService; 