package com.gym.auth.model;

import javax.persistence.*;
import java.util.Date;

@Entity
@Table(name = "progress_history")
public class ProgressHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "progress_id", nullable = false)
    private Progress progress;
    
    @Column(name = "measurement_value", nullable = false)
    private Double measurementValue;
    
    @Column(name = "recorded_at")
    @Temporal(TemporalType.TIMESTAMP)
    private Date recordedAt;
    
    @Column
    private String notes;
    
    public ProgressHistory() {
    }
    
    public ProgressHistory(Progress progress, Double measurementValue, String notes) {
        this.progress = progress;
        this.measurementValue = measurementValue;
        this.notes = notes;
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public Progress getProgress() {
        return progress;
    }
    
    public void setProgress(Progress progress) {
        this.progress = progress;
    }
    
    public Double getMeasurementValue() {
        return measurementValue;
    }
    
    public void setMeasurementValue(Double measurementValue) {
        this.measurementValue = measurementValue;
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
    
    @PrePersist
    protected void onCreate() {
        recordedAt = new Date();
    }
} 