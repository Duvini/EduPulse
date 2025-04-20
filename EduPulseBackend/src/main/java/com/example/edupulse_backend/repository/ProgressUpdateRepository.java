package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.ProgressUpdate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ProgressUpdateRepository extends MongoRepository<ProgressUpdate,String> {
    List<ProgressUpdate> findByUserId(String userId);
}
