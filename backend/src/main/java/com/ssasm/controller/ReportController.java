package com.ssasm.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.ssasm.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

  private final ReportService reportService;

  public ReportController(ReportService reportService) {
    this.reportService = reportService;
  }

  @GetMapping("/export")
  public ResponseEntity<byte[]> exportReport(
      @RequestParam String type,
      @RequestParam(defaultValue = "csv") String format) {
    byte[] data;
    String filename;

    switch (type.toLowerCase()) {
      case "resident":
        data = reportService.generateResidentReportCsv();
        filename = "resident_report.csv";
        break;
      case "visitor":
        data = reportService.generateVisitorReportCsv();
        filename = "visitor_report.csv";
        break;
      case "complaint":
        data = reportService.generateComplaintReportCsv();
        filename = "complaint_report.csv";
        break;
      case "maintenance":
      default:
        data = reportService.generateMaintenanceReportCsv();
        filename = "maintenance_report.csv";
        break;
    }

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
        .contentType(MediaType.parseMediaType("text/csv"))
        .body(data);
  }
}
