package com.gym.auth.controller;

import com.gym.auth.model.User;
import com.gym.auth.model.dto.ProgressDto;
import com.gym.auth.model.dto.ProgressHistoryDto;
import com.gym.auth.security.CurrentUser;
import com.gym.auth.service.ProgressService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private static final Logger logger = LoggerFactory.getLogger(ProgressController.class);

    @Autowired
    private ProgressService progressService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getAllProgress(@CurrentUser User user) {
        try {
            if (user == null) {
                logger.error("User is null in getAllProgress");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            logger.info("Getting all progress for user ID: {}", user.getId());
            List<ProgressDto> progresses = progressService.getAllProgressForUser(user.getId());
            return ResponseEntity.ok(progresses);
        } catch (Exception e) {
            logger.error("Error in getAllProgress: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving progress: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProgress(@PathVariable Long id, @CurrentUser User user) {
        try {
            if (user == null) {
                logger.error("User is null in getProgress");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            logger.info("Getting progress ID: {} for user ID: {}", id, user.getId());
            ProgressDto progress = progressService.getProgressById(id, user.getId());
            return ResponseEntity.ok(progress);
        } catch (ResponseStatusException e) {
            logger.error("Error in getProgress: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error in getProgress: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving progress: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createProgress(@RequestBody ProgressDto progressDto, @CurrentUser User user) {
        try {
            if (user == null) {
                logger.error("User is null in createProgress");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            logger.info("Creating progress for user ID: {}", user.getId());
            ProgressDto createdProgress = progressService.createProgress(progressDto, user.getId());
            return new ResponseEntity<>(createdProgress, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error in createProgress: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating progress: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> updateProgress(@PathVariable Long id, 
                                        @RequestBody ProgressDto progressDto, 
                                        @CurrentUser User user) {
        try {
            if (user == null) {
                logger.error("User is null in updateProgress");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            logger.info("Updating progress ID: {} for user ID: {}", id, user.getId());
            ProgressDto updatedProgress = progressService.updateProgress(id, progressDto, user.getId());
            return ResponseEntity.ok(updatedProgress);
        } catch (ResponseStatusException e) {
            logger.error("Error in updateProgress: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error in updateProgress: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error updating progress: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> deleteProgress(@PathVariable Long id, @CurrentUser User user) {
        try {
            if (user == null) {
                logger.error("User is null in deleteProgress");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            logger.info("Deleting progress ID: {} for user ID: {}", id, user.getId());
            progressService.deleteProgress(id, user.getId());
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            logger.error("Error in deleteProgress: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error in deleteProgress: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error deleting progress: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getProgressHistory(@PathVariable Long id, @CurrentUser User user) {
        try {
            if (user == null) {
                logger.error("User is null in getProgressHistory");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            logger.info("Getting history for progress ID: {} for user ID: {}", id, user.getId());
            List<ProgressHistoryDto> history = progressService.getProgressHistory(id, user.getId());
            return ResponseEntity.ok(history);
        } catch (ResponseStatusException e) {
            logger.error("Error in getProgressHistory: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error in getProgressHistory: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error retrieving progress history: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> addProgressHistory(@PathVariable Long id, 
                                            @RequestBody ProgressHistoryDto historyDto, 
                                            @CurrentUser User user) {
        try {
            if (user == null) {
                logger.error("User is null in addProgressHistory");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User not authenticated");
            }
            logger.info("Adding history for progress ID: {} for user ID: {}", id, user.getId());
            ProgressHistoryDto createdHistory = progressService.addProgressHistory(id, historyDto, user.getId());
            return new ResponseEntity<>(createdHistory, HttpStatus.CREATED);
        } catch (ResponseStatusException e) {
            logger.error("Error in addProgressHistory: {}", e.getMessage());
            return ResponseEntity.status(e.getStatus()).body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error in addProgressHistory: {}", e.getMessage(), e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error adding progress history: " + e.getMessage());
        }
    }
} 