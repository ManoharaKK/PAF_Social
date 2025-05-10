package com.gym.auth.model;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "workout_schedules")
public class WorkoutSchedule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "workout_schedule_days", 
        joinColumns = @JoinColumn(name = "workout_schedule_id", nullable = false)
    )
    @Column(name = "day_name", length = 20, nullable = false)
    private Set<String> days = new HashSet<>();
    
    @OneToMany(mappedBy = "workoutSchedule", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Exercise> exercises = new ArrayList<>();
    
    @Column(name = "intensity")
    private String intensity = "medium"; // low, medium, high
    
    @Column(name = "duration")
    private Integer duration = 45; // in minutes
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    public WorkoutSchedule() {
        this.exercises = new ArrayList<>();
        this.days = new HashSet<>();
    }
    
    public WorkoutSchedule(String title, String description, User user) {
        this();
        this.title = title;
        this.description = description;
        this.user = user;
    }
    
    // Helper methods for managing the bidirectional relationship
    public void addExercise(Exercise exercise) {
        exercises.add(exercise);
        exercise.setWorkoutSchedule(this);
    }
    
    public void removeExercise(Exercise exercise) {
        exercises.remove(exercise);
        exercise.setWorkoutSchedule(null);
    }
    
    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = new Date();
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public Set<String> getDays() {
        return days;
    }
    
    public void setDays(Set<String> days) {
        this.days = days != null ? days : new HashSet<>();
    }
    
    // Method to handle List to Set conversion for backward compatibility
    public void setDaysList(List<String> days) {
        if (days != null) {
            this.days = new HashSet<>(days);
        } else {
            this.days = new HashSet<>();
        }
    }
    
    public List<Exercise> getExercises() {
        return exercises;
    }
    
    public void setExercises(List<Exercise> exercises) {
        this.exercises = exercises != null ? exercises : new ArrayList<>();
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
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public Date getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
}
