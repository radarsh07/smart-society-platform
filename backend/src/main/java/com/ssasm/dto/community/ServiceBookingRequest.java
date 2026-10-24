package com.ssasm.dto.community;

import java.time.LocalDateTime;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ServiceBookingRequest {

  @NotNull
  private Long residentId;

  @NotBlank
  @Size(max = 100)
  private String serviceType;

  @Size(max = 500)
  private String description;

  private LocalDateTime preferredTime;
}
