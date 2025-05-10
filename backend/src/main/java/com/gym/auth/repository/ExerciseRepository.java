package com.gym.auth.repository;

import com.gym.auth.model.Exercise;
import com.gym.auth.model.WorkoutSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    
    /**
     * Find all exercises for a specific workout schedule
     * 
     * @param workoutSchedule The workout schedule to find exercises for
     * @return List of exercises
     */
    List<Exercise> findByWorkoutScheduleOrderByIdAsc(WorkoutSchedule workoutSchedule);
    
    /**
     * Find a specific exercise by ID that belongs to a specific workout schedule
     * 
     * @param id The exercise ID
     * @param workoutSchedule The workout schedule
     * @return Optional containing the exercise if found
     */
    Optional<Exercise> findByIdAndWorkoutSchedule(Long id, WorkoutSchedule workoutSchedule);
    
    /**
     * Count the number of completed exercises in a workout schedule
     * 
     * @param workoutSchedule The workout schedule
     * @param completed The completion status to filter by
     * @return Count of exercises
     */
    long countByWorkoutScheduleAndCompleted(WorkoutSchedule workoutSchedule, boolean completed);
}
