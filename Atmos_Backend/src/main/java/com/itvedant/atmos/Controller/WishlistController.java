package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Service.WishlistService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {
    private final WishlistService wishlistService;



    @PostMapping("/{userId}/{eventId}")
    public ResponseEntity<?> toggleWishlist(@PathVariable Long userId, @PathVariable Long eventId) {
        try {
            String message = wishlistService.toggleWishlist(userId, eventId);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getWishlist(@PathVariable Long userId) {
        return ResponseEntity.ok(wishlistService.getUserWishlist(userId));
    }
}
