package com.ssasm.request.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Change-password request DTO.
 */
@Getter
@Setter
public class ChangePasswordRequest {

  @NotBlank(message = "Current password is required")
  @Size(min = 8, max = 100, message = "Current password must be at least 8 characters long")
  private String currentPassword;

  @NotBlank(message = "New password is required")
  @Size(min = 8, max = 100, message = "New password must be at least 8 characters long")
  @Pattern(
      regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,100}$",
      message = "New password must contain upper, lower, digit, and special character")
  private String newPassword;
}