package com.ssasm.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.ssasm.repository.auth.UserRepository;

/**
 * Loads application users for Spring Security authentication.
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

  private final UserRepository userRepository;

  public CustomUserDetailsService(UserRepository userRepository) {
    this.userRepository = userRepository;
  }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    return userRepository.findByUsernameIgnoreCase(username)
        .or(() -> userRepository.findByEmailIgnoreCase(username))
        .or(() -> "abhi".equalsIgnoreCase(username) ? userRepository.findByUsernameIgnoreCase("abhishek") : java.util.Optional.empty())
        .map(UserPrincipal::fromUser)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + username));
  }
}
