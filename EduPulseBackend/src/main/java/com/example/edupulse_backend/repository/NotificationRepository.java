package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Find all notifications for a specific recipient
    List<Notification> findByRecipientId(String recipientId);
    
    // Find all unread notifications for a recipient
    List<Notification> findByRecipientIdAndReadFalse(String recipientId);
    
    // Count unread notifications for a recipient
    long countByRecipientIdAndReadFalse(String recipientId);
}