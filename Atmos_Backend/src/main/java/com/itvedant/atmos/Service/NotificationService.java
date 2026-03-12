package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.Notification;
import com.itvedant.atmos.Repo.NotificationRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Objects;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createNotification(Long userId, String message, String type) {
        Notification notification = new Notification();
        notification.setUserId(Objects.requireNonNull(userId));
        notification.setMessage(message);
        notification.setType(type);
        notificationRepository.save(notification);
    }

    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(Objects.requireNonNull(userId));
    }

    public void markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(Objects.requireNonNull(notificationId))
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(Objects.requireNonNull(userId));
    }
}
