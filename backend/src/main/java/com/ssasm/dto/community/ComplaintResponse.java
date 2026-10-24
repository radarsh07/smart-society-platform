package com.ssasm.dto.community;

import java.time.LocalDateTime;
import java.util.List;
import com.ssasm.enums.ComplaintPriority;
import com.ssasm.enums.ComplaintStatus;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ComplaintResponse {

  private Long id;
  private String ticketNumber;
  private Long residentId;
  private String residentName;
  private Long categoryId;
  private String categoryName;
  private String subject;
  private String description;
  private ComplaintPriority priority;
  private ComplaintStatus status;
  private Long assignedStaffId;
  private String assignedStaffName;
  private LocalDateTime assignedAt;
  private LocalDateTime resolvedAt;
  private LocalDateTime closedAt;
  private Integer feedbackRating;
  private String feedbackComment;
  private List<String> imageUrls;
  private boolean active;
}
