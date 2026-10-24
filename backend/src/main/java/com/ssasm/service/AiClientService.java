package com.ssasm.service;

import java.util.Map;

public interface AiClientService {
  Map<String, String> classifyComplaint(String text);
  Map<String, Object> getPredictiveMaintenanceSchedule();
}
