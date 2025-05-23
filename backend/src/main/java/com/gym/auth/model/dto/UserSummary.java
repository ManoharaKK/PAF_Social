package com.gym.auth.model.dto;

import com.gym.auth.model.User;

public class UserSummary {
    private Long id;
    private String username;
    private String fullName;
    
    public UserSummary() {
    }
    
    public UserSummary(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.fullName = user.getFullName();
    }
    
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
} 