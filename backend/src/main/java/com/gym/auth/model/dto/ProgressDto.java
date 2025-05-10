package com.gym.auth.model.dto;

import java.util.Date;

public class ProgressDto {
    private Long id;
    private Long userId;
    private String goalType;
    private String goalDescription;
    private Double initialValue;
    private Double currentValue;
    private Double targetValue;
    private String unit;
    private Date startedAt;
    private Date targetDate;
    private Date updatedAt;
    private Boolean isCompleted;
    private Double progressPercentage;
    
    public ProgressDto() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getUserId() {
        return userId;
    }
    
    public void setUserId(Long userId) {
        this.userId = userId;
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
    
    public Double getProgressPercentage() {
        return progressPercentage;
    }
    
    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }
} 