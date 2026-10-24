package com.ssasm.service.impl;

import java.nio.charset.StandardCharsets;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.entity.community.Complaint;
import com.ssasm.entity.community.MaintenanceBill;
import com.ssasm.entity.society.Resident;
import com.ssasm.entity.visitor.VisitorInvitation;
import com.ssasm.repository.community.ComplaintRepository;
import com.ssasm.repository.community.MaintenanceBillRepository;
import com.ssasm.repository.society.ResidentRepository;
import com.ssasm.repository.visitor.VisitorInvitationRepository;
import com.ssasm.service.ReportService;

@Service
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

  private final ResidentRepository residentRepository;
  private final VisitorInvitationRepository visitorInvitationRepository;
  private final ComplaintRepository complaintRepository;
  private final MaintenanceBillRepository maintenanceBillRepository;

  public ReportServiceImpl(
      ResidentRepository residentRepository,
      VisitorInvitationRepository visitorInvitationRepository,
      ComplaintRepository complaintRepository,
      MaintenanceBillRepository maintenanceBillRepository) {
    this.residentRepository = residentRepository;
    this.visitorInvitationRepository = visitorInvitationRepository;
    this.complaintRepository = complaintRepository;
    this.maintenanceBillRepository = maintenanceBillRepository;
  }

  @Override
  public byte[] generateResidentReportCsv() {
    StringBuilder sb = new StringBuilder();
    sb.append("ID,Full Name,Phone,Email,Status\n");
    List<Resident> residents = residentRepository.findAll();
    for (Resident r : residents) {
      sb.append(r.getId()).append(",")
        .append(escapeCsv(r.getFullName())).append(",")
        .append(escapeCsv(r.getPhoneNumber())).append(",")
        .append(escapeCsv(r.getEmail())).append(",")
        .append(r.isActive() ? "ACTIVE" : "INACTIVE").append("\n");
    }
    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  @Override
  public byte[] generateVisitorReportCsv() {
    StringBuilder sb = new StringBuilder();
    sb.append("ID,Visitor Name,Phone,Company,Purpose,Status\n");
    List<VisitorInvitation> visitors = visitorInvitationRepository.findAll();
    for (VisitorInvitation v : visitors) {
      sb.append(v.getId()).append(",")
        .append(escapeCsv(v.getVisitorName())).append(",")
        .append(escapeCsv(v.getVisitorPhone())).append(",")
        .append(escapeCsv(v.getVisitorCompany())).append(",")
        .append(escapeCsv(v.getPurpose())).append(",")
        .append(escapeCsv(v.getPassStatus() != null ? v.getPassStatus().name() : "PENDING")).append("\n");
    }
    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  @Override
  public byte[] generateComplaintReportCsv() {
    StringBuilder sb = new StringBuilder();
    sb.append("ID,Ticket Number,Subject,Priority,Status,Resident\n");
    List<Complaint> complaints = complaintRepository.findAll();
    for (Complaint c : complaints) {
      sb.append(c.getId()).append(",")
        .append(escapeCsv(c.getTicketNumber())).append(",")
        .append(escapeCsv(c.getSubject())).append(",")
        .append(c.getPriority()).append(",")
        .append(c.getStatus()).append(",")
        .append(escapeCsv(c.getResident() != null ? c.getResident().getFullName() : "N/A")).append("\n");
    }
    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  @Override
  public byte[] generateMaintenanceReportCsv() {
    StringBuilder sb = new StringBuilder();
    sb.append("ID,Bill Number,Total Amount,Paid Amount,Outstanding,Status\n");
    List<MaintenanceBill> bills = maintenanceBillRepository.findAll();
    for (MaintenanceBill b : bills) {
      sb.append(b.getId()).append(",")
        .append(escapeCsv(b.getBillNumber())).append(",")
        .append(b.getTotalAmount()).append(",")
        .append(b.getPaidAmount()).append(",")
        .append(b.getOutstandingAmount()).append(",")
        .append(b.getStatus()).append("\n");
    }
    return sb.toString().getBytes(StandardCharsets.UTF_8);
  }

  private String escapeCsv(String data) {
    if (data == null) return "";
    return "\"" + data.replace("\"", "\"\"") + "\"";
  }
}
