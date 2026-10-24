package com.ssasm.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "notifications")
public class Notification extends BaseEntity {

  @NotBlank
  @Column(name = "recipient_username", nullable = false)
  private String recipientUsername;

  @NotBlank
  @Column(name = "title", nullable = false)
  private String title;

  @NotBlank
  @Column(name = "message", nullable = false, length = 500)
  private String message;

  @Column(name = "read_status")
  private boolean readStatus = false;

  @Column(name = "type", length = 50)
  private String type = "GENERAL";
}
