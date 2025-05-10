package com.gym.auth.model.dto;

import java.util.Date;

public class ProgressHistoryDto {
    private Long id;
    private Long progressId;
    private Double value;
    private Date recordedAt;
    private String notes;
    
    public ProgressHistoryDto() {
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Long getProgressId() {
        return progressId;
    }
    
    public void setProgressId(Long progressId) {
        this.progressId = progressId;
    }
    
    public Double getValue() {
        return value;
    }
    
    public void setValue(Double value) {
        this.value = value;
    }
    
    public Date getRecordedAt() {
        return recordedAt;
    }
    
    public void setRecordedAt(Date recordedAt) {
        this.recordedAt = recordedAt;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
} 