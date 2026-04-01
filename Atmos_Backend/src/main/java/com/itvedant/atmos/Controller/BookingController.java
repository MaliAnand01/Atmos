package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Service.BookingService;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long loggedInUserId = (Long) auth.getPrincipal();
        
        // check if user is admin or owner
        if (!loggedInUserId.equals(userId) && !auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. You can only view your own bookings."));
        }
        
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<?> getOrganizerBookings(@PathVariable Long organizerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long loggedInUserId = (Long) auth.getPrincipal();
        
        // check if user is admin or owner
        if (!loggedInUserId.equals(organizerId) && !auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"))) {
            return ResponseEntity.status(403).body(Map.of("error", "Access denied. You can only view bookings for your events."));
        }

        return ResponseEntity.ok(bookingService.getOrganizerBookings(organizerId));
    }

    @PutMapping("/{bookingId}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        try {
            bookingService.cancelBooking(bookingId);
            return ResponseEntity.ok(Map.of("message", "Booking cancelled successfully."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }
}
