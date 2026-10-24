package com.ssasm.audit;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;

/**
 * Structured audit event for authentication actions.
 */
@Getter
@Builder
public class AuthenticationAuditEvent {

  private LocalDateTime timestamp;
  private String username;
  private String ipAddress;
  private String action;
  private String result;
  private String detail;
}
