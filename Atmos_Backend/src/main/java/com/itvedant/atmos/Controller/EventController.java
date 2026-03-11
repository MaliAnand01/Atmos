package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.Booking;
import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Service.EventService;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    /** Get all events (paginated) */
    @GetMapping
    public ResponseEntity<?> getAllEvents(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        if (page != null) {
            return ResponseEntity.ok(eventService.getAllEventsPaged(
                    PageRequest.of(page, size, Sort.by("dateTime").ascending())));
        }
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    /** Search events by title or venue */
    @GetMapping("/search")
    public List<Event> searchEvents(@RequestParam(name = "q", defaultValue = "") String query) {
        return eventService.searchEvents(query);
    }

    /** List events by category */
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
    public ResponseEntity<Event> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(eventService.createEvent(event));
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
    public ResponseEntity<Booking> bookEvent(@PathVariable Long eventId, @PathVariable Long userId) {
        Booking booking = eventService.bookEvent(userId, eventId);
        return ResponseEntity.ok(booking);
    }
}