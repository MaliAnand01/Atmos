package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Repo.EventRepository;
import com.itvedant.atmos.Repo.UserRepository;
import com.itvedant.atmos.Repo.VenueRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

// hero stats
@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final EventRepository eventRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public StatsController(EventRepository eventRepository,
                           VenueRepository venueRepository,
                           UserRepository userRepository,
                           BookingRepository bookingRepository) {
        this.eventRepository = eventRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @GetMapping
    public ResponseEntity<?> getStats() {
        long totalEvents   = eventRepository.count();
        long totalVenues   = venueRepository.count();
        long totalBookings = bookingRepository.count();
        long totalUsers    = userRepository.count();

        return ResponseEntity.ok(Map.of(
                "events",   totalEvents,
                "venues",   totalVenues,
                "bookings", totalBookings,
                "users",    totalUsers
        ));
    }
}
