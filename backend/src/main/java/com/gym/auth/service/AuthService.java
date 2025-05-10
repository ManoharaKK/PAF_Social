package com.gym.auth.service;

import com.gym.auth.model.JwtResponse;
import com.gym.auth.model.LoginRequest;
import com.gym.auth.model.MessageResponse;
import com.gym.auth.model.RegisterRequest;

public interface AuthService {
    
    JwtResponse authenticateUser(LoginRequest loginRequest);
    
    MessageResponse registerUser(RegisterRequest registerRequest);
} 