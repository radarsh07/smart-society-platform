package com.ssasm.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Validation-specific error response with field-level messages.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {

  private String message;
  private String path;
  private LocalDateTime timestamp;
  private List<FieldErrorDetail> fieldErrors;

  @Getter
  @Setter
  @Builder
  @NoArgsConstructor
  @AllArgsConstructor
  public static class FieldErrorDetail {
    private String field;
    private String rejectedValue;
    private String message;
  }
}
