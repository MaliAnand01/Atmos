package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Repo.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.itvedant.atmos.Repo.BookingRepository bookingRepository;
    private final com.itvedant.atmos.Repo.EventRepository eventRepository;
    private final NotificationService notificationService;
    private final OTPService otpService;



    public com.itvedant.atmos.DTO.UserResponseDTO mapToResponse(User user) {
        com.itvedant.atmos.DTO.UserResponseDTO dto = new com.itvedant.atmos.DTO.UserResponseDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole());
        dto.setPhone(user.getPhone());
        dto.setOrganizationName(user.getOrganizationName());
        dto.setPanGstin(user.getPanGstin());
        dto.setOrganizerStatus(user.getOrganizerStatus());
        dto.setVerified(user.getVerified());
        return dto;
    }

    public User registerUser(User user) {
        if (user == null) {
            throw new RuntimeException("User data must not be null");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getRole() == null || user.getRole().isBlank()) {
            user.setRole("ROLE_USER");
        }
        User saved = userRepository.save(Objects.requireNonNull(user));
        
        // send otp
        otpService.generateAndSendOTP(saved);
        
        return saved;
    }

    public boolean verifyOtp(Long userId, String otp) {
        if (userId == null) throw new RuntimeException("User ID must not be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return otpService.verifyOTP(user, otp);
    }

    public void resendOtp(Long userId) {
        if (userId == null) throw new RuntimeException("User ID must not be null");
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        otpService.generateAndSendOTP(user);
    }

    public void sendPasswordResetOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found."));
        otpService.generateAndSendOTP(user);
    }

    public void resetPassword(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email not found."));
        if (!otpService.verifyOTP(user, otp)) {
            throw new RuntimeException("Invalid or expired OTP.");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // login
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
            if (updates.getCurrentPassword() == null || !passwordEncoder.matches(updates.getCurrentPassword(), existing.getPassword())) {
                throw new RuntimeException("Current password provided is incorrect.");
            }
            existing.setPassword(passwordEncoder.encode(updates.getPassword()));
        }
        if (updates.getPhone() != null) {
            existing.setPhone(updates.getPhone());
        }
        if (updates.getOrganizationName() != null) {
            existing.setOrganizationName(updates.getOrganizationName());
        }
        if (updates.getPanGstin() != null) {
            existing.setPanGstin(updates.getPanGstin());
        }
        if (updates.getOrganizerStatus() != null) {
            existing.setOrganizerStatus(updates.getOrganizerStatus());
        }
        return userRepository.save(Objects.requireNonNull(existing));
    }

    public User approveOrganizer(Long id) {
        if (id == null) throw new RuntimeException("ID must not be null");
        User user = userRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!"ROLE_ORGANIZER".equals(user.getRole())) {
            throw new RuntimeException("User is not an organizer");
        }
        user.setOrganizerStatus("APPROVED");
        User saved = userRepository.save(user);
        
        // notify
        notificationService.createNotification(user.getId(), 
            "Your organizer application has been approved! You can now create events.", 
            "APPROVAL");
            
        return saved;
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        if (id == null) return;
        
        bookingRepository.deleteByUserId(id);
        
        eventRepository.deleteByOrganizerId(id);
        
        userRepository.deleteById(Objects.requireNonNull(id));
    }
}