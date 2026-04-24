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

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EventService {
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    // Returns all active (non-expired) events
    public List<Event> getAllEvents() {
        return eventRepository.findAllByActiveTrue();
    }

    // Full-text search across event titles and venue names
    public List<Event> searchEvents(String query) {
        if (query == null || query.isBlank()) return getAllEvents();
        return eventRepository.searchByTitleOrVenue(query.trim());
    }

    // Returns active events matching the given category; "All" or blank returns everything
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

    // Returns active events within ±2 energy levels of the given vibe level
    public List<Event> getEventsByVibe(int vibeLevel) {
        return eventRepository.findByEnergyLevelBetween(
                Math.max(1, vibeLevel - 2),
                Math.min(10, vibeLevel + 2)
        ).stream().filter(Event::getActive).toList();
    }

    // Creates an event; enforces organizer approval before allowing publication
    public Event createEvent(Event event, Long loggedInUserId) {
        if (event == null) {
            throw new RuntimeException("Event data must not be null");
        }

        User executingUser = userRepository.findById(java.util.Objects.requireNonNull(loggedInUserId))
            .orElseThrow(() -> new RuntimeException("User not found in context"));

        if ("ROLE_ORGANIZER".equalsIgnoreCase(executingUser.getRole())) {
            if (!"APPROVED".equalsIgnoreCase(executingUser.getOrganizerStatus())) {
                throw new RuntimeException("Your account is pending verification. Event creation is restricted.");
            }
            // Force organizer ID from the authenticated user, not the request body
            event.setOrganizerId(loggedInUserId);
        }

        return eventRepository.save(Objects.requireNonNull(event));
    }

    // Books tickets atomically; decrements capacity and creates a PENDING_PAYMENT booking
    @Transactional
    public Booking bookEvent(Long userId, Long eventId, Integer quantity) {
        if (userId == null || eventId == null) {
            throw new RuntimeException("User ID and Event ID must not be null");
        }
        if (quantity == null || quantity < 1 || quantity > 10) {
            throw new RuntimeException("Validation Error: Quantity must be effectively constrained between 1 and 10.");
        }
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (event.getAvailableCapacity() < quantity) {
            throw new RuntimeException("Not enough tickets left. Only " + event.getAvailableCapacity() + " remaining!");
        }

        event.setAvailableCapacity(event.getAvailableCapacity() - quantity);
        eventRepository.save(event);

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setEvent(event);
        booking.setQuantity(quantity);
        booking.setStatus("PENDING_PAYMENT");

        return bookingRepository.save(Objects.requireNonNull(booking));
    }

    // Applies partial updates; only non-null fields from the request are written
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
        if (updates.getPerformerName() != null) event.setPerformerName(updates.getPerformerName());
        if (updates.getPerformerImage() != null) event.setPerformerImage(updates.getPerformerImage());
        if (updates.getPerformerBio() != null) event.setPerformerBio(updates.getPerformerBio());
        if (updates.getTourName() != null) event.setTourName(updates.getTourName());

        return eventRepository.save(Objects.requireNonNull(event));
    }

    public void deleteEvent(Long id) {
        if (id == null)
            return;
        eventRepository.deleteById(id);
    }
}
