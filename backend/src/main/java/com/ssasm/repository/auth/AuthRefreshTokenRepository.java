package com.ssasm.repository.auth;

import java.util.Optional;
import com.ssasm.entity.auth.AuthRefreshToken;
import com.ssasm.repository.BaseRepository;

/**
 * Repository placeholder for refresh token persistence.
 */
public interface AuthRefreshTokenRepository extends BaseRepository<AuthRefreshToken, Long> {

  Optional<AuthRefreshToken> findByTokenJti(String tokenJti);
}