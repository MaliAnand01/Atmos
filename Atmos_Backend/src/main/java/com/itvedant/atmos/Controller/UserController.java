package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Service.UserService;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /** Admin: list all users */
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    /** Get user profile */
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(u -> ResponseEntity.ok((Object) toPublicUser(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    /** Update user profile */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User updates) {
        try {
            User updated = userService.updateUser(id, updates);
            return ResponseEntity.ok(toPublicUser(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** Delete user */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted."));
    }

    private Map<String, Object> toPublicUser(User u) {
        return Map.of(
            "id",       u.getId(),
            "username", u.getUsername(),
            "email",    u.getEmail(),
            "role",     u.getRole()
        );
    }
}
