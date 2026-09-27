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
                testUser.setUsername("Test User");
                testUser.setEmail("testuser@gmail.com");
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

            // Force re-seed: Clear all dependent data first in correct order
            wishlistRepository.deleteAll();
            bookingRepository.deleteAll();
            notificationRepository.deleteAll();
            eventRepository.deleteAll(); // Delete events before venues!
            venueRepository.deleteAll();

            // Seed Venues
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
            
            // New Mumbai Venues
            Venue v11 = createVenue("Jio World Convention Centre", "BKC, Mumbai", 10000,
                    "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800&q=80");
            Venue v12 = createVenue("NESCO Centre", "Western Express Hwy, Goregaon", 8000,
                    "https://images.unsplash.com/photo-1582192732832-728448eb847d?w=800&q=80");
            Venue v13 = createVenue("Mahalaxmi Racecourse", "Mahalaxmi, Mumbai", 20000,
                    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80");
            Venue v14 = createVenue("DY Patil Stadium", "Nerul, Navi Mumbai", 55000,
                    "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80");
            Venue v15 = createVenue("Phoenix Palladium", "Lower Parel, Mumbai", 1000,
                    "https://images.unsplash.com/photo-1567449300518-034b999a4515?w=800&q=80");

            venueRepository.saveAll(Objects.requireNonNull(List.of(v1, v2, v3, v4, v5, v6, v7, v8, v9, v10, v11, v12, v13, v14, v15)));

            // Seed Events
            if (true) {
                List<Venue> venues = venueRepository.findAll();
                Long orgId = userRepository.findByEmail("organizer@atmos.com").map(u -> u.getId()).orElse(1L);

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

                // --- NEW MUMBAI EVENTS ---
                
                Event e11 = createEvent("Mumbai Comic Con 2026", "The grandest pop culture celebration in India!", "Geek Out at BKC", "All Ages",
                        "Cosplay / Casual", "Ticket required for entry", 10, 45, 10000, venues.get(10), orgId, 1299.0, "Workshop", 
                        "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80", 
                        "Comic Con India", "https://images.unsplash.com/photo-1560941001-d4b52ad00ecc?w=400&q=80", 
                        "Comic Con India is the premier pop culture event in the country, bringing together fans of comics, movies, gaming, and television for an unforgettable weekend.", "Convention");

                Event e12 = createEvent("Lollapalooza India", "A multi-genre music extravaganza", "Global Beats at the Racecourse", "15+",
                        "Festival Chic", "No outside food/water", 10, 60, 20000, venues.get(12), orgId, 5999.0, "EDM", 
                        "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", 
                        "Imagine Dragons", "https://images.unsplash.com/photo-1501612780327-45045538702b?w=400&q=80", 
                        "American pop-rock band Imagine Dragons brings their world-famous stadium energy to the heart of Mumbai for a night of epic anthems.", "Mercury World Tour");

                Event e13 = createEvent("Zomaland by Zomato", "India's grandest food & entertainment carnival", "Feast and Fun at Goregaon", "All Ages",
                        "Casual", "RFID wristbands required", 9, 25, 8000, venues.get(11), orgId, 699.0, "Live Music", 
                        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80", 
                        "Ritviz", "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=80", 
                        "Indian singer-songwriter and record producer Ritviz, famous for his chart-topping fusion of electronic and classical Indian music.", "Mimmi Tour");

                Event e14 = createEvent("Sunburn Arena: Martin Garrix", "The #1 DJ in the world returns to Mumbai", "EDM Invasion at DY Patil", "18+",
                        "Rave Gear", "Security screening mandatory", 10, 40, 55000, venues.get(13), orgId, 2499.0, "EDM", 
                        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80", 
                        "Martin Garrix", "https://images.unsplash.com/photo-1520127873598-bb028738988a?w=400&q=80", 
                        "World-renowned DJ and producer Martin Garrix brings his high-energy set and spectacular production to Navi Mumbai.", "Sentio Tour");

                Event e15 = createEvent("Kala Ghoda Arts Festival", "Celebrating the vibrant art and culture of Mumbai", "Heritage & Creativity", "All Ages",
                        "Ethnic / Smart Casual", "Public street event", 6, 15, 1500, venues.get(5), orgId, 0.0, "Classical", 
                        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80", 
                        "Local Artisans", "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80", 
                        "A collective of Mumbai's finest street artists, musicians, and performers coming together to celebrate heritage.", null);

                Event e16 = createEvent("Marine Drive Open Mic", "Stand-up comedy by the Arabian Sea", "Laughs by the Shore", "16+",
                        "Casual", "Arrive 15 mins early", 7, 3, 50, venues.get(9), orgId, 199.0, "Acoustic", 
                        "https://images.unsplash.com/photo-1514302240734-41667c9c1e9b?w=800&q=80", 
                        "Zakir Khan", "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=400&q=80", 
                        "The 'Sakht Launda' himself, Zakir Khan, drops by for a late-night set to test new material.", null);

                Event e17 = createEvent("Midnight Cycling: South Bombay", "An overnight adventure through the heritage streets", "Ride the Empty Streets", "18+",
                        "Sporty", "Bicycle and helmet provided", 8, 2, 100, venues.get(5), orgId, 899.0, "Workshop", 
                        "https://images.unsplash.com/photo-1471506480208-8a93bea5c722?w=800&q=80", 
                        "Adventure Mumbai", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&q=80", 
                        "A team of adventure enthusiasts leading heritage tours across Mumbai's most iconic landmarks under the moonlight.", null);

                eventRepository.saveAll(Objects.requireNonNull(List.of(e1, e2, e3, e4, e5, e6, e7, e8, e9, e10, e11, e12, e13, e14, e15, e16, e17)));
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
