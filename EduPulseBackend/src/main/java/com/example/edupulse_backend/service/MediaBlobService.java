package com.example.edupulse_backend.service;

import com.example.edupulse_backend.model.Media;
import com.example.edupulse_backend.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaBlobService {
    
    private final MediaRepository mediaRepository;
    
    /**
     * Store a media file in MongoDB as a BLOB
     */
    public Media storeMedia(MultipartFile file, String relatedEntity, String relatedEntityId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is required");
        }
        
        String contentType = file.getContentType();
        String mediaType = contentType != null && contentType.startsWith("image") ? "image" : "video";
        
        // Generate a unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".") ? 
                originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = UUID.randomUUID().toString() + extension;
        
        Media media = Media.builder()
                .fileName(filename)
                .contentType(contentType)
                .content(file.getBytes())
                .fileSize(file.getSize())
                .mediaType(mediaType)
                .relatedEntity(relatedEntity)
                .relatedEntityId(relatedEntityId)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return mediaRepository.save(media);
    }
    
    /**
     * Update an existing media file for a related entity (e.g., profile picture)
     */
    public Media updateMedia(MultipartFile file, String relatedEntity, String relatedEntityId, String mediaType) throws IOException {
        // First, try to find existing media for this entity
        Optional<Media> existingMedia = mediaRepository.findByRelatedEntityAndRelatedEntityIdAndMediaType(
                relatedEntity, relatedEntityId, mediaType);
        
        if (existingMedia.isPresent()) {
            Media media = existingMedia.get();
            // Update existing media
            if (file.getContentType() != null) {
                media.setContentType(file.getContentType());
            }
            media.setContent(file.getBytes());
            media.setFileSize(file.getSize());
            media.setUpdatedAt(LocalDateTime.now());
            return mediaRepository.save(media);
        } else {
            // Create new media if none exists
            return storeMedia(file, relatedEntity, relatedEntityId);
        }
    }
    
    /**
     * Retrieve media content as byte array
     */
    public ResponseEntity<?> getMedia(String id) {
        Optional<Media> mediaOptional = mediaRepository.findById(id);
        
        if (mediaOptional.isPresent()) {
            Media media = mediaOptional.get();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(media.getContentType()))
                    .body(media.getContent());
        }
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Media not found");
    }
    
    /**
     * Get media by ID
     */
    public Optional<Media> getMediaById(String id) {
        return mediaRepository.findById(id);
    }
    
    /**
     * Get media by related entity and ID
     */
    public Optional<Media> getMediaByRelatedEntityAndId(String relatedEntity, String relatedEntityId, String mediaType) {
        return mediaRepository.findByRelatedEntityAndRelatedEntityIdAndMediaType(relatedEntity, relatedEntityId, mediaType);
    }
    
    /**
     * Delete media by ID
     */
    public void deleteMedia(String id) {
        mediaRepository.deleteById(id);
    }
}