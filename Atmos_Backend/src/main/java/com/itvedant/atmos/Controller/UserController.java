package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Service.UserService;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // get all users
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(
            userService.getAllUsers().stream()
                .map(userService::mapToResponse)
                .collect(Collectors.toList())
        );
    }

    // get profile
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(u -> ResponseEntity.ok((Object) userService.mapToResponse(u)))
                .orElse(ResponseEntity.notFound().build());
    }

    // update
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody User updates) {
        try {
            User updated = userService.updateUser(id, updates);
            return ResponseEntity.ok(userService.mapToResponse(updated));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // delete
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted."));
    }
}
