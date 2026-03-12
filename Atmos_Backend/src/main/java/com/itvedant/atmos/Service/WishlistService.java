package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Entity.Wishlist;
import com.itvedant.atmos.Repo.EventRepository;
import com.itvedant.atmos.Repo.UserRepository;
import com.itvedant.atmos.Repo.WishlistRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WishlistService {
    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final EventRepository eventRepository;

    public WishlistService(WishlistRepository wishlistRepository, UserRepository userRepository, EventRepository eventRepository) {
        this.wishlistRepository = wishlistRepository;
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
    }

    @Transactional
    public String toggleWishlist(Long userId, Long eventId) {
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndEventId(userId, eventId);
        if (existing.isPresent()) {
            wishlistRepository.delete(Objects.requireNonNull(existing.get()));
            return "Removed from wishlist";
        } else {
            User user = userRepository.findById(Objects.requireNonNull(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));
            Event event = eventRepository.findById(Objects.requireNonNull(eventId))
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            
            Wishlist wishlist = new Wishlist();
            wishlist.setUser(user);
            wishlist.setEvent(event);
            wishlistRepository.save(wishlist);
            return "Added to wishlist";
        }
    }

    public List<Event> getUserWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(Wishlist::getEvent)
                .collect(Collectors.toList());
    }
}
