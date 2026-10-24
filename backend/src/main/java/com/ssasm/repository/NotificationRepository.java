package com.ssasm.repository;

import java.util.List;
import org.springframework.stereotype.Repository;
import com.ssasm.entity.Notification;

@Repository
public interface NotificationRepository extends BaseRepository<Notification, Long> {
  List<Notification> findByRecipientUsernameAndDeletedFalseOrderByCreatedAtDesc(String recipientUsername);
  long countByRecipientUsernameAndReadStatusFalseAndDeletedFalse(String recipientUsername);
}
