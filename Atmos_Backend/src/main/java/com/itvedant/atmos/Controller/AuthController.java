package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Service.UserService;
import com.itvedant.atmos.DTO.UserRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import com.itvedant.atmos.security.JwtUtil;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    // register
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

            // make org pending
            if ("ROLE_ORGANIZER".equalsIgnoreCase(role)) {
                user.setOrganizerStatus("PENDING");
            }

            User saved = userService.registerUser(user);
            com.itvedant.atmos.DTO.UserResponseDTO response = userService.mapToResponse(saved);
            response.setToken(jwtUtil.generateToken(saved.getEmail(), saved.getRole(), saved.getId()));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("Duplicate entry")) {
                return ResponseEntity.status(409).body(Map.of("error", "Email or username already exists."));
            }
            return ResponseEntity.badRequest().body(Map.of("error", msg != null ? msg : "Registration failed."));
        }
    }

    // login
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

        com.itvedant.atmos.DTO.UserResponseDTO response = userService.mapToResponse(user);
        response.setToken(jwtUtil.generateToken(user.getEmail(), user.getRole(), user.getId()));
        return ResponseEntity.ok(response);
    }

    // verify otp
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

    // resend otp
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
