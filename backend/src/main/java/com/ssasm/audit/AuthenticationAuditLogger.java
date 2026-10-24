package com.ssasm.audit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Writes authentication audit events to the dedicated audit logger.
 */
@Service
public class AuthenticationAuditLogger implements AuthenticationAuditService {

  private static final Logger AUDIT_LOGGER = LoggerFactory.getLogger("com.ssasm.audit");

  @Override
  public void log(AuthenticationAuditEvent event) {
    AUDIT_LOGGER.info(
        "timestamp={} user={} ip={} action={} result={} detail={}",
        event.getTimestamp(),
        event.getUsername(),
        event.getIpAddress(),
        event.getAction(),
        event.getResult(),
        event.getDetail());
  }
}
