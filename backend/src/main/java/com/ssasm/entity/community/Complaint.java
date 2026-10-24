package com.ssasm.entity.community;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.auth.User;
import com.ssasm.entity.society.Resident;
import com.ssasm.enums.ComplaintStatus;
import com.ssasm.enums.ComplaintPriority;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "complaints")
public class Complaint extends BaseEntity {

  @NotBlank
  @Size(max = 50)
  @Column(name = "ticket_number", nullable = false, unique = true, length = 50)
  private String ticketNumber;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "resident_id", nullable = false)
  private Resident resident;

  @NotNull
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private ComplaintCategory category;

  @NotBlank
  @Size(max = 150)
  @Column(name = "subject", nullable = false, length = 150)
  private String subject;

  @NotBlank
  @Column(name = "description", nullable = false, columnDefinition = "TEXT")
  private String description;

  @Enumerated(EnumType.STRING)
  @Column(name = "priority", nullable = false, length = 20)
  private ComplaintPriority priority = ComplaintPriority.MEDIUM;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  private ComplaintStatus status = ComplaintStatus.OPEN;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "assigned_staff_id")
  private User assignedStaff;

  @Column(name = "assigned_at")
  private LocalDateTime assignedAt;

  @Column(name = "resolved_at")
  private LocalDateTime resolvedAt;

  @Column(name = "closed_at")
  private LocalDateTime closedAt;

  @Column(name = "feedback_rating")
  private Integer feedbackRating;

  @Size(max = 500)
  @Column(name = "feedback_comment", length = 500)
  private String feedbackComment;

  @ElementCollection
  @CollectionTable(name = "complaint_images", joinColumns = @JoinColumn(name = "complaint_id"))
  @Column(name = "image_url")
  private List<String> imageUrls = new ArrayList<>();

  @OneToMany(mappedBy = "complaint")
  private List<ComplaintComment> comments = new ArrayList<>();

  @OneToMany(mappedBy = "complaint")
  private List<ComplaintAssignment> assignments = new ArrayList<>();
}
