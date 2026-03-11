package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.Booking;
import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Repo.EventRepository;
import com.itvedant.atmos.Repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
public class EventService {
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public EventService(EventRepository eventRepository, BookingRepository bookingRepository,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    /** Paginated version for the Discover page */
    public Page<Event> getAllEventsPaged(Pageable pageable) {
        return eventRepository.findAll(Objects.requireNonNull(pageable));

    }

    /** Search events by title or venue name (server-side) */
    public List<Event> searchEvents(String query) {
        if (query == null || query.isBlank()) return getAllEvents();
        return eventRepository.searchByTitleOrVenue(query.trim());
    }

    /** Filter events by category */
    public List<Event> getEventsByCategory(String category) {
        if (category == null || category.isBlank() || category.equalsIgnoreCase("All"))
            return getAllEvents();
        return eventRepository.findByCategoryIgnoreCase(category);
    }

    public Optional<Event> getEventById(Long id) {
        if (id == null) return Optional.empty();
        return eventRepository.findById(id);
    }

    public List<Event> getEventsByOrganizer(Long organizerId) {
        if (organizerId == null)
            return List.of();
        return eventRepository.findByOrganizerId(organizerId);
    }

    // The core logic for the React Vibe Slider — ±2 range gives richer results
    public List<Event> getEventsByVibe(int vibeLevel) {
        return eventRepository.findByEnergyLevelBetween(
                Math.max(1, vibeLevel - 2),
                Math.min(10, vibeLevel + 2)
        );
    }

    public Event createEvent(Event event) {
        if (event == null) {
            throw new RuntimeException("Event data must not be null");
        }
        return eventRepository.save(Objects.requireNonNull(event));
    }

    @Transactional // Rolls back if anything fails
    public Booking bookEvent(Long userId, Long eventId) {
        if (userId == null || eventId == null) {
            throw new RuntimeException("User ID and Event ID must not be null");
        }
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (event.getAvailableCapacity() <= 0) {
            throw new RuntimeException("Event is sold out!");
        }

        // Decrease capacity
        event.setAvailableCapacity(event.getAvailableCapacity() - 1);
        eventRepository.save(event);

        // Create booking
        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setStatus("ACTIVE");

        return bookingRepository.save(Objects.requireNonNull(booking));
    }

    public Event updateEvent(Long id, Event updates) {
        if (id == null) throw new RuntimeException("ID must not be null");
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        if (updates.getTitle() != null) event.setTitle(updates.getTitle());
        if (updates.getDescription() != null) event.setDescription(updates.getDescription());
        if (updates.getEnergyLevel() != null) event.setEnergyLevel(updates.getEnergyLevel());
        if (updates.getImageUrl() != null) event.setImageUrl(updates.getImageUrl());
        if (updates.getDateTime() != null) event.setDateTime(updates.getDateTime());
        if (updates.getTotalCapacity() != null) {
            int sold = event.getTotalCapacity() - event.getAvailableCapacity();
            event.setTotalCapacity(updates.getTotalCapacity());
            event.setAvailableCapacity(Math.max(0, updates.getTotalCapacity() - sold));
        }
        if (updates.getPrice() != null) event.setPrice(updates.getPrice());
        if (updates.getVenue() != null) event.setVenue(updates.getVenue());
        if (updates.getCategory() != null) event.setCategory(updates.getCategory());
        
        return eventRepository.save(Objects.requireNonNull(event));
    }

    public void deleteEvent(Long id) {
        if (id == null)
            return;
        eventRepository.deleteById(id);
    }
}
