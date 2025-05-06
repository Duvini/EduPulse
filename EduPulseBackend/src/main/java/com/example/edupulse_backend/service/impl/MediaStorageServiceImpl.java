package com.example.edupulse_backend.service.impl;

import com.example.edupulse_backend.config.FileStorageConfig;
import com.example.edupulse_backend.exception.FileValidationException;
import com.example.edupulse_backend.model.Media;
import com.example.edupulse_backend.service.MediaBlobService;
import com.example.edupulse_backend.service.MediaStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaStorageServiceImpl implements MediaStorageService {

    private final FileStorageConfig fileStorageConfig;
    private final MediaBlobService mediaBlobService;

    private static final List<String> IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final List<String> VIDEO_EXTENSIONS = Arrays.asList("mp4", "mov", "avi");

    @Override
    public List<String> saveMediaFiles(MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return Collections.emptyList();
        }
        
        if (files.length > 3) {
            throw new FileValidationException("Maximum 3 media files are allowed.");
        }

        List<String> mediaIds = new ArrayList<>();

        for (MultipartFile file : files) {
            String ext = FilenameUtils.getExtension(file.getOriginalFilename()).toLowerCase();
            String mediaType;
            
            if (IMAGE_EXTENSIONS.contains(ext)) {
                mediaType = "image";
            } else if (VIDEO_EXTENSIONS.contains(ext)) {
                mediaType = "video";
                validateVideoDuration(file);
            } else {
                throw new FileValidationException("Unsupported file type: " + ext);
            }

            try {
                // Store the media file in MongoDB as a BLOB
                Media media = mediaBlobService.storeMedia(file, "post", UUID.randomUUID().toString());
                
                // Return blob URL format
                String blobUrl = "blob:" + media.getId();
                mediaIds.add(blobUrl);
                
                log.info("Media file saved as BLOB with ID: {}", media.getId());
            } catch (IOException e) {
                throw new FileValidationException("Failed to store file", e);
            }
        }
        return mediaIds;
    }

    private void validateVideoDuration(MultipartFile file) {
        // Video duration validation logic remains the same
        // In a real application, you would implement proper video duration validation
        log.info("Video duration validation would be performed here");
    }
}