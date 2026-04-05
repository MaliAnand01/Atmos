package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.Venue;
import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Repo.VenueRepository;
import com.itvedant.atmos.Repo.EventRepository;
import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Repo.WishlistRepository;
import org.springframework.lang.NonNull;
import jakarta.transaction.Transactional;
import java.util.Objects;

import org.springframework.stereotype.Service;

import java.util.List;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VenueService {

    private final VenueRepository venueRepository;
    private final EventRepository eventRepository;
    private final BookingRepository bookingRepository;
    private final WishlistRepository wishlistRepository;



    public Venue createVenue(Venue venue) {
        return venueRepository.save(Objects.requireNonNull(venue));
    }

    public List<Venue> getAllVenues() {
        return venueRepository.findAll();
    }

    public Venue getVenueById(@NonNull Long id) {
        return venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
    }

    @Transactional
    public Venue updateVenue(Long id, Venue updates) {
        if (id == null) throw new RuntimeException("ID must not be null");
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        
        if (updates.getName() != null) venue.setName(updates.getName());
        if (updates.getAddress() != null) venue.setAddress(updates.getAddress());
        if (updates.getCapacity() != null) venue.setCapacity(updates.getCapacity());
        if (updates.getImageUrl() != null) venue.setImageUrl(updates.getImageUrl());
        
        return venueRepository.save(Objects.requireNonNull(venue));
    }

    @Transactional
    public void deleteVenue(Long id) {
        if (id == null) return;
        
        // 1. Find all events for this venue
        List<Event> events = eventRepository.findByVenueId(id);
        
        // 2. Clear bookings and wishlists for each event
        for (Event event : events) {
            bookingRepository.deleteByEventId(event.getId());
            wishlistRepository.deleteByEventId(event.getId());
        }
        
        // 3. Delete the venue (Cascade will handle events)
        venueRepository.deleteById(id);
    }
}