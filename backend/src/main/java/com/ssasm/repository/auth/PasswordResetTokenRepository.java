package com.ssasm.repository.auth;

import java.util.Optional;
import com.ssasm.entity.auth.PasswordResetToken;
import com.ssasm.repository.BaseRepository;

/**
 * Repository placeholder for password reset tokens.
 */
public interface PasswordResetTokenRepository extends BaseRepository<PasswordResetToken, Long> {

  Optional<PasswordResetToken> findByTokenHash(String tokenHash);
}