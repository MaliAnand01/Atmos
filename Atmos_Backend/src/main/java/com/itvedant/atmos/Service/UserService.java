package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.itvedant.atmos.Repo.BookingRepository bookingRepository;
    private final com.itvedant.atmos.Repo.EventRepository eventRepository;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, 
                       com.itvedant.atmos.Repo.BookingRepository bookingRepository,
                       com.itvedant.atmos.Repo.EventRepository eventRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
    }

    public User registerUser(User user) {
        if (user == null) {
            throw new RuntimeException("User data must not be null");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("ROLE_USER");
        }
        return userRepository.save(Objects.requireNonNull(user));
    }

    /**
     * Login: find by email, verify password, return user or null.
     */
    public User login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty())
            return null;
        User user = userOpt.get();
        if (!passwordEncoder.matches(password, user.getPassword()))
            return null;
        return user;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        if (id == null)
            return Optional.empty();
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updates) {
        if (id == null) {
            throw new RuntimeException("User ID must not be null");
        }
        User existing = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getUsername() != null && !updates.getUsername().isBlank()) {
            existing.setUsername(updates.getUsername());
        }
        if (updates.getEmail() != null && !updates.getEmail().isBlank()) {
            existing.setEmail(updates.getEmail());
        }
        if (updates.getPassword() != null && !updates.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updates.getPassword()));
        }
        // Role can only be changed by admin — handled at controller level
        return userRepository.save(Objects.requireNonNull(existing));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        if (id == null) return;
        
        // Clean up bookings
        bookingRepository.deleteByUserId(id);
        
        // Clean up hosted events if they are an organizer
        eventRepository.deleteByOrganizerId(id);
        
        userRepository.deleteById(id);
    }
}