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
 * Placeholder for resident approval or rejection of document access requests.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "resident_document_access_approvals")
public class ResidentDocumentAccessApproval extends BaseEntity {

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "request_id", nullable = false)
  private ResidentDocumentAccessRequest request;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_user_id", nullable = false)
  private User residentUser;

  @Column(name = "approved", nullable = false)
  private boolean approved;

  @Column(name = "decision_at", nullable = false)
  private LocalDateTime decisionAt;

  @Column(name = "remarks", length = 255)
  private String remarks;
}