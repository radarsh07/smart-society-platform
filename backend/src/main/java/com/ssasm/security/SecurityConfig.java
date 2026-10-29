package com.ssasm.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.ssasm.constant.ApiPaths;
import com.ssasm.security.jwt.JwtAccessDeniedHandler;
import com.ssasm.security.jwt.JwtAuthenticationEntryPoint;
import com.ssasm.security.jwt.JwtAuthenticationFilter;
import com.ssasm.security.jwt.JwtTokenValidator;
import com.ssasm.security.jwt.JwtUtil;

/**
 * Spring Security setup for stateless JWT-based authentication.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity http,
      JwtAuthenticationEntryPoint authenticationEntryPoint,
      JwtAccessDeniedHandler accessDeniedHandler,
      JwtUtil jwtUtil,
      JwtTokenValidator jwtTokenValidator) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(Customizer.withDefaults())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(exception -> exception
            .authenticationEntryPoint(authenticationEntryPoint)
            .accessDeniedHandler(accessDeniedHandler))
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers(
                "/",
                "/health",
                "/api/health",
                "/actuator/**",
                ApiPaths.LOGIN,
                "/api/auth/**"
            ).permitAll()
            .requestMatchers("/error").permitAll()
            .anyRequest().authenticated())
        .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, jwtTokenValidator),
            UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
    return configuration.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOriginPattern("*");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }

}
