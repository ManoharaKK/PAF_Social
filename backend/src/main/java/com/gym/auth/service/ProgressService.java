package com.gym.auth.service;

import com.gym.auth.model.Progress;
import com.gym.auth.model.ProgressHistory;
import com.gym.auth.model.User;
import com.gym.auth.model.dto.ProgressDto;
import com.gym.auth.model.dto.ProgressHistoryDto;
import com.gym.auth.repository.ProgressHistoryRepository;
import com.gym.auth.repository.ProgressRepository;
import com.gym.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.transaction.Transactional;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;
    
    @Autowired
    private ProgressHistoryRepository progressHistoryRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // Get all progress for a user
    public List<ProgressDto> getAllProgressForUser(Long userId) {
        try {
            if (userId == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User ID cannot be null");
            }
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
                    
            List<Progress> progressList = progressRepository.findByUserId(userId);
            return progressList.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Log the exception
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Error retrieving progress: " + e.getMessage(), e);
        }
    }
    
    // Get a specific progress by id
    public ProgressDto getProgressById(Long progressId, Long userId) {
        Progress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
        
        // Ensure the progress belongs to the user
        if (!progress.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return convertToDto(progress);
    }
    
    // Create a new progress
    @Transactional
    public ProgressDto createProgress(ProgressDto progressDto, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Progress progress = new Progress();
        progress.setUser(user);
        progress.setGoalType(progressDto.getGoalType());
        progress.setGoalDescription(progressDto.getGoalDescription());
        progress.setInitialValue(progressDto.getInitialValue());
        progress.setCurrentValue(progressDto.getInitialValue()); // Set current value to initial value
        progress.setTargetValue(progressDto.getTargetValue());
        progress.setUnit(progressDto.getUnit());
        progress.setTargetDate(progressDto.getTargetDate());
        progress.setIsCompleted(false);
        
        Progress savedProgress = progressRepository.save(progress);
        
        // Create initial progress history entry
        ProgressHistory initialHistory = new ProgressHistory();
        initialHistory.setProgress(savedProgress);
        initialHistory.setMeasurementValue(savedProgress.getInitialValue());
        initialHistory.setNotes("Initial measurement");
        progressHistoryRepository.save(initialHistory);
        
        return convertToDto(savedProgress);
    }
    
    // Update progress
    @Transactional
    public ProgressDto updateProgress(Long progressId, ProgressDto progressDto, Long userId) {
        try {
            // Validate incoming data
            if (progressDto.getCurrentValue() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current value cannot be null");
            }
            
            Progress progress = progressRepository.findById(progressId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
            
            // Ensure the progress belongs to the user
            if (!progress.getUser().getId().equals(userId)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
            }
            
            // Check if value has changed - handle possible null values safely
            Double oldValue = progress.getCurrentValue() == null ? 0.0 : progress.getCurrentValue();
            Double newValue = progressDto.getCurrentValue() == null ? 0.0 : progressDto.getCurrentValue();
            boolean valueChanged = !oldValue.equals(newValue);
            
            // Update progress fields with null safety
            progress.setGoalType(progressDto.getGoalType());
            progress.setGoalDescription(progressDto.getGoalDescription());
            progress.setCurrentValue(newValue); // Use the null-safe value
            progress.setTargetValue(progressDto.getTargetValue() == null ? 0.0 : progressDto.getTargetValue());
            progress.setUnit(progressDto.getUnit());
            progress.setTargetDate(progressDto.getTargetDate());
            progress.setIsCompleted(progressDto.getIsCompleted());
            
            Progress updatedProgress = progressRepository.save(progress);
            
            // Create progress history entry if value changed
            if (valueChanged) {
                ProgressHistory history = new ProgressHistory();
                history.setProgress(updatedProgress);
                history.setMeasurementValue(newValue); // Use the null-safe value
                history.setNotes(progressDto.getGoalDescription() != null ? 
                                progressDto.getGoalDescription() : "Value updated");
                // Set the recorded date to current timestamp
                history.setRecordedAt(new java.util.Date());
                progressHistoryRepository.save(history);
            }
            
            return convertToDto(updatedProgress);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, 
                "Error updating progress: " + e.getMessage(), e);
        }
    }
        
    // Delete progress
    @Transactional
    public void deleteProgress(Long progressId, Long userId) {
        Progress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
        
        // Ensure the progress belongs to the user
        if (!progress.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        // Delete all history entries first
        List<ProgressHistory> histories = progressHistoryRepository.findByProgressId(progressId);
        progressHistoryRepository.deleteAll(histories);
        
        // Delete the progress record
        progressRepository.delete(progress);
    }
    
    // Get history for a progress
    public List<ProgressHistoryDto> getProgressHistory(Long progressId, Long userId) {
        Progress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
        
        // Ensure the progress belongs to the user
        if (!progress.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        return progressHistoryRepository.findByProgressIdOrderByRecordedAtDesc(progressId).stream()
                .map(this::convertHistoryToDto)
                .collect(Collectors.toList());
    }
    
    // Add a new history entry
    @Transactional
    public ProgressHistoryDto addProgressHistory(Long progressId, ProgressHistoryDto historyDto, Long userId) {
        Progress progress = progressRepository.findById(progressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Progress not found"));
        
        // Ensure the progress belongs to the user
        if (!progress.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        
        ProgressHistory history = new ProgressHistory();
        history.setProgress(progress);
        history.setMeasurementValue(historyDto.getValue());
        history.setNotes(historyDto.getNotes());
        // Set the recorded date to current timestamp
        history.setRecordedAt(new java.util.Date());
        
        // Update current value on the progress
        progress.setCurrentValue(historyDto.getValue());
        progressRepository.save(progress);
        
        ProgressHistory savedHistory = progressHistoryRepository.save(history);
        return convertHistoryToDto(savedHistory);
    }
    
    // Helper methods to convert between entities and DTOs
    private ProgressDto convertToDto(Progress progress) {
        ProgressDto dto = new ProgressDto();
        dto.setId(progress.getId());
        dto.setUserId(progress.getUser().getId());
        dto.setGoalType(progress.getGoalType());
        dto.setGoalDescription(progress.getGoalDescription());
        dto.setInitialValue(progress.getInitialValue());
        dto.setCurrentValue(progress.getCurrentValue());
        dto.setTargetValue(progress.getTargetValue());
        dto.setUnit(progress.getUnit());
        dto.setStartedAt(progress.getStartedAt());
        dto.setTargetDate(progress.getTargetDate());
        dto.setUpdatedAt(progress.getUpdatedAt());
        dto.setIsCompleted(progress.getIsCompleted());
        dto.setProgressPercentage(progress.getProgressPercentage());
        return dto;
    }
    
    private ProgressHistoryDto convertHistoryToDto(ProgressHistory history) {
        ProgressHistoryDto dto = new ProgressHistoryDto();
        dto.setId(history.getId());
        dto.setProgressId(history.getProgress().getId());
        dto.setValue(history.getMeasurementValue());
        dto.setRecordedAt(history.getRecordedAt());
        dto.setNotes(history.getNotes());
        return dto;
    }
} 