package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    /**
     * Find all notifications for a specific user, sorted by creation date (newest first)
     */
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    
    /**
     * Find unread notifications for a specific user
     */
    List<Notification> findByRecipientIdAndReadOrderByCreatedAtDesc(String recipientId, boolean read);
    
    /**
     * Count unread notifications for a specific user
     */
    long countByRecipientIdAndRead(String recipientId, boolean read);
    
    /**
     * Find notifications created after a specific time for a recipient
     */
    List<Notification> findByRecipientIdAndCreatedAtAfterOrderByCreatedAtAsc(String recipientId, LocalDateTime timestamp);
}