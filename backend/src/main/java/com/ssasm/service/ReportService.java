package com.ssasm.service;

public interface ReportService {
  byte[] generateResidentReportCsv();
  byte[] generateVisitorReportCsv();
  byte[] generateComplaintReportCsv();
  byte[] generateMaintenanceReportCsv();
}
