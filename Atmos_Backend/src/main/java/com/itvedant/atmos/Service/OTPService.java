package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.User;
import com.itvedant.atmos.Repo.UserRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OTPService {

    private final UserRepository userRepository;

    private final EmailService emailService;

    public void generateAndSendOTP(User user) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);
        
        emailService.sendOtpEmail(user.getEmail(), otp);
    }

    public boolean verifyOTP(User user, String inputOtp) {
        if (user.getOtp() != null && 
            user.getOtp().equals(inputOtp) && 
            user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            
            user.setVerified(true);
            user.setOtp(null);
            user.setOtpExpiry(null);
            userRepository.save(user);
            return true;
        }
        return false;
    }
}
