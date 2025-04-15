package com.example.edupulse_backend.service.impl;
import com.example.edupulse_backend.config.FileStorageConfig;
import com.example.edupulse_backend.exception.FileStorageException;
import com.example.edupulse_backend.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaStorageServiceImpl implements MediaStorageService {

    private final FileStorageConfig fileStorageConfig;

    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final List<String> VIDEO_EXTENSIONS = Arrays.asList("mp4", "mov", "avi");

    @Override
    public List<String> saveMediaFiles(MultipartFile[] files) {
        if (files.length > 3) {
            throw new FileStorageException("Maximum 3 media files are allowed.");
        }

        List<String> mediaPaths = new ArrayList<>();

        for (MultipartFile file : files) {
            String ext = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();
            String folder;
            if (IMAGE_EXTENSIONS.contains(ext)) {
                folder = fileStorageConfig.getImageFolder();
            } else if (VIDEO_EXTENSIONS.contains(ext)) {
                folder = fileStorageConfig.getVideoFolder();
                validateVideoDuration(file);
            } else {
                throw new FileStorageException("Unsupported file type: " + ext);
            }

            String fileName = UUID.randomUUID() + "." + ext;
            Path path = Paths.get(fileStorageConfig.getBase() + folder + fileName);
            try {
                Files.createDirectories(path.getParent());
                Files.write(path, file.getBytes());
                mediaPaths.add("/" + path.toString());
            } catch (IOException e) {
                throw new FileStorageException("Failed to store file " + fileName, e);
            }
        }
        return mediaPaths;
    }

    private void validateVideoDuration(MultipartFile file) {
        try {
            Path tempFile = Files.createTempFile("video", ".tmp");
            Files.write(tempFile, file.getBytes());
            Process process = new ProcessBuilder("ffprobe", "-v", "error", "-show_entries",
                    "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", tempFile.toString())
                    .redirectErrorStream(true)
                    .start();
            Scanner scanner = new Scanner(process.getInputStream());
            if (scanner.hasNext()) {
                double duration = Double.parseDouble(scanner.next().trim());
                if (duration > 30.0) {
                    throw new FileStorageException("Video must be less than 30 seconds.");
                }
            }
            Files.deleteIfExists(tempFile);
        } catch (IOException e) {
            throw new FileStorageException("Video duration validation failed.", e);
        }
    }
}
