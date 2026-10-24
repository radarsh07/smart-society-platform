package com.ssasm.service;

import java.util.List;
import com.ssasm.entity.Notification;

public interface NotificationService {
  Notification sendNotification(String recipientUsername, String title, String message, String type);
  List<Notification> getUserNotifications(String recipientUsername);
  void markAsRead(Long notificationId);
}
