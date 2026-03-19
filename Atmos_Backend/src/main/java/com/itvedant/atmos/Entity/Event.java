package com.itvedant.atmos.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Min(1) @Max(10)
    @Column(name = "energy_level", nullable = false)
    private Integer energyLevel; // 1 (Chill) to 10 (High)

    @Column(name = "date_time", nullable = false)
    private LocalDateTime dateTime;

    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity;

    @Column(name = "available_capacity", nullable = false)
    private Integer availableCapacity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venue_id", nullable = false)
    private Venue venue;

    @Column(name = "organizer_id")
    private Long organizerId;

    @Column(nullable = false)
    private Double price = 0.0; // Ticket price in INR

    @Column
    private String category; // e.g. "Techno", "Jazz", "Live Music", "Comedy"

    @Column
    private String tagline;

    @Column(name = "age_limit")
    private String ageLimit;

    @Column(name = "dress_code")
    private String dressCode;

    @Column(name = "door_policy", columnDefinition = "TEXT")
    private String doorPolicy;

    @Column(name = "is_active", nullable = false)
    private Boolean active = true;

    // Performer/Artist Information
    @Column(name = "performer_name")
    private String performerName;

    @Column(name = "performer_image", length = 1000)
    private String performerImage;

    @Column(name = "performer_bio", columnDefinition = "TEXT")
    private String performerBio;

    @Column(name = "tour_name")
    private String tourName;
}