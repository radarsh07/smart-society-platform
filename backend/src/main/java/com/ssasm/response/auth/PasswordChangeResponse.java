package com.ssasm.response.auth;

import lombok.Builder;
import lombok.Getter;

/**
 * Response confirming password change success.
 */
@Getter
@Builder
public class PasswordChangeResponse {

  private String message;
}