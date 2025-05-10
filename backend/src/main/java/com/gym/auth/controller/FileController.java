package com.gym.auth.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/files")
public class FileController {
    
    private static final Logger logger = Logger.getLogger(FileController.class.getName());
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    private static final String IMAGE_DIRECTORY = "images";
    private static final String VIDEO_DIRECTORY = "videos";
    
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(IMAGE_DIRECTORY).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                String contentType = "image/jpeg";
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                }
                
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.severe("Error serving image: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/videos/{filename:.+}")
    public ResponseEntity<Resource> getVideo(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(uploadDir).resolve(VIDEO_DIRECTORY).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .contentType(MediaType.parseMediaType("video/mp4"))
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.severe("Error serving video: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/check")
    public ResponseEntity<String> checkFileAccess() {
        logger.info("Checking file access");
        File uploads = new File(uploadDir);
        StringBuilder response = new StringBuilder();
        
        response.append("Upload directory exists: ").append(uploads.exists()).append("\n");
        response.append("Upload directory is directory: ").append(uploads.isDirectory()).append("\n");
        response.append("Upload directory can read: ").append(uploads.canRead()).append("\n");
        
        try {
            File imagesDir = new File(uploads, "images");
            response.append("Images directory exists: ").append(imagesDir.exists()).append("\n");
            response.append("Images directory can read: ").append(imagesDir.canRead()).append("\n");
            
            if (imagesDir.exists() && imagesDir.isDirectory()) {
                File[] files = imagesDir.listFiles();
                response.append("Files in images directory: ").append(files != null ? files.length : 0).append("\n");
                
                if (files != null) {
                    for (File file : files) {
                        response.append("File: ").append(file.getName())
                                .append(", Readable: ").append(file.canRead())
                                .append("\n");
                    }
                }
            }
        } catch (Exception e) {
            response.append("Error checking directories: ").append(e.getMessage());
        }
        
        return ResponseEntity.ok(response.toString());
    }
    
    private ResponseEntity<Resource> getFileResource(String fileName, String subDirectory) {
        try {
            // Get the absolute path to the file
            Path filePath = Paths.get(uploadDir).resolve(subDirectory).resolve(fileName).normalize().toAbsolutePath();
            logger.info("Looking for file at: " + filePath.toString());
            
            // Check if the file exists on disk
            boolean fileExists = Files.exists(filePath);
            logger.info("File exists: " + fileExists);
            
            // Get directory contents for debugging
            try {
                Files.list(Paths.get(uploadDir).resolve(subDirectory))
                    .forEach(p -> logger.info("Available file: " + p.getFileName()));
            } catch (IOException e) {
                logger.warning("Could not list directory contents: " + e.getMessage());
            }
            
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists()) {
                String contentType = determineContentType(fileName, subDirectory);
                
                logger.info("Successfully serving file: " + fileName + " with content type: " + contentType);
                
                return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                    .body(resource);
            } else {
                logger.warning("File not found: " + fileName);
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException ex) {
            logger.severe("Error creating URL for file: " + fileName + ", error: " + ex.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Determine content type based on file extension
     */
    private String determineContentType(String fileName, String subDirectory) {
        String contentType;
        
        if (subDirectory.equals("images")) {
            if (fileName.toLowerCase().endsWith(".png")) {
                contentType = "image/png";
            } else if (fileName.toLowerCase().endsWith(".gif")) {
                contentType = "image/gif";
            } else if (fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg")) {
                contentType = "image/jpeg";
            } else {
                contentType = "application/octet-stream";
            }
        } else {
            contentType = "video/mp4";
        }
        
        return contentType;
    }
} 