package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.Venue;
import com.itvedant.atmos.Repo.VenueRepository;
import org.springframework.lang.NonNull;
import java.util.Objects;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository venueRepository;

    public VenueService(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

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

    public Venue updateVenue(Long id, Venue updates) {
        if (id == null) throw new RuntimeException("ID must not be null");
        Venue venue = venueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Venue not found"));
        
        if (updates.getName() != null) venue.setName(updates.getName());
        if (updates.getAddress() != null) venue.setAddress(updates.getAddress());
        if (updates.getCapacity() != null) venue.setCapacity(updates.getCapacity());
        
        return venueRepository.save(Objects.requireNonNull(venue));
    }

    public void deleteVenue(Long id) {
        if (id == null) return;
        venueRepository.deleteById(id);
    }
}