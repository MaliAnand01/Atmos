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
        return eventRepository.findAllByActiveTrue();
    }

    /** Paginated events for Discover page */
    public Page<Event> getAllEventsPaged(Pageable pageable) {
        return eventRepository.findAllByActiveTrue(Objects.requireNonNull(pageable));
    }

    /** Search by title or venue */
    public List<Event> searchEvents(String query) {
        if (query == null || query.isBlank()) return getAllEvents();
        return eventRepository.searchByTitleOrVenue(query.trim());
    }

    /** Filter by category */
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

    public List<Event> getEventsByVenue(Long venueId) {
        if (venueId == null)
            return List.of();
        return eventRepository.findByVenueId(venueId);
    }

    /** Filter by Vibe energy level (±2 range) */
    public List<Event> getEventsByVibe(int vibeLevel) {
        return eventRepository.findByEnergyLevelBetween(
                Math.max(1, vibeLevel - 2),
                Math.min(10, vibeLevel + 2)
        ).stream().filter(Event::getActive).toList();
    }

    public Event createEvent(Event event) {
        if (event == null) {
            throw new RuntimeException("Event data must not be null");
        }
        
        // Security: Verify organizer is approved
        if (event.getOrganizerId() != null) {
            User organizer = userRepository.findById(Objects.requireNonNull(event.getOrganizerId()))
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
            
            if (!"APPROVED".equalsIgnoreCase(organizer.getOrganizerStatus())) {
                throw new RuntimeException("Your account is pending verification. Event creation is restricted.");
            }
        }
        
        return eventRepository.save(Objects.requireNonNull(event));
    }

    @Transactional
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

        event.setAvailableCapacity(event.getAvailableCapacity() - 1);
        eventRepository.save(event);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setStatus("PENDING_PAYMENT");

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
        if (updates.getTagline() != null) event.setTagline(updates.getTagline());
        if (updates.getAgeLimit() != null) event.setAgeLimit(updates.getAgeLimit());
        if (updates.getDressCode() != null) event.setDressCode(updates.getDressCode());
        if (updates.getDoorPolicy() != null) event.setDoorPolicy(updates.getDoorPolicy());
        if (updates.getActive() != null) event.setActive(updates.getActive());
        
        return eventRepository.save(Objects.requireNonNull(event));
    }

    public void deleteEvent(Long id) {
        if (id == null)
            return;
        eventRepository.deleteById(id);
    }
}
