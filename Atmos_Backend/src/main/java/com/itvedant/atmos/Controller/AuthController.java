package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Register a new user.
     * Body: { username, email, password, role? }
     * Role defaults to ROLE_USER. Clients may send ROLE_ORGANIZER.
     * ROLE_ADMIN is never accepted via this endpoint.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String email    = body.get("email");
            String password = body.get("password");
            String role     = body.getOrDefault("role", "ROLE_USER");

            // Safety: never allow self-registration as admin
            if ("ROLE_ADMIN".equalsIgnoreCase(role)) {
                role = "ROLE_USER";
            }

            if (username == null || email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username, email and password are required."));
            }

            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);
            user.setRole(role);

            User saved = userService.registerUser(user);
            return ResponseEntity.ok(toPublicUser(saved));
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("Duplicate entry")) {
                return ResponseEntity.status(409).body(Map.of("error", "Email or username already exists."));
            }
            return ResponseEntity.badRequest().body(Map.of("error", msg != null ? msg : "Registration failed."));
        }
    }

    /**
     * Login with email + password.
     * Returns user info (no password) on success.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        User user = userService.login(email, password);
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password."));
        }

        return ResponseEntity.ok(toPublicUser(user));
    }

    // Strip password before returning to client
    private Map<String, Object> toPublicUser(User u) {
        return Map.of(
            "id",       u.getId(),
            "username", u.getUsername(),
            "email",    u.getEmail(),
            "role",     u.getRole()
        );
    }
}
