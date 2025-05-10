package com.gym.auth.controller;

import com.gym.auth.model.JwtResponse;
import com.gym.auth.model.LoginRequest;
import com.gym.auth.model.MessageResponse;
import com.gym.auth.model.RegisterRequest;
import com.gym.auth.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest registerRequest) {
        MessageResponse messageResponse = authService.registerUser(registerRequest);
        return ResponseEntity.ok(messageResponse);
    }
} 