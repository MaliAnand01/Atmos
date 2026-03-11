package com.itvedant.atmos.config;

import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Entity.Venue;
import com.itvedant.atmos.Repo.EventRepository;
import com.itvedant.atmos.Repo.UserRepository;
import com.itvedant.atmos.Repo.VenueRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Configuration
public class DataLoader {

    @Bean
    public CommandLineRunner loadData(UserRepository userRepository,
                                      VenueRepository venueRepository,
                                      EventRepository eventRepository,
                                      PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("Seeding Atmos Database...");

            // Seed Users
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("Anand Mali");
                admin.setEmail("admin@atmos.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");

                User testUser = new User();
                testUser.setUsername("Kaushik Gujjeti");
                testUser.setEmail("kaushik@example.com");
                testUser.setPassword(passwordEncoder.encode("password123"));
                testUser.setRole("ROLE_USER");

                User organizer = new User();
                organizer.setUsername("Priya Sharma");
                organizer.setEmail("organizer@atmos.com");
                organizer.setPassword(passwordEncoder.encode("org123"));
                organizer.setRole("ROLE_ORGANIZER");

                userRepository.saveAll(Objects.requireNonNull(List.of(admin, testUser, organizer)));
            }

            // Seed Venues
            if (venueRepository.count() == 0) {
                Venue v1 = createVenue("Kitty Su Mumbai", "The Lalit, Andheri East", 800, "https://images.unsplash.com/photo-1545128485-c400e7702796?w=600&q=80");
                Venue v2 = createVenue("Prithvi Cafe", "Juhu Church Road, Juhu", 120, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80");
                Venue v3 = createVenue("NSCI SVP Stadium", "Worli, Mumbai", 5000, "https://images.unsplash.com/photo-1478147424052-bbb812f8ecbd?w=600&q=80");
                Venue v4 = createVenue("antiSOCIAL", "Mathuradas Mill Compound, Lower Parel", 400, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80");
                Venue v5 = createVenue("Aer Rooftop", "Four Seasons Hotel, Worli", 250, "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80");

                venueRepository.saveAll(Objects.requireNonNull(List.of(v1, v2, v3, v4, v5)));
            }

            // Seed Events
            if (eventRepository.count() == 0) {
                List<Venue> venues = venueRepository.findAll();
                Long orgId = userRepository.findByEmail("organizer@atmos.com").map(User::getId).orElse(1L);

                Event e1 = createEvent("Midnight Techno", "High BPM till 4 AM", 10, 5, 800, venues.get(0), orgId, 799.0, "Techno");
                Event e2 = createEvent("Morning Chai", "Classical flute sessions", 2, 2, 100, venues.get(1), orgId, 199.0, "Classical");
                Event e3 = createEvent("Indie Rock", "Local Mumbai bands", 7, 10, 400, venues.get(3), orgId, 499.0, "Live Music");
                Event e4 = createEvent("Acoustic Sunset", "Unplugged covers", 3, 3, 250, venues.get(4), orgId, 349.0, "Acoustic");
                Event e5 = createEvent("Bollywood EDM", "Desi-fusion drops", 9, 30, 5000, venues.get(2), orgId, 999.0, "EDM");

                eventRepository.saveAll(Objects.requireNonNull(List.of(e1, e2, e3, e4, e5)));
            }

            System.out.println("Seeding Successfully Completed!");
        };
    }


    private Venue createVenue(String name, String address, int cap, String url) {
        Venue v = new Venue();
        v.setName(name);
        v.setAddress(address);
        v.setCapacity(cap);
        v.setImageUrl(url);
        return v;
    }

    private Event createEvent(String title, String desc, int energy, int daysOut, int cap, Venue v, Long orgId, double price, String category) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(desc);
        e.setEnergyLevel(energy);
        e.setDateTime(LocalDateTime.now().plusDays(daysOut).withHour(20).withMinute(0));
        e.setTotalCapacity(cap);
        e.setAvailableCapacity(cap - 10);
        e.setVenue(v);
        e.setOrganizerId(orgId);
        e.setImageUrl(v.getImageUrl());
        e.setPrice(price);
        e.setCategory(category);
        return e;
    }
}