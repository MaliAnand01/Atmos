package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import java.util.concurrent.TimeUnit;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    // Returns all active events; cached for 5 minutes to reduce server load
    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        CacheControl cacheControl = CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic();
        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(eventService.getAllEvents());
    }

    // Full-text search by event title or venue name
    @GetMapping("/search")
    public List<Event> searchEvents(@RequestParam(name = "q", defaultValue = "") String query) {
        return eventService.searchEvents(query);
    }

    // Filters events by category; returns all if category is "All" or blank
    @GetMapping("/category")
    public List<Event> getByCategory(@RequestParam(name = "name", defaultValue = "All") String category) {
        return eventService.getEventsByCategory(category);
    }

    // Returns a single event by ID
    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Returns active events within ±2 energy levels of the selected vibe
    @GetMapping("/vibe")
    public List<Event> getEventsByVibe(@RequestParam int level) {
        return eventService.getEventsByVibe(level);
    }

    // Returns all events created by a specific organizer
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<?> getEventsByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
    }

    // Returns all events held at a specific venue
    @GetMapping("/venue/{venueId}")
    public ResponseEntity<?> getEventsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(eventService.getEventsByVenue(venueId));
    }

    // Creates a new event; organizers must be approved before they can post
    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long loggedInUserId = ((Number) auth.getPrincipal()).longValue();

        try {
            return ResponseEntity.ok(eventService.createEvent(event, loggedInUserId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    // Updates mutable fields of an existing event
    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return ResponseEntity.ok(eventService.updateEvent(id, event));
    }

    // Soft-deletes an event by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully."));
    }

    // Books tickets for a user; decrements available capacity atomically
    @PostMapping("/{eventId}/book/{userId}")
    public ResponseEntity<?> bookEvent(@PathVariable Long userId,
                                       @PathVariable Long eventId,
                                       @RequestParam(defaultValue = "1") Integer quantity) {
        try {
            return ResponseEntity.ok(eventService.bookEvent(userId, eventId, quantity));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}