package com.ssasm.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public health check and ping endpoint for Render / cloud monitoring.
 */
@RestController
public class HealthController {

  @GetMapping("/")
  public ResponseEntity<Map<String, Object>> root() {
    Map<String, Object> response = new HashMap<>();
    response.put("status", "UP");
    response.put("service", "Smart Society Management Backend");
    response.put("version", "1.0.0");
    response.put("cloud", "Render.com");
    return ResponseEntity.ok(response);
  }

  @GetMapping("/health")
  public ResponseEntity<Map<String, Object>> health() {
    Map<String, Object> response = new HashMap<>();
    response.put("status", "UP");
    response.put("timestamp", System.currentTimeMillis());
    return ResponseEntity.ok(response);
  }

  @GetMapping("/api/health")
  public ResponseEntity<Map<String, Object>> apiHealth() {
    Map<String, Object> response = new HashMap<>();
    response.put("status", "UP");
    response.put("timestamp", System.currentTimeMillis());
    return ResponseEntity.ok(response);
  }
}

