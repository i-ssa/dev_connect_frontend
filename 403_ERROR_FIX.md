# 403 Forbidden Error Fix Guide

## Current Issue
Getting **403 Forbidden** when trying to login at `/api/users/login`

This is a **backend configuration issue**, not a frontend problem.

## Common Causes & Solutions

### 1. Spring Security CSRF Protection (Most Likely)
By default, Spring Security **blocks POST requests without CSRF tokens**.

#### ✅ Solution A: Disable CSRF for API endpoints (Recommended for REST APIs)

In your Spring Security config, add:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // ✅ Disable CSRF for REST API
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/login", "/api/users/register").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }
}
```

#### Solution B: Configure CSRF to ignore login endpoints

```java
http
    .csrf(csrf -> csrf
        .ignoringRequestMatchers("/api/users/login", "/api/users/register")
    )
```

---

### 2. CORS Configuration Missing

Frontend (localhost:5173) → Backend (localhost:8081) requires CORS.

#### ✅ Solution: Add CORS Configuration

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:5174")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

Or using `@CrossOrigin` annotation on controller:

```java
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {
    // ... your endpoints
}
```

---

### 3. Login Endpoint Requires Authentication

Your security config might be requiring authentication for the login endpoint itself (catch-22).

#### ✅ Solution: Permit login/register endpoints

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/users/login", "/api/users/register").permitAll()
    .requestMatchers("/api/**").authenticated()
    .anyRequest().permitAll()
)
```

---

### 4. Wrong HTTP Method or Endpoint

Check your backend controller:

```java
@PostMapping("/login")  // Should be POST, not GET
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // ...
}
```

Endpoint should be: `POST /api/users/login`

---

## Quick Backend Fix (All-in-One)

Add this to your Spring Boot backend:

### File: `src/main/java/org/devconnect/devconnectbackend/config/SecurityConfig.java`

```java
package org.devconnect.devconnectbackend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable()) // Disable CSRF for REST API
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/users/login", "/api/users/register").permitAll()
                .requestMatchers("/api/users/forgot-password", "/api/users/reset-password").permitAll()
                // Protected endpoints
                .requestMatchers("/api/**").authenticated()
                // Allow all other requests
                .anyRequest().permitAll()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

---

## Testing After Backend Fix

### 1. Restart Backend
```bash
./mvnw spring-boot:run
# or
mvn spring-boot:run
```

### 2. Test with curl
```bash
curl -v -X POST http://localhost:8081/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"issa.abdullah@strathmore.edu","password":"yourpassword"}'
```

**Expected:** Status 200 with JSON response containing `accessToken` and `user`

### 3. Test from Frontend
1. Clear browser cache and localStorage
2. Try login again
3. Check browser console for detailed logs (I added extra logging)

---

## Frontend Changes Made

I updated `src/API/userAPI.js` to add:
- ✅ More detailed console logging
- ✅ `credentials: 'include'` for cookie-based auth
- ✅ Better error message handling
- ✅ Non-JSON response handling

Now when you try to login, check the browser console - it will show:
- The exact URL being called
- Request credentials
- Response status
- Response headers
- Response body

This will help identify the exact issue.

---

## If Still Getting 403

1. **Check backend logs** - Spring will log the exact reason for 403
2. **Verify endpoint exists** - `/api/users/login` should be mapped
3. **Check Security config** - Login endpoint should be `.permitAll()`
4. **Verify CORS** - Should allow localhost:5173
5. **Check request format** - Should match backend DTO (email, password)

### Backend Expected Request Format
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Backend Expected Response Format
```json
{
  "accessToken": "jwt_token_here",
  "refreshToken": "refresh_token_here",
  "user": {
    "userId": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "userRole": "CLIENT"
  }
}
```

---

## Next Steps

1. ✅ **Add Security Config** to backend (see code above)
2. ✅ **Restart backend**
3. ✅ **Try login again** from frontend
4. ✅ **Check browser console** for detailed logs
5. If still failing, share backend logs

The frontend is ready - just need to fix backend security configuration!
