package com.ssasm.entity.visitor;

import java.time.LocalDateTime;
import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.society.Resident;
import com.ssasm.enums.VisitorPassStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Invitation issued to a visitor for a resident or service request.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "visitor_invitations")
public class VisitorInvitation extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @NotBlank
  @Size(max = 150)
  @Column(name = "visitor_name", nullable = false, length = 150)
  private String visitorName;

  @NotBlank
  @Size(max = 20)
  @Column(name = "visitor_phone", nullable = false, length = 20)
  private String visitorPhone;

  @Size(max = 100)
  @Column(name = "visitor_company", length = 100)
  private String visitorCompany;

  @Size(max = 255)
  @Column(name = "purpose", length = 255)
  private String purpose;

  @Column(name = "expected_arrival")
  private LocalDateTime expectedArrival;

  @Column(name = "expected_departure")
  private LocalDateTime expectedDeparture;

  @Enumerated(EnumType.STRING)
  @Column(name = "pass_status", nullable = false, length = 30)
  private VisitorPassStatus passStatus = VisitorPassStatus.PENDING;

  @Size(max = 100)
  @Column(name = "qr_code_token", length = 100)
  private String qrCodeToken;

  @Column(name = "approved_at")
  private LocalDateTime approvedAt;

  @Column(name = "verified_at")
  private LocalDateTime verifiedAt;

  @Column(name = "entry_time")
  private LocalDateTime entryTime;

  @Column(name = "exit_time")
  private LocalDateTime exitTime;
}
