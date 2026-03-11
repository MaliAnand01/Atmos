package com.itvedant.atmos.Repo;

import com.itvedant.atmos.Entity.Venue;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VenueRepository extends JpaRepository<Venue, Long> {
}