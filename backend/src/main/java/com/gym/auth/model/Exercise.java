package com.gym.auth.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "exercises")
public class Exercise {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column
    private Integer sets = 3;
    
    @Column
    private Integer reps = 10;
    
    @Column
    private Boolean completed = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_schedule_id")
    @JsonIgnore // Prevent circular reference in JSON serialization
    private WorkoutSchedule workoutSchedule;
    
    @Column(name = "created_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date createdAt;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    public Exercise() {
    }
    
    public Exercise(String name, Integer sets, Integer reps, WorkoutSchedule workoutSchedule) {
        this.name = name;
        this.sets = sets;
        this.reps = reps;
        this.workoutSchedule = workoutSchedule;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
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
    
    public WorkoutSchedule getWorkoutSchedule() {
        return workoutSchedule;
    }
    
    public void setWorkoutSchedule(WorkoutSchedule workoutSchedule) {
        this.workoutSchedule = workoutSchedule;
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
}
