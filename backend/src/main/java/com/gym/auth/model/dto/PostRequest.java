package com.gym.auth.model.dto;

public class PostRequest {
    private String text;
    
    public PostRequest() {
    }
    
    public PostRequest(String text) {
        this.text = text;
    }
    
    public String getText() {
        return text;
    }
    
    public void setText(String text) {
        this.text = text;
    }
} 