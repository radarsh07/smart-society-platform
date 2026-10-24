package com.ssasm.entity.security;

import java.time.LocalDateTime;
import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.society.Resident;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "document_access_requests")
public class DocumentAccessRequest extends BaseEntity {

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @Column(name = "requested_by", nullable = false)
  private String requestedBy;

  @Column(name = "document_type", nullable = false)
  private String documentType;

  @Column(name = "status", nullable = false, length = 30)
  private String status = "PENDING"; // PENDING, APPROVED, REJECTED, EXPIRED

  @Column(name = "temporary_token")
  private String temporaryToken;

  @Column(name = "expires_at")
  private LocalDateTime expiresAt;
}
