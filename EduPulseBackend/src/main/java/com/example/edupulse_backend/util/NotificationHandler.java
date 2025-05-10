package com.example.edupulse_backend.util;

import com.example.edupulse_backend.model.Notification;
import com.example.edupulse_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationHandler {

    private final NotificationService notificationService;

    /**
     * Send like notification
     */
    @Async("notificationTaskExecutor")
    public void sendLikeNotification(String recipientId, String senderId, String senderName, String postId) {
        try {
            String content = senderName + " liked your post";
            notificationService.createDetailedNotification(
                recipientId,
                senderId,
                senderName,
                postId,
                null,
                Notification.NotificationType.LIKE,
                content
            );
            log.debug("Like notification sent from {} to {}", senderId, recipientId);
        } catch (Exception e) {
            log.error("Error sending like notification: {}", e.getMessage());
        }
    }

    /**
     * Send comment notification
     */
    @Async("notificationTaskExecutor")
    public void sendCommentNotification(String recipientId, String senderId, String senderName, 
                                       String postId, String commentId, String commentText) {
        try {
            // Truncate comment text if it's too long for the notification
            String truncatedComment = commentText.length() > 50 ? 
                commentText.substring(0, 47) + "..." : commentText;
                
            String content = senderName + " commented on your post: \"" + truncatedComment + "\"";
            notificationService.createDetailedNotification(
                recipientId,
                senderId,
                senderName,
                postId,
                commentId,
                Notification.NotificationType.COMMENT,
                content
            );
            log.debug("Comment notification sent from {} to {}", senderId, recipientId);
        } catch (Exception e) {
            log.error("Error sending comment notification: {}", e.getMessage());
        }
    }

    /**
     * Send reply notification
     */
    @Async("notificationTaskExecutor")
    public void sendReplyNotification(String recipientId, String senderId, String senderName, 
                                    String postId, String commentId, String replyText) {
        try {
            // Truncate reply text if it's too long for the notification
            String truncatedReply = replyText.length() > 50 ? 
                replyText.substring(0, 47) + "..." : replyText;
                
            String content = senderName + " replied to your comment: \"" + truncatedReply + "\"";
            notificationService.createDetailedNotification(
                recipientId,
                senderId,
                senderName,
                postId,
                commentId,
                Notification.NotificationType.REPLY,
                content
            );
            log.debug("Reply notification sent from {} to {}", senderId, recipientId);
        } catch (Exception e) {
            log.error("Error sending reply notification: {}", e.getMessage());
        }
    }

    /**
     * Send follow notification
     */
    @Async("notificationTaskExecutor")
    public void sendFollowNotification(String recipientId, String senderId, String senderName) {
        try {
            String content = senderName + " started following you";
            notificationService.createNotification(
                recipientId,
                senderId,
                senderName,
                Notification.NotificationType.FOLLOW,
                content
            );
            log.debug("Follow notification sent from {} to {}", senderId, recipientId);
        } catch (Exception e) {
            log.error("Error sending follow notification: {}", e.getMessage());
        }
    }

    /**
     * Send system notification (for administrative messages)
     */
    @Async("notificationTaskExecutor")
    public void sendSystemNotification(String recipientId, String messageContent) {
        try {
            notificationService.createNotification(
                recipientId,
                "SYSTEM",
                "System",
                Notification.NotificationType.SYSTEM,
                messageContent
            );
            log.debug("System notification sent to {}", recipientId);
        } catch (Exception e) {
            log.error("Error sending system notification: {}", e.getMessage());
        }
    }

    /**
     * Send mention notification
     */
    @Async("notificationTaskExecutor")
    public void sendMentionNotification(String recipientId, String senderId, String senderName, 
                                      String postId, String commentId, String contentSnippet) {
        try {
            String content = senderName + " mentioned you: \"" + contentSnippet + "\"";
            notificationService.createDetailedNotification(
                recipientId,
                senderId,
                senderName,
                postId,
                commentId,
                Notification.NotificationType.MENTION,
                content
            );
            log.debug("Mention notification sent from {} to {}", senderId, recipientId);
        } catch (Exception e) {
            log.error("Error sending mention notification: {}", e.getMessage());
        }
    }
}