package com.itvedant.atmos.Repo;

import com.itvedant.atmos.Entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;

import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // Vibe Slider filter (±1 energy range)
    List<Event> findByEnergyLevelBetween(Integer minEnergy, Integer maxEnergy);

    List<Event> findByOrganizerId(Long organizerId);
    void deleteByOrganizerId(Long organizerId);

    // Server-side search: title OR venue name, case-insensitive
    @Query("SELECT e FROM Event e WHERE " +
           "LOWER(e.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.venue.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Event> searchByTitleOrVenue(@Param("query") String query);

    // Category filter (null = all)
    List<Event> findByCategoryIgnoreCase(String category);

    // Paginated event listing
    @Override
    @NonNull
    Page<Event> findAll(@NonNull Pageable pageable);
}