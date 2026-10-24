package com.ssasm.dto.visitor;

import com.ssasm.enums.VisitorPassStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VisitorApprovalRequest {

  @NotNull
  private VisitorPassStatus passStatus;

  private String notes;
}
