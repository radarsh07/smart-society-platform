package com.ssasm.dto.society;

import com.ssasm.enums.OccupancyType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Public self-registration request for new resident members.
 */
@Getter
@Setter
public class ResidentSelfRegistrationRequest {

  @NotNull(message = "Building selection is required")
  private Long buildingId;

  @NotNull(message = "Flat selection is required")
  private Long flatId;

  @NotBlank(message = "Unique username is required")
  @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
  private String username;

  @NotBlank(message = "Full legal name is required")
  @Size(max = 150)
  private String fullName;

  @NotBlank(message = "Email address is required")
  @Email(message = "Invalid email format")
  @Size(max = 150)
  private String email;

  @NotBlank(message = "Phone number is required")
  @Size(max = 20)
  private String phoneNumber;

  @NotNull(message = "Occupancy type is required")
  private OccupancyType occupancyType;

  @NotBlank(message = "Password is required")
  @Size(min = 8, max = 100, message = "Password must be at least 8 characters long")
  private String password;
}
