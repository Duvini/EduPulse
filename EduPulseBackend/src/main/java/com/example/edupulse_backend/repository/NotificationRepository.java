package com.example.edupulse_backend.repository;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.model.Notification.NotificationType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId);
    List<Notification> findByRecipientIdAndReadOrderByCreatedAtDesc(String recipientId, boolean read);
    long countByRecipientIdAndRead(String recipientId, boolean read);
    
    // Find recent notifications (to prevent spam)
    List<Notification> findByRecipientIdAndSenderIdAndTypeAndCreatedAtAfter(
            String recipientId, String senderId, NotificationType type, LocalDateTime since);
    
    // Find by type
    List<Notification> findByRecipientIdAndTypeOrderByCreatedAtDesc(String recipientId, NotificationType type);
    
    // New pagination methods with MongoDB queries
    @Query(value="{ 'recipientId': ?0 }", sort="{ 'createdAt': -1 }")
    List<Notification> findByRecipientIdWithPagination(String recipientId, int skip, int limit);
    
    @Query(value="{ 'recipientId': ?0, 'type': ?1 }", sort="{ 'createdAt': -1 }")
    List<Notification> findByRecipientIdAndTypeWithPagination(String recipientId, NotificationType type, int skip, int limit);
    
    @Query(value="{ 'recipientId': ?0, 'read': ?1 }", sort="{ 'createdAt': -1 }")
    List<Notification> findByRecipientIdAndReadWithPagination(String recipientId, boolean read, int skip, int limit);
    
    @Query(value="{ 'recipientId': ?0, 'type': ?1, 'read': ?2 }", sort="{ 'createdAt': -1 }")
    List<Notification> findByRecipientIdAndTypeAndReadOrderByCreatedAtDesc(
            String recipientId, NotificationType type, boolean read, int skip, int limit);
    
    // Count methods for pagination
    long countByRecipientId(String recipientId);
    long countByRecipientIdAndType(String recipientId, NotificationType type);
    long countByRecipientIdAndTypeAndRead(String recipientId, NotificationType type, boolean read);
    
    // Latest notifications - fixed by removing invalid limit attribute
    @Query(value="{ 'recipientId': ?0 }", sort="{ 'createdAt': -1 }")
    List<Notification> findTopByRecipientIdOrderByCreatedAtDesc(String recipientId, int limit);
}