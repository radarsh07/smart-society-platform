package com.ssasm.entity.community;

import com.ssasm.entity.BaseEntity;
import com.ssasm.entity.auth.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "staff")
public class Staff extends BaseEntity {

  @NotBlank
  @Size(max = 150)
  @Column(name = "full_name", nullable = false, length = 150)
  private String fullName;

  @Size(max = 100)
  @Column(name = "specialization", length = 100)
  private String specialization;

  @Size(max = 20)
  @Column(name = "phone_number", length = 20)
  private String phoneNumber;

  @Size(max = 150)
  @Column(name = "email", length = 150)
  private String email;

  @Size(max = 100)
  @Column(name = "work_status", length = 100)
  private String workStatus = "AVAILABLE";

  @OneToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;
}
