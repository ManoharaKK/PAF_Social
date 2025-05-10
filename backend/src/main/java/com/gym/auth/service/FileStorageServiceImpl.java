package com.gym.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.logging.Logger;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger logger = Logger.getLogger(FileStorageServiceImpl.class.getName());

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    @Override
    public String storeFile(MultipartFile file, String subDirectory) {
        try {
            // Create directories if they don't exist
            Path uploadPath = Paths.get(uploadDir).resolve(subDirectory).toAbsolutePath();
            logger.info("Creating upload directory if needed: " + uploadPath);
            
            if (!Files.exists(uploadPath)) {
                logger.info("Creating directories: " + uploadPath);
                Files.createDirectories(uploadPath);
            }
            
            // Generate a unique filename
            String originalFileName = file.getOriginalFilename();
            String fileExtension = "";
            
            if (originalFileName != null && originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            String fileName = UUID.randomUUID().toString() + fileExtension;
            Path targetLocation = uploadPath.resolve(fileName);
            
            logger.info("Storing file at: " + targetLocation);
            
            // Copy the file to the target location
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            
            // Make sure the file is readable
            if (!Files.isReadable(targetLocation)) {
                logger.warning("File is not readable after saving: " + targetLocation);
            } else {
                logger.info("File stored successfully and is readable: " + fileName);
            }
            
            return fileName;
        } catch (IOException ex) {
            logger.severe("Failed to store file: " + ex.getMessage());
            throw new RuntimeException("Failed to store file", ex);
        }
    }

    @Override
    public void deleteFile(String filePath) {
        try {
            Path fileToDelete = Paths.get(uploadDir).resolve(filePath).toAbsolutePath();
            logger.info("Deleting file: " + fileToDelete);
            
            Files.deleteIfExists(fileToDelete);
            logger.info("File deleted successfully: " + filePath);
        } catch (IOException ex) {
            logger.severe("Failed to delete file: " + filePath + ", error: " + ex.getMessage());
        }
    }
} 