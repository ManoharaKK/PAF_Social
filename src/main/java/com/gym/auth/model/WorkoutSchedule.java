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
    @Column(name = "\"day\"", length = 20, nullable = false)
    private Set<String> days = new HashSet<>();
    
    // ... existing code ... 