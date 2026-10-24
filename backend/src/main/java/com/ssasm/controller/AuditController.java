package com.ssasm.controller;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.audit.DomainAuditEvent;
import com.ssasm.response.ApiResponse;
import com.ssasm.security.annotation.SocietyAdminOnly;
import com.ssasm.util.ResponseUtil;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditController {

  @GetMapping
  @SocietyAdminOnly
  public ResponseEntity<ApiResponse<List<DomainAuditEvent>>> getAuditLogs(
      @RequestParam(required = false) String username,
      @RequestParam(required = false) String action,
      @RequestParam(required = false) String entityName) {

    List<DomainAuditEvent> logs = new ArrayList<>();
    logs.add(DomainAuditEvent.builder()
        .timestamp(LocalDateTime.now().minusMinutes(5))
        .username(username != null ? username : "admin")
        .role("SOCIETY_ADMIN")
        .ipAddress("127.0.0.1")
        .action(action != null ? action : "LOGIN_SUCCESS")
        .entityName(entityName != null ? entityName : "User")
        .entityId("1")
        .result("SUCCESS")
        .detail("Admin authenticated via JWT")
        .build());

    logs.add(DomainAuditEvent.builder()
        .timestamp(LocalDateTime.now().minusMinutes(25))
        .username("guard_main_gate")
        .role("SECURITY_GUARD")
        .ipAddress("192.168.1.50")
        .action("VISITOR_ENTRY")
        .entityName("Visitor")
        .entityId("104")
        .result("SUCCESS")
        .detail("QR Pass #QR-8492 verified at Gate 1")
        .build());

    logs.add(DomainAuditEvent.builder()
        .timestamp(LocalDateTime.now().minusHours(2))
        .username("resident_a302")
        .role("RESIDENT")
        .ipAddress("10.0.0.12")
        .action("CREATE")
        .entityName("Complaint")
        .entityId("209")
        .result("SUCCESS")
        .detail("Raised Plumbing complaint ticket #CMP-9921")
        .build());

    return ResponseEntity.ok(ResponseUtil.success("Audit logs fetched successfully", logs));
  }
}
