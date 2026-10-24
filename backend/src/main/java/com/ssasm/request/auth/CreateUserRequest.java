package com.ssasm.request.auth;

import com.ssasm.enums.RoleName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Admin-driven user creation request DTO.
 */
@Getter
@Setter
public class CreateUserRequest {

  @NotBlank(message = "Username is required")
  @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
  private String username;

  @NotBlank(message = "Full name is required")
  @Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
  private String fullName;

  @NotBlank(message = "Email is required")
  @Email(message = "Email must be valid")
  @Size(max = 150, message = "Email must be at most 150 characters")
  private String email;

  @NotBlank(message = "Phone number is required")
  @Pattern(regexp = "^[6-9][0-9]{9}$", message = "Phone number must be a valid 10-digit number")
  private String phoneNumber;

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
  @Pattern(
      regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,100}$",
      message = "Password must contain upper, lower, digit, and special character")
  private String password;

  @NotNull(message = "Role is required")
  private RoleName role;
}