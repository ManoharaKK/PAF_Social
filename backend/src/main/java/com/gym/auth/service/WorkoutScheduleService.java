package com.gym.auth.service;

import com.gym.auth.model.User;
import com.gym.auth.model.WorkoutSchedule;

import java.util.List;

public interface WorkoutScheduleService {
    
    /**
     * Get all workout schedules for the current user
     * 
     * @param user The current user
     * @return List of workout schedules
     */
    List<WorkoutSchedule> getAllWorkoutSchedules(User user);
    
    /**
     * Get a specific workout schedule by ID
     * 
     * @param id The workout schedule ID
     * @param user The current user
     * @return The workout schedule
     */
    WorkoutSchedule getWorkoutScheduleById(Long id, User user);
    
    /**
     * Create a new workout schedule
     * 
     * @param workoutScheduleData The workout schedule data
     * @param user The current user
     * @return The created workout schedule
     */
    WorkoutSchedule createWorkoutSchedule(WorkoutSchedule workoutScheduleData, User user);
    
    /**
     * Update an existing workout schedule
     * 
     * @param id The workout schedule ID
     * @param workoutScheduleData The updated workout schedule data
     * @param user The current user
     * @return The updated workout schedule
     */
    WorkoutSchedule updateWorkoutSchedule(Long id, WorkoutSchedule workoutScheduleData, User user);
    
    /**
     * Delete a workout schedule
     * 
     * @param id The workout schedule ID
     * @param user The current user
     */
    void deleteWorkoutSchedule(Long id, User user);
    
    /**
     * Mark an exercise as complete or incomplete
     * 
     * @param workoutScheduleId The workout schedule ID
     * @param exerciseId The exercise ID
     * @param user The current user
     * @return The updated exercise
     */
    WorkoutSchedule toggleExerciseCompletion(Long workoutScheduleId, Long exerciseId, User user);
}
