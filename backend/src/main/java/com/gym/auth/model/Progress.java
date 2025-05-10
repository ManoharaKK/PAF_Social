package com.gym.auth.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "progress")
public class Progress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private String goalType;
    
    @Column(nullable = false)
    private String goalDescription;
    
    @Column(nullable = false)
    private Double initialValue;
    
    @Column(nullable = false)
    private Double currentValue;
    
    @Column(nullable = false)
    private Double targetValue;
    
    @Column(nullable = false)
    private String unit;
    
    @Column(name = "started_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date startedAt;
    
    @Column(name = "target_date")
    @Temporal(TemporalType.DATE)
    private Date targetDate;
    
    @Column(name = "updated_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updatedAt;
    
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    public Progress() {
    }
    
    public Progress(User user, String goalType, String goalDescription, Double initialValue, 
                   Double currentValue, Double targetValue, String unit, Date targetDate) {
        this.user = user;
        this.goalType = goalType;
        this.goalDescription = goalDescription;
        this.initialValue = initialValue;
        this.currentValue = currentValue;
        this.targetValue = targetValue;
        this.unit = unit;
        this.targetDate = targetDate;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public User getUser() {
        return user;
    }
    
    public void setUser(User user) {
        this.user = user;
    }
    
    public String getGoalType() {
        return goalType;
    }
    
    public void setGoalType(String goalType) {
        this.goalType = goalType;
    }
    
    public String getGoalDescription() {
        return goalDescription;
    }
    
    public void setGoalDescription(String goalDescription) {
        this.goalDescription = goalDescription;
    }
    
    public Double getInitialValue() {
        return initialValue;
    }
    
    public void setInitialValue(Double initialValue) {
        this.initialValue = initialValue;
    }
    
    public Double getCurrentValue() {
        return currentValue;
    }
    
    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue;
    }
    
    public Double getTargetValue() {
        return targetValue;
    }
    
    public void setTargetValue(Double targetValue) {
        this.targetValue = targetValue;
    }
    
    public String getUnit() {
        return unit;
    }
    
    public void setUnit(String unit) {
        this.unit = unit;
    }
    
    public Date getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(Date startedAt) {
        this.startedAt = startedAt;
    }
    
    public Date getTargetDate() {
        return targetDate;
    }
    
    public void setTargetDate(Date targetDate) {
        this.targetDate = targetDate;
    }
    
    public Date getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public Boolean getIsCompleted() {
        return isCompleted;
    }
    
    public void setIsCompleted(Boolean isCompleted) {
        this.isCompleted = isCompleted;
    }
    
    @PrePersist
    protected void onCreate() {
        startedAt = new Date();
        updatedAt = new Date();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Date();
    }
    
    // Calculate progress percentage
    @Transient
    public Double getProgressPercentage() {
        if (initialValue.equals(targetValue)) {
            return 100.0;
        }
        
        double totalChange = targetValue - initialValue;
        double currentChange = currentValue - initialValue;
        
        // Handle different types of goals (increase or decrease)
        if (targetValue > initialValue) {
            return Math.min(100.0, Math.max(0.0, (currentChange / totalChange) * 100.0));
        } else {
            return Math.min(100.0, Math.max(0.0, (currentChange / totalChange) * 100.0));
        }
    }
} 