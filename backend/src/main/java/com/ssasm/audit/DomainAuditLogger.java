package com.ssasm.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Writes domain events to the dedicated audit logger.
 */
@Service
public class DomainAuditLogger implements DomainAuditService {

  private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("com.ssasm.audit");

  @Override
  public void log(DomainAuditEvent event) {
    AUDIT_LOGGER.info(
        "timestamp={} user={} role={} ip={} action={} entity={} entityId={} result={} detail={}",
        event.getTimestamp(),
        event.getUsername(),
        event.getRole(),
        event.getIpAddress(),
        event.getAction(),
        event.getEntityName(),
        event.getEntityId(),
        event.getResult(),
        event.getDetail());
  }
}
