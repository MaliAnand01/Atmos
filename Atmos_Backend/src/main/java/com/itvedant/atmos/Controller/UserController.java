package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Service.UserService;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;



    // get all users
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: Admin access required."));
        }
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
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long loggedInUserId = (Long) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        
        if (!loggedInUserId.equals(id) && !isAdmin) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: You can only update your own profile."));
        }

        if (!isAdmin) {
            updates.setOrganizerStatus(null);
            updates.setRole(null);
            updates.setVerified(null);
        }

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
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long loggedInUserId = (Long) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        
        if (!loggedInUserId.equals(id) && !isAdmin) {
            return ResponseEntity.status(403).body(Map.of("error", "Forbidden: You do not have permission to delete this account."));
        }

        userService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted."));
    }
}
