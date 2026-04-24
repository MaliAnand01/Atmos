package com.itvedant.atmos.Repo;

import com.itvedant.atmos.Entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // Returns only active (non-expired) events
    List<Event> findAllByActiveTrue();

    // Used by the scheduled cleanup task to find past events
    List<Event> findAllByDateTimeBeforeAndActiveTrue(LocalDateTime now);

    // Vibe slider filter — matches events within an energy range
    List<Event> findByEnergyLevelBetween(Integer minEnergy, Integer maxEnergy);

    List<Event> findByOrganizerId(Long organizerId);
    void deleteByOrganizerId(Long organizerId);

    // Case-insensitive search across event title and venue name
    @Query("SELECT e FROM Event e WHERE " +
           "e.active = true AND (" +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.venue.name) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Event> searchByTitleOrVenue(@Param("query") String query);

    // Category filter; used by the Discover page category pills
    List<Event> findByCategoryIgnoreCase(String category);

    List<Event> findByVenueId(Long venueId);
}