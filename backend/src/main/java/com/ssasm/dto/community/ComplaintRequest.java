package com.ssasm.dto.community;

import java.util.List;
import com.ssasm.enums.ComplaintPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ComplaintRequest {

  @NotNull
  private Long residentId;

  @NotNull
  private Long categoryId;

  @NotBlank
  @Size(max = 150)
  private String subject;

  @NotBlank
  private String description;

  private ComplaintPriority priority = ComplaintPriority.MEDIUM;

  private List<@Size(max = 250) String> imageUrls;
}
