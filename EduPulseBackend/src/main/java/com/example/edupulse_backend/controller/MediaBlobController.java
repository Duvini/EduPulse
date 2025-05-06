package com.example.edupulse_backend.controller;

import com.example.edupulse_backend.model.Media;
import com.example.edupulse_backend.payload.response.ResponseDto;
import com.example.edupulse_backend.service.MediaBlobService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/media-blob")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class MediaBlobController {

    private final MediaBlobService mediaBlobService;
    
    /**
     * Get media content by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getMedia(@PathVariable String id) {
        return mediaBlobService.getMedia(id);
    }
    
    /**
     * Get media metadata for a related entity
     */
    @GetMapping("/metadata/{relatedEntity}/{relatedEntityId}/{mediaType}")
    public ResponseEntity<ResponseDto> getMediaMetadata(
            @PathVariable String relatedEntity,
            @PathVariable String relatedEntityId,
            @PathVariable String mediaType) {
        try {
            Optional<Media> media = mediaBlobService.getMediaByRelatedEntityAndId(
                    relatedEntity, relatedEntityId, mediaType);
            
            if (media.isPresent()) {
                Media mediaObj = media.get();
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("id", mediaObj.getId());
                metadata.put("fileName", mediaObj.getFileName());
                metadata.put("contentType", mediaObj.getContentType());
                metadata.put("fileSize", mediaObj.getFileSize());
                metadata.put("mediaType", mediaObj.getMediaType());
                metadata.put("createdAt", mediaObj.getCreatedAt());
                metadata.put("updatedAt", mediaObj.getUpdatedAt());
                
                return ResponseEntity.ok(new ResponseDto(false, metadata));
            } else {
                return ResponseEntity.ok(new ResponseDto(false, null));
            }
        } catch (Exception e) {
            log.error("Error retrieving media metadata", e);
            return ResponseEntity.internalServerError()
                    .body(new ResponseDto(true, "Error retrieving media metadata: " + e.getMessage()));
        }
    }
    
    /**
     * Get media metadata directly by ID (for blob URLs)
     */
    @GetMapping("/metadata/id/{mediaId}")
    public ResponseEntity<ResponseDto> getMediaMetadataById(@PathVariable String mediaId) {
        try {
            Optional<Media> mediaOptional = mediaBlobService.getMediaById(mediaId);
            
            if (mediaOptional.isPresent()) {
                Media mediaObj = mediaOptional.get();
                Map<String, Object> metadata = new HashMap<>();
                metadata.put("id", mediaObj.getId());
                metadata.put("fileName", mediaObj.getFileName());
                metadata.put("contentType", mediaObj.getContentType());
                metadata.put("fileSize", mediaObj.getFileSize());
                metadata.put("mediaType", mediaObj.getMediaType());
                metadata.put("createdAt", mediaObj.getCreatedAt());
                metadata.put("updatedAt", mediaObj.getUpdatedAt());
                
                return ResponseEntity.ok(new ResponseDto(false, metadata));
            } else {
                return ResponseEntity.ok(new ResponseDto(false, null));
            }
        } catch (Exception e) {
            log.error("Error retrieving media metadata by ID", e);
            return ResponseEntity.internalServerError()
                    .body(new ResponseDto(true, "Error retrieving media metadata: " + e.getMessage()));
        }
    }
    
    /**
     * Delete media by ID
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto> deleteMedia(@PathVariable String id) {
        try {
            mediaBlobService.deleteMedia(id);
            return ResponseEntity.ok(new ResponseDto(false, "Media deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting media", e);
            return ResponseEntity.internalServerError()
                    .body(new ResponseDto(true, "Error deleting media: " + e.getMessage()));
        }
    }
}