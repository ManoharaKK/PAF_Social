import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Get all workout schedules
export const getWorkoutSchedules = async () => {
  try {
    const response = await axios.get(`${API_URL}/workout-schedules`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workout schedules:', error);
    throw error;
  }
};

// Get a single workout schedule by ID
export const getWorkoutScheduleById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/workout-schedules/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching workout schedule with ID ${id}:`, error);
    throw error;
  }
};

// Create a new workout schedule
export const createWorkoutSchedule = async (scheduleData) => {
  try {
    const response = await axios.post(`${API_URL}/workout-schedules`, scheduleData);
    return response.data;
  } catch (error) {
    console.error('Error creating workout schedule:', error);
    throw error;
  }
};

// Update an existing workout schedule
export const updateWorkoutSchedule = async (id, scheduleData) => {
  try {
    const response = await axios.put(`${API_URL}/workout-schedules/${id}`, scheduleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating workout schedule with ID ${id}:`, error);
    throw error;
  }
};

// Delete a workout schedule
export const deleteWorkoutSchedule = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/workout-schedules/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting workout schedule with ID ${id}:`, error);
    throw error;
  }
};

// Mark an exercise as complete or incomplete
export const toggleExerciseCompletion = async (scheduleId, exerciseId, completed) => {
  try {
    const response = await axios.patch(
      `${API_URL}/workout-schedules/${scheduleId}/exercises/${exerciseId}`, 
      { completed }
    );
    return response.data;
  } catch (error) {
    console.error(`Error updating exercise completion status:`, error);
    throw error;
  }
}; 