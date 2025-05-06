package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.config.FileStorageConfig;
import com.example.edupulse_backend.payload.response.ResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
@Slf4j
public class MediaResourceController {

    private final FileStorageConfig fileStorageConfig;

    @GetMapping("/verify-directories")
    public ResponseEntity<ResponseDto> verifyDirectories() {
        Map<String, Object> result = new HashMap<>();
        try {
            // Get configured paths
            String basePath = fileStorageConfig.getBase();
            String imagesPath = basePath + fileStorageConfig.getImageFolder();
            String videosPath = basePath + fileStorageConfig.getVideoFolder();
            
            // Ensure directories exist
            createDirectoryIfNotExists(basePath);
            createDirectoryIfNotExists(imagesPath);
            createDirectoryIfNotExists(videosPath);
            
            // Count files in each directory
            int imageCount = countFiles(imagesPath);
            int videoCount = countFiles(videosPath);
            
            // Prepare result
            result.put("basePath", basePath);
            result.put("imagesPath", imagesPath);
            result.put("videosPath", videosPath);
            result.put("imageFilesCount", imageCount);
            result.put("videoFilesCount", videoCount);
            result.put("status", "Directories verified and ready");
            
            log.info("Media directories verified: images={}, videos={}", imageCount, videoCount);
            
            return ResponseEntity.ok(new ResponseDto(false, result));
        } catch (Exception e) {
            log.error("Error verifying media directories", e);
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(new ResponseDto(true, result));
        }
    }
    
    @GetMapping("/list-images")
    public ResponseEntity<ResponseDto> listImages() {
        try {
            String imagesPath = fileStorageConfig.getBase() + fileStorageConfig.getImageFolder();
            List<Map<String, String>> files = new ArrayList<>();
            
            File directory = new File(imagesPath);
            File[] imageFiles = directory.listFiles();
            
            if (imageFiles != null) {
                for (File file : imageFiles) {
                    if (file.isFile()) {
                        Map<String, String> fileInfo = new HashMap<>();
                        fileInfo.put("name", file.getName());
                        fileInfo.put("path", "/uploads/images/" + file.getName());
                        fileInfo.put("url", "/uploads/images/" + file.getName());
                        fileInfo.put("size", String.valueOf(file.length()));
                        files.add(fileInfo);
                    }
                }
            }
            
            Map<String, Object> result = new HashMap<>();
            result.put("imageFiles", files);
            result.put("count", files.size());
            
            return ResponseEntity.ok(new ResponseDto(false, result));
        } catch (Exception e) {
            log.error("Error listing image files", e);
            return ResponseEntity.internalServerError().body(
                new ResponseDto(true, "Error listing images: " + e.getMessage()));
        }
    }

    @GetMapping("/diagnose")
    public ResponseEntity<ResponseDto> diagnoseImageIssues() {
        Map<String, Object> result = new HashMap<>();
        try {
            // Get configured paths
            String basePath = fileStorageConfig.getBase();
            String imagesPath = basePath + fileStorageConfig.getImageFolder();
            
            // Check if directories exist
            File baseDir = new File(basePath);
            File imagesDir = new File(imagesPath);
            
            result.put("basePathExists", baseDir.exists());
            result.put("basePathCanRead", baseDir.canRead());
            result.put("basePathCanWrite", baseDir.canWrite());
            result.put("basePathAbsolute", baseDir.getAbsolutePath());
            
            result.put("imagesPathExists", imagesDir.exists());
            result.put("imagesPathCanRead", imagesDir.canRead());
            result.put("imagesPathCanWrite", imagesDir.canWrite());
            result.put("imagesPathAbsolute", imagesDir.getAbsolutePath());
            
            // Check WebMvcConfig resource handlers
            result.put("expectedUrl", "/uploads/images/example.jpg");
            result.put("mappedLocation", "file:" + imagesPath);
            
            // Create a test file to verify permissions
            try {
                String testFilename = "test_" + System.currentTimeMillis() + ".txt";
                File testFile = new File(imagesDir, testFilename);
                if (testFile.createNewFile()) {
                    result.put("testFileCreated", testFile.getAbsolutePath());
                    result.put("testFileUrl", "/uploads/images/" + testFilename);
                    testFile.delete(); // Clean up
                } else {
                    result.put("testFileCreated", false);
                }
            } catch (Exception e) {
                result.put("testFileError", e.getMessage());
            }
            
            // List all image files
            List<String> imageFiles = new ArrayList<>();
            if (imagesDir.exists() && imagesDir.isDirectory()) {
                File[] files = imagesDir.listFiles();
                if (files != null) {
                    for (File file : files) {
                        imageFiles.add(file.getName());
                    }
                }
            }
            result.put("existingImageFiles", imageFiles);
            
            return ResponseEntity.ok(new ResponseDto(false, result));
        } catch (Exception e) {
            log.error("Error diagnosing image issues", e);
            result.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(new ResponseDto(true, result));
        }
    }
    
    private void createDirectoryIfNotExists(String dirPath) {
        Path path = Paths.get(dirPath);
        if (!Files.exists(path)) {
            try {
                Files.createDirectories(path);
                log.info("Created directory: {}", dirPath);
            } catch (Exception e) {
                log.error("Failed to create directory {}: {}", dirPath, e.getMessage());
                throw new RuntimeException("Could not create directory: " + dirPath, e);
            }
        }
    }
    
    private int countFiles(String dirPath) {
        File directory = new File(dirPath);
        File[] files = directory.listFiles();
        return files != null ? files.length : 0;
    }
}