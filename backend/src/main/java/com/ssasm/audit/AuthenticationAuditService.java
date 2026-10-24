package com.ssasm.audit;

/**
 * Contract for authentication audit logging.
 */
public interface AuthenticationAuditService {

  void log(AuthenticationAuditEvent event);
}
