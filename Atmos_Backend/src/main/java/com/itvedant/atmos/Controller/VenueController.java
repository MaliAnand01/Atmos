package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.Venue;
import com.itvedant.atmos.Service.VenueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueService venueService;



    @PostMapping
    public ResponseEntity<Venue> createVenue(@RequestBody Venue venue) {
        return ResponseEntity.ok(venueService.createVenue(venue));
    }

    @GetMapping
    public ResponseEntity<List<Venue>> getAllVenues() {
        return ResponseEntity.ok(venueService.getAllVenues());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Venue> updateVenue(@PathVariable Long id, @RequestBody Venue updates) {
        return ResponseEntity.ok(venueService.updateVenue(id, updates));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVenue(@PathVariable Long id) {
        venueService.deleteVenue(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Venue deleted successfully"));
    }
}