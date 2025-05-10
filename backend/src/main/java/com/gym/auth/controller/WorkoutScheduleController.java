package com.gym.auth.controller;

import com.gym.auth.model.Exercise;
import com.gym.auth.model.User;
import com.gym.auth.model.WorkoutSchedule;
import com.gym.auth.repository.UserRepository;
import com.gym.auth.security.UserDetailsImpl;
import com.gym.auth.service.WorkoutScheduleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout-schedule")
@CrossOrigin(origins = "*", maxAge = 3600)
public class WorkoutScheduleController {

    @Autowired
    private WorkoutScheduleService workoutScheduleService;
    
    @Autowired
    private UserRepository userRepository;
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<WorkoutSchedule>> getAllWorkoutSchedules() {
        User currentUser = getCurrentUser();
        List<WorkoutSchedule> workoutSchedules = workoutScheduleService.getAllWorkoutSchedules(currentUser);
        return ResponseEntity.ok(workoutSchedules);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WorkoutSchedule> getWorkoutScheduleById(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        WorkoutSchedule workoutSchedule = workoutScheduleService.getWorkoutScheduleById(id, currentUser);
        return ResponseEntity.ok(workoutSchedule);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WorkoutSchedule> createWorkoutSchedule(@RequestBody WorkoutScheduleRequest scheduleRequest) {
        User currentUser = getCurrentUser();
        
        // Convert DTO to entity
        WorkoutSchedule workoutSchedule = new WorkoutSchedule();
        workoutSchedule.setTitle(scheduleRequest.getTitle());
        workoutSchedule.setDescription(scheduleRequest.getDescription());
        workoutSchedule.setIntensity(scheduleRequest.getIntensity());
        workoutSchedule.setDuration(scheduleRequest.getDuration());
        
        // Use setDaysList for the List<String> from the frontend
        if (scheduleRequest.getDays() != null) {
            workoutSchedule.setDaysList(scheduleRequest.getDays());
        }
        
        // Handle exercises
        if (scheduleRequest.getExercises() != null) {
            List<Exercise> exercises = new ArrayList<>();
            for (ExerciseRequest exerciseRequest : scheduleRequest.getExercises()) {
                Exercise exercise = new Exercise();
                exercise.setName(exerciseRequest.getName());
                exercise.setSets(exerciseRequest.getSets());
                exercise.setReps(exerciseRequest.getReps());
                exercise.setCompleted(exerciseRequest.getCompleted() != null ? exerciseRequest.getCompleted() : false);
                exercises.add(exercise);
            }
            workoutSchedule.setExercises(exercises);
        }
        
        WorkoutSchedule createdWorkoutSchedule = workoutScheduleService.createWorkoutSchedule(workoutSchedule, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdWorkoutSchedule);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WorkoutSchedule> updateWorkoutSchedule(
            @PathVariable Long id,
            @RequestBody WorkoutScheduleRequest scheduleRequest) {
        User currentUser = getCurrentUser();
        
        // Convert DTO to entity
        WorkoutSchedule workoutSchedule = new WorkoutSchedule();
        workoutSchedule.setTitle(scheduleRequest.getTitle());
        workoutSchedule.setDescription(scheduleRequest.getDescription());
        workoutSchedule.setIntensity(scheduleRequest.getIntensity());
        workoutSchedule.setDuration(scheduleRequest.getDuration());
        
        // Use setDaysList for the List<String> from the frontend
        if (scheduleRequest.getDays() != null) {
            workoutSchedule.setDaysList(scheduleRequest.getDays());
        }
        
        // Handle exercises
        if (scheduleRequest.getExercises() != null) {
            List<Exercise> exercises = new ArrayList<>();
            for (ExerciseRequest exerciseRequest : scheduleRequest.getExercises()) {
                Exercise exercise = new Exercise();
                exercise.setName(exerciseRequest.getName());
                exercise.setSets(exerciseRequest.getSets());
                exercise.setReps(exerciseRequest.getReps());
                exercise.setCompleted(exerciseRequest.getCompleted() != null ? exerciseRequest.getCompleted() : false);
                exercises.add(exercise);
            }
            workoutSchedule.setExercises(exercises);
        }
        
        WorkoutSchedule updatedWorkoutSchedule = workoutScheduleService.updateWorkoutSchedule(id, workoutSchedule, currentUser);
        return ResponseEntity.ok(updatedWorkoutSchedule);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> deleteWorkoutSchedule(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        workoutScheduleService.deleteWorkoutSchedule(id, currentUser);
        return ResponseEntity.ok().build();
    }
    
    @PutMapping("/{scheduleId}/exercises/{exerciseId}/complete")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<WorkoutSchedule> toggleExerciseCompletion(
            @PathVariable Long scheduleId,
            @PathVariable Long exerciseId) {
        User currentUser = getCurrentUser();
        WorkoutSchedule workoutSchedule = workoutScheduleService.toggleExerciseCompletion(scheduleId, exerciseId, currentUser);
        return ResponseEntity.ok(workoutSchedule);
    }
    
    // DTO classes for request/response
    public static class WorkoutScheduleRequest {
        private String title;
        private String description;
        private List<String> days;
        private List<ExerciseRequest> exercises;
        private String intensity;
        private Integer duration;
        
        // Getters and setters
        public String getTitle() {
            return title;
        }
        
        public void setTitle(String title) {
            this.title = title;
        }
        
        public String getDescription() {
            return description;
        }
        
        public void setDescription(String description) {
            this.description = description;
        }
        
        public List<String> getDays() {
            return days;
        }
        
        public void setDays(List<String> days) {
            this.days = days;
        }
        
        public List<ExerciseRequest> getExercises() {
            return exercises;
        }
        
        public void setExercises(List<ExerciseRequest> exercises) {
            this.exercises = exercises;
        }
        
        public String getIntensity() {
            return intensity;
        }
        
        public void setIntensity(String intensity) {
            this.intensity = intensity;
        }
        
        public Integer getDuration() {
            return duration;
        }
        
        public void setDuration(Integer duration) {
            this.duration = duration;
        }
    }
    
    public static class ExerciseRequest {
        private String name;
        private Integer sets;
        private Integer reps;
        private Boolean completed;
        
        // Getters and setters
        public String getName() {
            return name;
        }
        
        public void setName(String name) {
            this.name = name;
        }
        
        public Integer getSets() {
            return sets;
        }
        
        public void setSets(Integer sets) {
            this.sets = sets;
        }
        
        public Integer getReps() {
            return reps;
        }
        
        public void setReps(Integer reps) {
            this.reps = reps;
        }
        
        public Boolean getCompleted() {
            return completed;
        }
        
        public void setCompleted(Boolean completed) {
            this.completed = completed;
        }
    }
}
