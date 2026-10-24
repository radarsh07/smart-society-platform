package com.ssasm.repository.auth;

import java.util.Optional;
import com.ssasm.entity.auth.User;
import com.ssasm.repository.BaseRepository;

/**
 * Repository for authentication users.
 */
public interface UserRepository extends BaseRepository<User, Long> {

  Optional<User> findByUsernameIgnoreCase(String username);

  Optional<User> findByEmailIgnoreCase(String email);

  Optional<User> findByPhoneNumber(String phoneNumber);

  boolean existsByUsernameIgnoreCase(String username);

  boolean existsByUsernameIgnoreCaseAndIdNot(String username, Long id);

  boolean existsByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);

  boolean existsByPhoneNumber(String phoneNumber);

  boolean existsByPhoneNumberAndIdNot(String phoneNumber, Long id);
}