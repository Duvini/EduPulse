<<<<<<< HEAD
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
=======
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

    // New method for time-based filtering
    List<Notification> findByRecipientIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            String recipientId, LocalDateTime startDateTime, LocalDateTime endDateTime);
>>>>>>> 47a8b707de7c1b39b0a56824c1f1f28778a6d1dc
}