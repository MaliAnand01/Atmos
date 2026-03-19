package com.itvedant.atmos.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    @org.springframework.scheduling.annotation.Async
    public void sendOtpEmail(String toEmail, String otp) {
        String subject = "Verify Your Atmos Account";
        String content = "<html>" +
                "<body style='font-family: sans-serif; background-color: #0d0f14; color: #ffffff; padding: 40px; text-align: center;'>" +
                "<div style='max-width: 600px; margin: auto; background-color: #14161e; padding: 40px; border-radius: 20px; border: 1px solid #1e212b;'>" +
                "<h1 style='color: #00f0ff; margin-bottom: 20px;'>Welcome to Atmos</h1>" +
                "<p style='color: #a0a0a0; font-size: 16px; line-height: 1.6;'>Elevate your experience. Use the code below to verify your account.</p>" +
                "<div style='background-color: #0d0f14; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px dashed #00f0ff;'>" +
                "<span style='font-size: 32px; font-weight: bold; letter-spacing: 12px; color: #00f0ff;'>" + otp + "</span>" +
                "</div>" +
                "<p style='color: #a0a0a0; font-size: 14px;'>This code will expire in 10 minutes.</p>" +
                "</div>" +
                "</body>" +
                "</html>";

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(java.util.Objects.requireNonNull(fromEmail));
            helper.setTo(java.util.Objects.requireNonNull(toEmail));
            helper.setSubject(java.util.Objects.requireNonNull(subject));
            helper.setText(content, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("CRITICAL: Failed to send OTP email to " + toEmail + ". Error: " + e.getMessage());
            // We catch generic Exception here because from a background thread, 
            // throwing doesn't help the user - we just want to log it for the admin.
        }
    }
}
