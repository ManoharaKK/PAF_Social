package com.gym.auth.service;

import org.springframework.web.multipart.MultipartFile;
 
public interface FileStorageService {
    String storeFile(MultipartFile file, String directory);
    void deleteFile(String fileName);
} 