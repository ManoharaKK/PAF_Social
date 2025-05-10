package com.gym.auth.service;

import com.gym.auth.model.Exercise;
import com.gym.auth.model.User;
import com.gym.auth.model.WorkoutSchedule;
import com.gym.auth.repository.ExerciseRepository;
import com.gym.auth.repository.WorkoutScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;

@Service
public class WorkoutScheduleServiceImpl implements WorkoutScheduleService {

    @Autowired
    private WorkoutScheduleRepository workoutScheduleRepository;
    
    @Autowired
    private ExerciseRepository exerciseRepository;
    
    @Override
    public List<WorkoutSchedule> getAllWorkoutSchedules(User user) {
        return workoutScheduleRepository.findByUserOrderByCreatedAtDesc(user);
    }
    
    @Override
    public WorkoutSchedule getWorkoutScheduleById(Long id, User user) {
        WorkoutSchedule workoutSchedule = workoutScheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Workout schedule not found with id: " + id));
        
        // Check if the workout schedule belongs to the user
        if (!workoutSchedule.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("You are not authorized to access this workout schedule");
        }
        
        return workoutSchedule;
    }
    
    @Override
    @Transactional
    public WorkoutSchedule createWorkoutSchedule(WorkoutSchedule workoutScheduleData, User user) {
        try {
            // Create a new workout schedule
            WorkoutSchedule workoutSchedule = new WorkoutSchedule();
            workoutSchedule.setTitle(workoutScheduleData.getTitle());
            workoutSchedule.setDescription(workoutScheduleData.getDescription());
            workoutSchedule.setUser(user);
            workoutSchedule.setIntensity(workoutScheduleData.getIntensity());
            workoutSchedule.setDuration(workoutScheduleData.getDuration());
            
            // Handle days - already properly converted at controller level
            workoutSchedule.setDays(workoutScheduleData.getDays());
            
            // Save workout schedule first to get an ID
            workoutSchedule = workoutScheduleRepository.save(workoutSchedule);
            
            // Handle exercises separately after saving the workout schedule
            if (workoutScheduleData.getExercises() != null && !workoutScheduleData.getExercises().isEmpty()) {
                for (Exercise exerciseData : workoutScheduleData.getExercises()) {
                    if (exerciseData.getName() != null && !exerciseData.getName().trim().isEmpty()) {
                        Exercise exercise = new Exercise();
                        exercise.setName(exerciseData.getName());
                        exercise.setSets(exerciseData.getSets() != null ? exerciseData.getSets() : 3);
                        exercise.setReps(exerciseData.getReps() != null ? exerciseData.getReps() : 10);
                        exercise.setCompleted(false); // Always start as not completed
                        exercise.setWorkoutSchedule(workoutSchedule);
                        
                        exerciseRepository.save(exercise);
                    }
                }
            }
            
            // Fetch the complete workout schedule with exercises
            return workoutScheduleRepository.findById(workoutSchedule.getId())
                .orElseThrow(() -> new RuntimeException("Failed to retrieve created workout schedule"));
                
        } catch (Exception e) {
            // Log the exception for debugging
            e.printStackTrace();
            throw new RuntimeException("Error creating workout schedule: " + e.getMessage(), e);
        }
    }
    
    @Override
    @Transactional
    public WorkoutSchedule updateWorkoutSchedule(Long id, WorkoutSchedule workoutScheduleData, User user) {
        WorkoutSchedule existingWorkoutSchedule = getWorkoutScheduleById(id, user);
        
        // Update basic information
        existingWorkoutSchedule.setTitle(workoutScheduleData.getTitle());
        existingWorkoutSchedule.setDescription(workoutScheduleData.getDescription());
        existingWorkoutSchedule.setDays(workoutScheduleData.getDays());
        existingWorkoutSchedule.setIntensity(workoutScheduleData.getIntensity() != null ? workoutScheduleData.getIntensity() : existingWorkoutSchedule.getIntensity());
        existingWorkoutSchedule.setDuration(workoutScheduleData.getDuration() != null ? workoutScheduleData.getDuration() : existingWorkoutSchedule.getDuration());
        
        // Update exercises if provided
        if (workoutScheduleData.getExercises() != null) {
            // Remove all existing exercises
            existingWorkoutSchedule.getExercises().clear();
            
            // Add new exercises
            for (Exercise exerciseData : workoutScheduleData.getExercises()) {
                Exercise exercise = new Exercise();
                exercise.setName(exerciseData.getName());
                exercise.setSets(exerciseData.getSets());
                exercise.setReps(exerciseData.getReps());
                exercise.setCompleted(exerciseData.getCompleted() != null ? exerciseData.getCompleted() : false);
                exercise.setWorkoutSchedule(existingWorkoutSchedule);
                
                existingWorkoutSchedule.getExercises().add(exercise);
            }
        }
        
        return workoutScheduleRepository.save(existingWorkoutSchedule);
    }
    
    @Override
    @Transactional
    public void deleteWorkoutSchedule(Long id, User user) {
        WorkoutSchedule workoutSchedule = getWorkoutScheduleById(id, user);
        workoutScheduleRepository.delete(workoutSchedule);
    }
    
    @Override
    @Transactional
    public WorkoutSchedule toggleExerciseCompletion(Long workoutScheduleId, Long exerciseId, User user) {
        WorkoutSchedule workoutSchedule = getWorkoutScheduleById(workoutScheduleId, user);
        
        Exercise exercise = exerciseRepository.findByIdAndWorkoutSchedule(exerciseId, workoutSchedule)
                .orElseThrow(() -> new EntityNotFoundException("Exercise not found with id: " + exerciseId));
        
        // Toggle the completion status
        exercise.setCompleted(!exercise.getCompleted());
        exerciseRepository.save(exercise);
        
        return workoutSchedule;
    }
}
