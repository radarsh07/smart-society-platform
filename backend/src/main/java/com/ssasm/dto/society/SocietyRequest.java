package com.ssasm.dto.society;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * Request DTO for creating or updating a society.
 */
@Getter
@Setter
public class SocietyRequest {

  @NotBlank
  @Size(max = 150)
  private String societyName;

  @Size(max = 100)
  private String registrationNumber;

  @NotBlank
  @Size(max = 255)
  private String addressLine1;

  @Size(max = 255)
  private String addressLine2;

  @NotBlank
  @Size(max = 100)
  private String city;

  @NotBlank
  @Size(max = 100)
  private String state;

  @NotBlank
  @Size(max = 20)
  private String pincode;

  @Size(max = 20)
  private String contactPhone;

  @Email(message = "Contact email must be a valid email format")
  @Size(max = 150)
  private String contactEmail;

  public void setContactEmail(String contactEmail) {
    this.contactEmail = (contactEmail != null && !contactEmail.isBlank()) ? contactEmail.trim() : null;
  }

  public void setRegistrationNumber(String registrationNumber) {
    this.registrationNumber = (registrationNumber != null && !registrationNumber.isBlank()) ? registrationNumber.trim() : null;
  }

  public void setAddressLine2(String addressLine2) {
    this.addressLine2 = (addressLine2 != null && !addressLine2.isBlank()) ? addressLine2.trim() : null;
  }

  public void setContactPhone(String contactPhone) {
    this.contactPhone = (contactPhone != null && !contactPhone.isBlank()) ? contactPhone.trim() : null;
  }
}
