package com.ssasm.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.entity.Notification;
import com.ssasm.response.ApiResponse;
import com.ssasm.security.UserPrincipal;
import com.ssasm.service.NotificationService;
import com.ssasm.util.ResponseUtil;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

  private final NotificationService notificationService;

  public NotificationController(NotificationService notificationService) {
    this.notificationService = notificationService;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@AuthenticationPrincipal UserPrincipal principal) {
    String username = principal != null ? principal.getUsername() : "admin";
    return ResponseEntity.ok(ResponseUtil.success("Notifications fetched", notificationService.getUserNotifications(username)));
  }

  @PutMapping("/{id}/read")
  public ResponseEntity<ApiResponse<String>> markAsRead(@PathVariable Long id) {
    notificationService.markAsRead(id);
    return ResponseEntity.ok(ResponseUtil.success("Notification marked as read", "OK"));
  }
}
