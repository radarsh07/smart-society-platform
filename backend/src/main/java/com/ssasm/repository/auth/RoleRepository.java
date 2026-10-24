package com.ssasm.repository.auth;

import java.util.Optional;
import com.ssasm.entity.auth.Role;
import com.ssasm.enums.RoleName;
import com.ssasm.repository.BaseRepository;

/**
 * Repository for role master data.
 */
public interface RoleRepository extends BaseRepository<Role, Long> {

  Optional<Role> findByName(RoleName name);

  boolean existsByName(RoleName name);
}