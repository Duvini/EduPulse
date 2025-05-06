package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.Media;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MediaRepository extends MongoRepository<Media, String> {
    List<Media> findByRelatedEntityAndRelatedEntityId(String relatedEntity, String relatedEntityId);
    Optional<Media> findByRelatedEntityAndRelatedEntityIdAndMediaType(String relatedEntity, String relatedEntityId, String mediaType);
}