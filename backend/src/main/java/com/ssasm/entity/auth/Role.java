package com.ssasm.entity.auth;

import com.ssasm.entity.BaseEntity;
import com.ssasm.enums.RoleName;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Role master used for RBAC.
 */
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "roles")
public class Role extends BaseEntity {

  @Enumerated(EnumType.STRING)
  @Column(name = "role_name", nullable = false, unique = true, length = 50)
  private RoleName name;

  @Column(name = "description", length = 255)
  private String description;

  public Role(RoleName name, String description) {
    this.name = name;
    this.description = description;
  }
}