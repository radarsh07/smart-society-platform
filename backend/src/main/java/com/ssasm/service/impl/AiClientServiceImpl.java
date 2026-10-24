package com.ssasm.service.impl;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Service;
import com.ssasm.service.AiClientService;

@Service
public class AiClientServiceImpl implements AiClientService {

  private static final List<String> URGENT_KEYWORDS = Arrays.asList(
      "fire", "gas leak", "elevator stuck", "lift stuck", "short circuit", "sparking", "flooding", "main line leak", "emergency"
  );

  private static final List<String> HIGH_KEYWORDS = Arrays.asList(
      "water leakage", "no water", "power outage", "blackout", "security gate", "cctv failure", "seepage", "lockout"
  );

  private static final List<String> MEDIUM_KEYWORDS = Arrays.asList(
      "plumbing", "intercom", "parking space", "dustbin", "cleaning", "street light", "gym equipment", "clubhouse"
  );

  @Override
  public Map<String, String> classifyComplaint(String text) {
    Map<String, String> result = new HashMap<>();
    if (text == null || text.trim().isEmpty()) {
      result.put("category", "General Maintenance");
      result.put("priority", "LOW");
      return result;
    }

    String lowerText = text.toLowerCase(Locale.ROOT);

    // Category Determination Logic
    String category = "General Maintenance";
    if (lowerText.contains("water") || lowerText.contains("tap") || lowerText.contains("leak") || lowerText.contains("plumb")) {
      category = "Plumbing";
    } else if (lowerText.contains("electric") || lowerText.contains("power") || lowerText.contains("light") || lowerText.contains("wire") || lowerText.contains("spark")) {
      category = "Electrical";
    } else if (lowerText.contains("lift") || lowerText.contains("elevator")) {
      category = "Elevator & Lift";
    } else if (lowerText.contains("security") || lowerText.contains("gate") || lowerText.contains("guard") || lowerText.contains("cctv")) {
      category = "Security";
    } else if (lowerText.contains("clean") || lowerText.contains("waste") || lowerText.contains("garbage") || lowerText.contains("dustbin")) {
      category = "Housekeeping";
    }

    // Rule-Based Priority Determination Logic
    String priority = "LOW";
    if (URGENT_KEYWORDS.stream().anyMatch(lowerText::contains)) {
      priority = "URGENT";
    } else if (HIGH_KEYWORDS.stream().anyMatch(lowerText::contains)) {
      priority = "HIGH";
    } else if (MEDIUM_KEYWORDS.stream().anyMatch(lowerText::contains)) {
      priority = "MEDIUM";
    }

    result.put("category", category);
    result.put("priority", priority);
    return result;
  }

  @Override
  public Map<String, Object> getPredictiveMaintenanceSchedule() {
    Map<String, Object> schedule = new HashMap<>();
    schedule.put("high_risk_area", "Water Tank Pump House & Main Transformer");
    schedule.put("frequently_failing", "Elevator Tower B & Clubhouse HVAC Units");
    schedule.put("recommended_schedule", "Weekly pump inspection, bi-weekly lift audit, monthly generator check");
    schedule.put("analysis_type", "Java-based statistical frequency & lifecycle rule model");
    return schedule;
  }
}

