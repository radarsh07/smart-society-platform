package com.ssasm.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;
import com.ssasm.entity.auth.Role;
import com.ssasm.enums.RoleName;
import com.ssasm.repository.auth.RoleRepository;

/**
 * Seeds the four approved login roles for the platform.
 */
@Configuration
public class AuthBootstrapConfig {

  @Bean
  @Transactional
  public CommandLineRunner seedRoles(RoleRepository roleRepository) {
    return args -> {
      createRoleIfMissing(roleRepository, RoleName.SOCIETY_ADMIN, "Highest authority for the single society");
      createRoleIfMissing(roleRepository, RoleName.RESIDENT, "Resident account for flat members");
      createRoleIfMissing(roleRepository, RoleName.SECURITY_GUARD, "Security gate and visitor verification account");
      createRoleIfMissing(roleRepository, RoleName.SOCIETY_STAFF, "Society staff operational account");
    };
  }

  private void createRoleIfMissing(RoleRepository roleRepository, RoleName roleName, String description) {
    if (!roleRepository.existsByName(roleName)) {
      roleRepository.save(new Role(roleName, description));
    }
  }
}
