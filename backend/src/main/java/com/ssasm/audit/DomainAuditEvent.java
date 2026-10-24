package com.ssasm.audit;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

/**
 * Structured audit event for domain actions such as create, update, and delete.
 */
@Getter
@Builder
public class DomainAuditEvent {

  private LocalDateTime timestamp;
  private String username;
  private String role;
  private String ipAddress;
  private String action;
  private String entityName;
  private String entityId;
  private String result;
  private String detail;
}
