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

    /** GET /api/events?page=0&size=10 — supports optional pagination, defaults to all */
    @GetMapping
    public ResponseEntity<?> getAllEvents(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size) {
        if (page != null) {
            // Return paginated response
            return ResponseEntity.ok(eventService.getAllEventsPaged(
                    PageRequest.of(page, size, Sort.by("dateTime").ascending())));
        }
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    /** GET /api/events/search?q=techno — server-side search by title or venue */
    @GetMapping("/search")
    public List<Event> searchEvents(@RequestParam(name = "q", defaultValue = "") String query) {
        return eventService.searchEvents(query);
    }

    /** GET /api/events/category?name=Techno — filter by category */
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

    // React will call: /api/events/vibe?level=8
    @GetMapping("/vibe")
    public List<Event> getEventsByVibe(@RequestParam int level) {
        return eventService.getEventsByVibe(level);
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<?> getEventsByOrganizer(@PathVariable Long organizerId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
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