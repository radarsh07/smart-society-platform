package com.ssasm.service.impl;

import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.entity.Notification;
import com.ssasm.repository.NotificationRepository;
import com.ssasm.service.NotificationService;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

  private final NotificationRepository notificationRepository;
  private final SimpMessagingTemplate messagingTemplate;

  public NotificationServiceImpl(
      NotificationRepository notificationRepository,
      SimpMessagingTemplate messagingTemplate) {
    this.notificationRepository = notificationRepository;
    this.messagingTemplate = messagingTemplate;
  }

  @Override
  public Notification sendNotification(String recipientUsername, String title, String message, String type) {
    Notification notification = new Notification();
    notification.setRecipientUsername(recipientUsername);
    notification.setTitle(title);
    notification.setMessage(message);
    notification.setType(type);
    notification.setCreatedBy("SYSTEM");
    notification.setUpdatedBy("SYSTEM");

    Notification saved = notificationRepository.save(notification);

    try {
      messagingTemplate.convertAndSendToUser(recipientUsername, "/queue/notifications", saved);
      messagingTemplate.convertAndSend("/topic/broadcast", saved);
    } catch (Exception ignored) {
    }

    return saved;
  }

  @Override
  @Transactional(readOnly = true)
  public List<Notification> getUserNotifications(String recipientUsername) {
    return notificationRepository.findByRecipientUsernameAndDeletedFalseOrderByCreatedAtDesc(recipientUsername);
  }

  @Override
  public void markAsRead(Long notificationId) {
    notificationRepository.findById(notificationId).ifPresent(n -> {
      n.setReadStatus(true);
      notificationRepository.save(n);
    });
  }
}
