package com.ssasm.security.jwt;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;
import com.ssasm.constant.SecurityConstants;
import com.ssasm.entity.auth.User;
import com.ssasm.security.UserPrincipal;

/**
 * Extracts and validates JWT access tokens for each request.
 */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  private final JwtUtil jwtUtil;
  private final JwtTokenValidator jwtTokenValidator;

  public JwtAuthenticationFilter(JwtUtil jwtUtil, JwtTokenValidator jwtTokenValidator) {
    this.jwtUtil = jwtUtil;
    this.jwtTokenValidator = jwtTokenValidator;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain) throws ServletException, IOException {
    try {
      String token = jwtUtil.normalizeBearerToken(request.getHeader(SecurityConstants.AUTHORIZATION_HEADER));

      if (token != null && SecurityContextHolder.getContext().getAuthentication() == null && jwtTokenValidator.isValid(token)) {
        User user = jwtTokenValidator.resolveUser(token);
        if (user != null) {
          UserPrincipal principal = UserPrincipal.fromUser(user);
          UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
              principal,
              null,
              principal.getAuthorities());
          authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
          SecurityContextHolder.getContext().setAuthentication(authentication);
        }
      }
    } catch (Exception ignored) {
      // Ignore invalid/malformed tokens and proceed unauthenticated
    }

    filterChain.doFilter(request, response);
  }
}
