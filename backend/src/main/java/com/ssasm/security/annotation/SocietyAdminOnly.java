package com.ssasm.security.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import org.springframework.security.access.prepost.PreAuthorize;
import com.ssasm.constant.SecurityConstants;

/**
 * Restricts a method to Society Admin users.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@PreAuthorize("hasAuthority('ROLE_SOCIETY_ADMIN')")
public @interface SocietyAdminOnly {
}
