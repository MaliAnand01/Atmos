package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Service.UserService;
import com.itvedant.atmos.DTO.UserRequestDTO;
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

    /** Register a new user */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserRequestDTO body) {
        try {
            String role = body.getRole() != null ? body.getRole() : "ROLE_USER";

            if ("ROLE_ADMIN".equalsIgnoreCase(role)) {
                role = "ROLE_USER";
            }

            if (body.getUsername() == null || body.getEmail() == null || body.getPassword() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username, email and password are required."));
            }

            User user = new User();
            user.setUsername(body.getUsername());
            user.setEmail(body.getEmail());
            user.setPassword(body.getPassword());
            user.setRole(role);
            user.setPhone(body.getPhone());
            user.setOrganizationName(body.getOrganizationName());
            user.setPanGstin(body.getPanGstin());

            // Set status PENDING for Organizers
            if ("ROLE_ORGANIZER".equalsIgnoreCase(role)) {
                user.setOrganizerStatus("PENDING");
            }

            User saved = userService.registerUser(user);
            return ResponseEntity.ok(userService.mapToResponse(saved));
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("Duplicate entry")) {
                return ResponseEntity.status(409).body(Map.of("error", "Email or username already exists."));
            }
            return ResponseEntity.badRequest().body(Map.of("error", msg != null ? msg : "Registration failed."));
        }
    }

    /** Authenticate and login */
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

        return ResponseEntity.ok(userService.mapToResponse(user));
    }

    /** Verify OTP */
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        try {
            Long userId = Long.parseLong(body.get("userId"));
            String otp = body.get("otp");
            boolean success = userService.verifyOtp(userId, otp);
            if (success) {
                return ResponseEntity.ok(Map.of("message", "Account verified successfully."));
            } else {
                return ResponseEntity.status(400).body(Map.of("error", "Invalid or expired OTP."));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Resend OTP */
    @PostMapping("/resend-otp")
    public ResponseEntity<?> resendOtp(@RequestBody Map<String, String> body) {
        try {
            Long userId = Long.parseLong(body.get("userId"));
            userService.resendOtp(userId);
            return ResponseEntity.ok(Map.of("message", "New OTP sent to your email."));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
