package com.ssasm.dto.community;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StaffResponse {

  private Long id;
  private String fullName;
  private String specialization;
  private String phoneNumber;
  private String email;
  private String workStatus;
  private Long userId;
  private boolean active;
}
