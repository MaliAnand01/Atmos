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
                admin.setVerified(true);

                User testUser = new User();
                testUser.setUsername("Kaushik Gujjeti");
                testUser.setEmail("kaushik@example.com");
                testUser.setPassword(passwordEncoder.encode("password123"));
                testUser.setRole("ROLE_USER");
                testUser.setVerified(true);

                User organizer = new User();
                organizer.setUsername("Mayuresh Sharma");
                organizer.setEmail("organizer@atmos.com");
                organizer.setPassword(passwordEncoder.encode("org123"));
                organizer.setRole("ROLE_ORGANIZER");
                organizer.setVerified(true);

                userRepository.saveAll(Objects.requireNonNull(List.of(admin, testUser, organizer)));
            }

            // Seed Venues
            if (venueRepository.count() == 0) {
                Venue v1 = createVenue("Kitty Su Mumbai", "The Lalit, Andheri East", 800, "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80");
                Venue v2 = createVenue("Prithvi Cafe", "Juhu Church Road, Juhu", 120, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80");
                Venue v3 = createVenue("NSCI SVP Stadium", "Worli, Mumbai", 5000, "https://images.unsplash.com/photo-1478147424052-bbb812f8ecbd?w=600&q=80");
                Venue v4 = createVenue("antiSOCIAL", "Mathuradas Mill Compound, Lower Parel", 400, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80");
                Venue v5 = createVenue("Aer Rooftop", "Four Seasons Hotel, Worli", 250, "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80");
                Venue v6 = createVenue("Gateway Stage", "Apollo Bunder, Colaba", 1500, "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80");
                Venue v7 = createVenue("The Ghetto", "Breach Candy, Mumbai", 100, "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80");
                Venue v8 = createVenue("Royal Opera House", "Girgaon, Mumbai", 574, "https://images.unsplash.com/photo-1503095393527-32bdad206539?w=600&q=80");
                Venue v9 = createVenue("PVR Juhu", "Dynamix Mall, Juhu", 300, "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80");
                Venue v10 = createVenue("Turf Park", "Bandra West, Mumbai", 50, "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&q=80");

                venueRepository.saveAll(Objects.requireNonNull(List.of(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10)));
            }

            // Seed Events
            if (eventRepository.count() == 0) {
                List<Venue> venues = venueRepository.findAll();
                Long orgId = userRepository.findByEmail("organizer@atmos.com").map(User::getId).orElse(1L);

                Event e1 = createEvent("Midnight Techno", "High BPM till 4 AM", 10, 5, 800, venues.get(0), orgId, 799.0, "Techno");
                Event e2 = createEvent("Morning Chai", "Classical flute sessions", 2, 2, 100, venues.get(1), orgId, 199.0, "Classical");
                Event e3 = createEvent("Indie Rock Night", "Local Mumbai bands", 7, 10, 400, venues.get(3), orgId, 499.0, "Live Music");
                Event e4 = createEvent("Acoustic Sunset", "Unplugged covers", 3, 3, 250, venues.get(4), orgId, 349.0, "Acoustic");
                Event e5 = createEvent("Bollywood EDM", "Desi-fusion drops", 9, 30, 5000, venues.get(2), orgId, 999.0, "EDM");
                Event e6 = createEvent("Jazz & Soul", "Evening of smooth jazz", 4, 15, 100, venues.get(6), orgId, 599.0, "Jazz");
                Event e7 = createEvent("Soulful Sufi", "Traditional sufi music", 5, 20, 1500, venues.get(5), orgId, 450.0, "Sufi");
                Event e8 = createEvent("Retro Disco", "Back to the 80s", 8, 12, 574, venues.get(7), orgId, 299.0, "Pop");
                Event e9 = createEvent("Indie Cinema", "Screening of local talent", 1, 7, 300, venues.get(8), orgId, 150.0, "Workshop");
                Event e10 = createEvent("Sunset Yoga", "Meditation on the turf", 1, 4, 50, venues.get(9), orgId, 99.0, "Workshop");

                eventRepository.saveAll(Objects.requireNonNull(List.of(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10)));
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