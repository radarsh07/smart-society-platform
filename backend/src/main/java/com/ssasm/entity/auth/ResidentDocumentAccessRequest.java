package com.ssasm.entity.auth;

import java.time.LocalDateTime;
import com.ssasm.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Placeholder for admin access requests to sensitive resident documents.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "resident_document_access_requests")
public class ResidentDocumentAccessRequest extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "requested_by_user_id", nullable = false)
  private User requestedByUser;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_user_id", nullable = false)
  private User residentUser;

  @Column(name = "purpose", nullable = false, length = 255)
  private String purpose;

  @Column(name = "expires_at", nullable = false)
  private LocalDateTime expiresAt;
}