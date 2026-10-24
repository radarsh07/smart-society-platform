package com.ssasm.audit;

/**
 * Contract for domain-level audit logging.
 */
public interface DomainAuditService {

  void log(DomainAuditEvent event);
}
