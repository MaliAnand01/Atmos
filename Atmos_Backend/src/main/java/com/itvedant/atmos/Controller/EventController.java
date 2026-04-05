package com.itvedant.atmos.Controller;


import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Service.EventService;
import org.springframework.http.ResponseEntity;
import org.springframework.http.CacheControl;
import java.util.concurrent.TimeUnit;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;



    // get all
    @GetMapping
    public ResponseEntity<?> getAllEvents(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        
        // Implementing Browser Caching
        // We set the Cache-Control header to 5 minutes so the user's browser
        // doesn't send duplicate requests to our backend for this data.
        // This improves application load time and reduces server load.
        CacheControl cacheControl = CacheControl.maxAge(5, TimeUnit.MINUTES).cachePublic();
        
        if (page != null) {
            return ResponseEntity.ok()
                    .cacheControl(cacheControl)
                    .body(eventService.getAllEventsPaged(
                    PageRequest.of(page, size, Sort.by("dateTime").ascending())));
        }
        return ResponseEntity.ok()
                .cacheControl(cacheControl)
                .body(eventService.getAllEvents());
    }

    // search events
    @GetMapping("/search")
    public List<Event> searchEvents(@RequestParam(name = "q", defaultValue = "") String query) {
        return eventService.searchEvents(query);
    }

    // by category
    @GetMapping("/category")
    public List<Event> getByCategory(@RequestParam(name = "name", defaultValue = "All") String category) {
        return eventService.getEventsByCategory(category);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vibe")
    public List<Event> getEventsByVibe(@RequestParam int level) {
        return eventService.getEventsByVibe(level);
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<?> getEventsByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
    }

    @GetMapping("/venue/{venueId}")
    public ResponseEntity<?> getEventsByVenue(@PathVariable Long venueId) {
        return ResponseEntity.ok(eventService.getEventsByVenue(venueId));
    }

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getPrincipal() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        Long loggedInUserId = (Long) auth.getPrincipal();

        try {
            return ResponseEntity.ok(eventService.createEvent(event, loggedInUserId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return ResponseEntity.ok(eventService.updateEvent(id, event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.ok(Map.of("message", "Event deleted successfully."));
    }

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