package com.itvedant.atmos.config;

import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Entity.Venue;
import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Repo.EventRepository;
import com.itvedant.atmos.Repo.NotificationRepository;
import com.itvedant.atmos.Repo.UserRepository;
import com.itvedant.atmos.Repo.VenueRepository;
import com.itvedant.atmos.Repo.WishlistRepository;
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
            BookingRepository bookingRepository,
            WishlistRepository wishlistRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("Seeding Atmos Database...");

            // Seed Users
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("Anand Sundesha");
                admin.setEmail("admin@atmos.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                admin.setVerified(true);

                User testUser = new User();
                testUser.setUsername("Anand Mali");
                testUser.setEmail("malianand0721@gmail.com");
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
                Venue v1 = createVenue("Kitty Su Mumbai", "The Lalit, Andheri East", 800,
                        "https://images.unsplash.com/photo-1545128485-c400e7702796?w=800&q=80");
                Venue v2 = createVenue("Prithvi Cafe", "Juhu Church Road, Juhu", 120,
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80");
                Venue v3 = createVenue("NSCI SVP Stadium", "Worli, Mumbai", 5000,
                        "https://images.unsplash.com/photo-1478147424052-bbb812f8ecbd?w=600&q=80");
                Venue v4 = createVenue("antiSOCIAL", "Mathuradas Mill Compound, Lower Parel", 400,
                        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=80");
                Venue v5 = createVenue("Aer Rooftop", "Four Seasons Hotel, Worli", 250,
                        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600&q=80");
                Venue v6 = createVenue("Gateway Stage", "Apollo Bunder, Colaba", 1500,
                        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80");
                Venue v7 = createVenue("The Ghetto", "Breach Candy, Mumbai", 100,
                        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&q=80");
                Venue v8 = createVenue("Royal Opera House", "Girgaon, Mumbai", 574,
                        "https://images.unsplash.com/photo-1503095393527-32bdad206539?w=600&q=80");
                Venue v9 = createVenue("PVR Juhu", "Dynamix Mall, Juhu", 300,
                        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80");
                Venue v10 = createVenue("Turf Park", "Bandra West, Mumbai", 50,
                        "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&q=80");

                venueRepository.saveAll(Objects.requireNonNull(List.of(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10)));
            }

            // Seed Events
            wishlistRepository.deleteAll(); // Force clear dependent data
            bookingRepository.deleteAll(); // Clear dependencies first
            notificationRepository.deleteAll(); // Clear logs
            eventRepository.deleteAll(); // Force re-seed with new fields
            if (eventRepository.count() == 0) {
                List<Venue> venues = venueRepository.findAll();
                Long orgId = userRepository.findByEmail("organizer@atmos.com").map(User::getId).orElse(1L);

                Event e1 = createEvent("Midnight Techno", "High BPM till 4 AM", "Neon Dreams & Dark Bass", "21+",
                        "All Black / Clubwear", "Strict Entry / Valid ID", 10, 5, 800, venues.get(0), orgId, 799.0,
                        "Techno", "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80", 
                        "Charlotte de Witte", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80", 
                        "A Techno phenom and one of the most significant names in the electronic music world today. Belgian DJ and record producer charlotte de witte is best known for her 'dark and stripped-back' style of minimal techno and acid techno.", "Vibrate Tour");
                
                Event e2 = createEvent("Morning Chai", "Classical sitar and flute sessions", "Start Your Day With Peace",
                        "All Ages", "Casual", "Free Entry", 2, 2, 100, venues.get(1), orgId, 199.0, "Classical", 
                        "https://images.unsplash.com/photo-1563294021-e7f17aaaa0ed?w=800&q=80", 
                        "Niladri Kumar", "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", 
                        "A world-renowned global Indian musician and sitar player, widely recognized for his unconventional style and contribution to the 'Zitar' fusion movement.", null);
                
                Event e3 = createEvent("Indie Rock Night", "The Best of Mumbai's Indie scene", "Support Local Talent", "18+",
                        "Indie / Casual", "No outside drinks", 7, 10, 400, venues.get(3), orgId, 499.0, "Live Music", 
                        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&q=80", 
                        "The Yellow Diary", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", 
                        "A collective of five musicians, The Yellow Diary is a soulful alt-rock band from Mumbai, known for their unique blend of meaningful lyrics and contemporary soundscapes.", null);
                
                Event e4 = createEvent("Acoustic Sunset", "Unplugged covers and soulful melodies", "Golden Hour Melodies", "All Ages",
                        "Smart Casual", "Restricted entry after 7PM", 3, 3, 250, venues.get(4), orgId, 349.0,
                        "Acoustic", "https://images.unsplash.com/photo-1459749411177-042180ceea72?w=800&q=80", 
                        "Anuv Jain", "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&q=80", 
                        "Indian singer-songwriter and composer widely recognized for his soulful baritone and minimal production that highlights emotional storytelling.", null);
                
                Event e5 = createEvent("Bollywood EDM", "Desi-fusion drops and high energy", "The Ultimate Desi Party", "21+",
                        "Traditional / Party", "Stags not allowed", 9, 30, 5000, venues.get(2), orgId, 999.0, "EDM", 
                        "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&q=80", 
                        "Nucleya", "https://images.unsplash.com/photo-1520127873598-bb028738988a?w=400&q=80", 
                        "The pioneer of native bass music in India, Udyan Sagar aka Nucleya is a name that is synonymous with cutting-edge electronic sounds in the Indian independent music scene.", "Koocha Monster Tour");
                
                Event e6 = createEvent("Jazz & Soul", "Evening of smooth jazz and cocktails", "Elegant Notes & Wine", "18+",
                        "Formal / Smart", "Table reservations only", 4, 15, 100, venues.get(6), orgId, 599.0, "Jazz", 
                        "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80", 
                        "Louiz Banks", "https://images.unsplash.com/photo-1525650603414-85750fcfa6c4?w=400&q=80", 
                        "Known as the Godfather of Indian Jazz, Louiz Banks is a legendary keyboardist and composer who has pioneered jazz and fusion in India for five decades.", null);
                
                Event e7 = createEvent("Hare Krishna Kirtan Festival", "Transcendental vibration of the Lord's Holy Name", "Sacred Harmonies & Bhakti",
                        "All Ages", "Modest", "Silence requested during performance", 5, 20, 1500, venues.get(5), orgId,
                        450.0, "Sufi", "https://images.unsplash.com/photo-1465821185615-20b3c2fbf41b?w=800&q=80", 
                        "Jahnavi Harrison", "https://images.unsplash.com/photo-1517230110316-3a5214739572?w=400&q=80", 
                        "Jahnavi Harrison’s music is inspired by her upbringing in the bhakti yoga tradition. She has performed globally, sharing the practice of mantra meditation and kirtan with diverse audiences.", "Transcendental Vibration Tour");
                
                Event e8 = createEvent("Retro Disco", "Back to the 80s with glow sticks", "Glow Sticks & Disco Balls", "18+",
                        "Retro / Funky", "Costumes encouraged", 8, 12, 574, venues.get(7), orgId, 299.0, "Pop", 
                        "https://images.unsplash.com/photo-1505842465776-3b4952ca405b?w=800&q=80", 
                        "The Disco Kings", "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80", 
                        "A dynamic tribute band bringing the high-octane energy of the 70s and 80s disco floor back to life with authentic costumes and groovy beats.", null);
                
                Event e9 = createEvent("Indie Cinema", "Screening of local award-winning talent", "Discover New Perspectives", "12+",
                        "Casual", "Popcorn provided", 1, 7, 300, venues.get(8), orgId, 150.0, "Workshop", 
                        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80", 
                        "Anand Gandhi", "https://images.unsplash.com/photo-1520127873598-bb028738988a?w=400&q=80", 
                        "A visionary Indian filmmaker and screenwriter known for 'Ship of Theseus'. He joins for an exclusive masterclass and screening of his latest works.", "Cinema Masterclass");
                
                Event e10 = createEvent("Sunset Yoga", "Guided meditation on the turf", "Align Your Energy", "All Ages",
                        "Activewear", "Bring your own mat", 1, 4, 50, venues.get(9), orgId, 99.0, "Workshop", 
                        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80", 
                        "Radhanath Swami", "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&q=80", 
                        "A guide and author who has shared the message of spiritual wisdom and bhakti yoga globally. He leads this special sunset meditation session.", null);

                eventRepository.saveAll(Objects.requireNonNull(List.of(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10)));
            }
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

    private Event createEvent(String title, String desc, String tagline, String age, String dress, String door,
            int energy, int daysOut, int cap, Venue v, Long orgId, double price, String category, String imageUrl, 
            String performer, String pImage, String pBio, String tour) {
        Event e = new Event();
        e.setTitle(title);
        e.setDescription(desc);
        e.setTagline(tagline);
        e.setAgeLimit(age);
        e.setDressCode(dress);
        e.setDoorPolicy(door);
        e.setEnergyLevel(energy);
        e.setDateTime(LocalDateTime.now().plusDays(daysOut).withHour(20).withMinute(0));
        e.setTotalCapacity(cap);
        e.setAvailableCapacity(cap - 10);
        e.setVenue(v);
        e.setOrganizerId(orgId);
        e.setImageUrl(imageUrl);
        e.setPrice(price);
        e.setCategory(category);
        e.setPerformerName(performer);
        e.setPerformerImage(pImage);
        e.setPerformerBio(pBio);
        e.setTourName(tour);
        return e;
    }
}