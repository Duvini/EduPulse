package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<Notification> findByRecipientIdAndReadOrderByCreatedAtDesc(String recipientId, boolean read);
    long countByRecipientIdAndRead(String recipientId, boolean read);
    
    // New method to find recent notifications of a specific type from a specific sender
    List<Notification> findByRecipientIdAndSenderIdAndTypeAndCreatedAtAfter(
            String recipientId, String senderId, Notification.NotificationType type, LocalDateTime since);
}