# Backend Architecture Notes

## Purpose
This backend is structured as a production-ready Spring Boot foundation for the Secure Smart Apartment & Society Management Platform. It contains only the architectural skeleton required for future development.

## Package Responsibilities

- `com.ssasm.constant` - shared constants used across modules.
- `com.ssasm.controller` - authentication controllers for login, profile, logout, and user creation.
- `com.ssasm.dto` - root DTO package.
- `com.ssasm.entity` - JPA base classes and future domain entities.
- `com.ssasm.exception` - custom exceptions and centralized exception handling.
- `com.ssasm.mapper` - entity-to-DTO mapping contracts.
- `com.ssasm.repository` - shared repository abstractions.
- `com.ssasm.request` - request DTO base types.
- `com.ssasm.response` - response DTOs and standard API response models.
- `com.ssasm.security` - Spring Security configuration, principals, authorization helpers, and JWT support.
- `com.ssasm.service` - service interfaces including authentication use cases.
- `com.ssasm.service.impl` - service implementations including authentication workflows.
- `com.ssasm.util` - utility helpers for dates, strings, validation, and response creation.
- `com.ssasm.validation` - future custom validation annotations and validators.
- `com.ssasm.enums` - shared enum types.
- `com.ssasm.config` - application configuration and authentication bootstrap.
- `com.ssasm.scheduler` - scheduled jobs and background processing placeholders.
- `com.ssasm.audit` - authentication audit logging and future audit-trail infrastructure.
- `com.ssasm.notification` - notification infrastructure placeholders.

## Coding Standards

- Use clear, descriptive names.
- Keep classes small and single-purpose.
- Prefer immutable constants and reusable helpers.
- Keep cross-cutting concerns out of business modules.
- Use base classes only for truly shared behavior.
- Avoid direct entity exposure to external layers.
- Keep mapping manual at the foundation stage and switch to MapStruct later if the entity graph becomes large enough to justify compile-time generated mappers.

## Naming Conventions

- Packages use lowercase names.
- Classes and interfaces use PascalCase.
- Constants use uppercase snake case.
- DTOs should be named by purpose, such as `Request` or `Response` suffixes.
- Exceptions should end with `Exception`.
- Utility classes should end with `Util`.

## Development Guidelines

- Add business modules only after the database layer is finalized.
- Keep controllers thin and delegate to services.
- Keep persistence logic inside repositories.
- Keep reusable logic inside utilities, base services, or mappers.
- Add validation close to the input boundary.
- Use centralized exception handling for consistent error responses.
- Keep audit and notification concerns separate from core business logic.

## Logging Strategy

- Application logs are split into info, warning, error, and audit streams.
- Audit logs should remain separate from general application logs.
- Logs should be rotated and retained according to environment policy.
- Sensitive data should never be written into log files.

## Authentication Architecture

### Package Responsibilities Added For Milestone 4

- `com.ssasm.controller` - authentication endpoints such as login, me, logout, and admin user creation.
- `com.ssasm.entity.auth` - authentication and authorization persistence models.
- `com.ssasm.repository.auth` - repositories for users, roles, tokens, and permission records.
- `com.ssasm.request.auth` - login, registration, and password-change request DTOs.
- `com.ssasm.response.auth` - secure response DTOs that never expose passwords.
- `com.ssasm.service.auth` - authentication use-case contract.
- `com.ssasm.mapper.auth` - manual mapping between auth entities and response DTOs.
- `com.ssasm.security` - Spring Security configuration and reusable authorization helpers.
- `com.ssasm.security.jwt` - JWT generation, validation, filter, entry point, access-denied handler, and revocation support.
- `com.ssasm.security.annotation` - reusable role-based method-security annotations.
- `com.ssasm.security.document` - future document-permission architecture placeholders.
- `com.ssasm.audit` - authentication audit logging.

### Authentication Flow

1. User submits username and password to `POST /api/auth/login`.
2. Spring Security authenticates credentials through the `AuthenticationManager` and the custom `UserDetailsService`.
3. The application loads the matching user, checks BCrypt-hashed password, and creates a JWT access token.
4. The response returns the access token, role, and safe user information only.
5. On later requests, the JWT filter reads the `Authorization: Bearer ...` header and restores the security context.
6. If the JWT is missing, invalid, expired, or revoked, the request is rejected with `401 Unauthorized`.

### JWT Lifecycle

- `JwtTokenGenerator` creates an access token after successful authentication.
- `JwtUtil` builds and parses signed claims.
- `JwtTokenValidator` checks structure, expiration, and revocation.
- `JwtAuthenticationFilter` binds a valid token to the security context.
- `InMemoryJwtRevocationService` supports logout by blacklisting the token until it expires.

### Login Sequence

1. Validate the login request body.
2. Authenticate the username and password.
3. Load the user record.
4. Generate an access token.
5. Record successful login in the audit log.
6. Return the token and safe user profile.

### Role Checking

- Spring Security roles are `ROLE_SOCIETY_ADMIN`, `ROLE_RESIDENT`, `ROLE_SECURITY_GUARD`, and `ROLE_SOCIETY_STAFF`.
- Future modules can use method-security annotations such as `@SocietyAdminOnly`.
- The default security rule keeps every endpoint protected unless explicitly permitted.

### Password Encryption

- Passwords are hashed with BCrypt before persistence.
- Plain text passwords are never stored.
- Password strength is validated before user creation or change.

### Request Flow

- Requests enter through the controller layer only.
- Validation occurs on DTOs before the service layer runs.
- The service layer contains the authentication rules and audit logging.
- The repository layer performs persistence operations.
- The security layer protects the request path before business execution.

### Document Permission Framework

- Sensitive resident document access is not direct.
- Future admin requests must go through a permission request and resident approval flow.
- Temporary access is represented in architecture only at this stage.

## Backend Folder Tree

```text
backend/
|-- pom.xml
|-- README.md
`-- src/
    `-- main/
        |-- java/
        |   `-- com/ssasm/
        |       |-- audit/
        |       |   |-- AuthenticationAuditEvent.java
        |       |   |-- AuthenticationAuditLogger.java
        |       |   |-- AuthenticationAuditService.java
        |       |   |-- AuditEvent.java
        |       |   |-- AuditRecord.java
        |       |   |-- AuditTrailService.java
        |       |   `-- package-info.java
        |       |-- config/
        |       |   |-- AuthBootstrapConfig.java
        |       |   |-- CorsConfig.java
        |       |   |-- FileUploadConfig.java
        |       |   |-- MappingConfig.java
        |       |   |-- SwaggerConfig.java
        |       |   |-- WebConfig.java
        |       |   `-- package-info.java
        |       |-- constant/
        |       |   |-- ApiPaths.java
        |       |   |-- ApplicationConstants.java
        |       |   |-- SecurityConstants.java
        |       |   `-- package-info.java
        |       |-- controller/
        |       |   |-- AuthController.java
        |       |   |-- UserController.java
        |       |   `-- package-info.java
        |       |-- entity/
        |       |   |-- BaseEntity.java
        |       |   |-- auth/
        |       |   |   |-- AuthRefreshToken.java
        |       |   |   |-- PasswordResetToken.java
        |       |   |   |-- ResidentDocumentAccessApproval.java
        |       |   |   |-- ResidentDocumentAccessRequest.java
        |       |   |   |-- Role.java
        |       |   |   |-- User.java
        |       |   |   `-- package-info.java
        |       |   `-- package-info.java
        |       |-- enums/
        |       |   |-- AccountStatus.java
        |       |   |-- RecordStatus.java
        |       |   |-- RoleName.java
        |       |   `-- package-info.java
        |       |-- exception/
        |       |   |-- ApplicationException.java
        |       |   |-- BadRequestException.java
        |       |   |-- GlobalExceptionHandler.java
        |       |   |-- ResourceNotFoundException.java
        |       |   |-- UnauthorizedException.java
        |       |   |-- ValidationException.java
        |       |   `-- package-info.java
        |       |-- mapper/
        |       |   |-- BaseMapper.java
        |       |   |-- auth/
        |       |   |   |-- AuthUserMapper.java
        |       |   |   `-- package-info.java
        |       |   `-- package-info.java
        |       |-- notification/
        |       |   |-- NotificationDispatcher.java
        |       |   |-- NotificationEvent.java
        |       |   |-- NotificationMessage.java
        |       |   `-- package-info.java
        |       |-- repository/
        |       |   |-- BaseRepository.java
        |       |   |-- auth/
        |       |   |   |-- AuthRefreshTokenRepository.java
        |       |   |   |-- PasswordResetTokenRepository.java
        |       |   |   |-- ResidentDocumentAccessApprovalRepository.java
        |       |   |   |-- ResidentDocumentAccessRequestRepository.java
        |       |   |   |-- RoleRepository.java
        |       |   |   |-- UserRepository.java
        |       |   |   `-- package-info.java
        |       |   `-- package-info.java
        |       |-- request/
        |       |   |-- BaseRequest.java
        |       |   `-- auth/
        |       |       |-- ChangePasswordRequest.java
        |       |       |-- CreateUserRequest.java
        |       |       |-- LoginRequest.java
        |       |       `-- package-info.java
        |       |-- response/
        |       |   |-- ApiResponse.java
        |       |   |-- ErrorResponse.java
        |       |   |-- ValidationErrorResponse.java
        |       |   `-- auth/
        |       |       |-- LoginResponse.java
        |       |       |-- PasswordChangeResponse.java
        |       |       |-- UserSummaryResponse.java
        |       |       `-- package-info.java
        |       |-- scheduler/
        |       |   |-- SchedulerConfig.java
        |       |   `-- package-info.java
        |       |-- security/
        |       |   |-- AuthorizationService.java
        |       |   |-- CustomUserDetailsService.java
        |       |   |-- SecurityConfig.java
        |       |   |-- UserPrincipal.java
        |       |   |-- annotation/
        |       |   |   |-- ResidentOnly.java
        |       |   |   |-- SecurityGuardOnly.java
        |       |   |   |-- SocietyAdminOnly.java
        |       |   |   |-- SocietyStaffOnly.java
        |       |   |   `-- package-info.java
        |       |   |-- document/
        |       |   |   |-- DocumentAccessDecision.java
        |       |   |   |-- DocumentAccessRequestContext.java
        |       |   |   |-- DocumentPermissionService.java
        |       |   |   `-- package-info.java
        |       |   `-- jwt/
        |       |       |-- InMemoryJwtRevocationService.java
        |       |       |-- JwtAccessDeniedHandler.java
        |       |       |-- JwtAuthenticationEntryPoint.java
        |       |       |-- JwtAuthenticationFilter.java
        |       |       |-- JwtProperties.java
        |       |       |-- JwtRevocationService.java
        |       |       |-- JwtTokenGenerator.java
        |       |       |-- JwtTokenValidator.java
        |       |       |-- JwtUtil.java
        |       |       `-- package-info.java
        |       |-- service/
        |       |   |-- BaseService.java
        |       |   |-- auth/
        |       |   |   |-- AuthService.java
        |       |   |   `-- package-info.java
        |       |   `-- impl/
        |       |       |-- AuthServiceImpl.java
        |       |       |-- BaseServiceImpl.java
        |       |       `-- package-info.java
        |       |-- util/
        |       |   |-- DateUtil.java
        |       |   |-- ResponseUtil.java
        |       |   |-- StringUtil.java
        |       |   |-- ValidationUtil.java
        |       |   `-- package-info.java
        |       `-- validation/
        |           `-- package-info.java
        `-- resources/
            |-- application.properties
            `-- logback-spring.xml
```
