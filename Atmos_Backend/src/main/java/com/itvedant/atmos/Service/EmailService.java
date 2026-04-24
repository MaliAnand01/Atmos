package com.itvedant.atmos.Service;


import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

import lombok.RequiredArgsConstructor;
import java.time.format.DateTimeFormatter;
import com.itvedant.atmos.Entity.Booking;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

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

        sendEmailWrapper(toEmail, subject, content);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendBookingConfirmationEmail(String toEmail, Booking booking) {
        String subject = "Your Ticket to Atmos: " + booking.getEvent().getTitle();
        String dateStr = booking.getEvent().getDateTime().format(DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a"));
        
        String content = "<html>" +
                "<body style='font-family: sans-serif; background-color: #0d0f14; color: #ffffff; padding: 40px; text-align: center;'>" +
                "<div style='max-width: 600px; margin: auto; background-color: #14161e; padding: 40px; border-radius: 20px; border: 1px solid #1e212b;'>" +
                "<h1 style='color: #00f0ff; margin-bottom: 20px;'>Booking Confirmed</h1>" +
                "<p style='color: #a0a0a0; font-size: 16px; line-height: 1.6;'>You're all set! Here are your ticket details for <strong>" + booking.getEvent().getTitle() + "</strong>.</p>" +
                "<div style='background-color: #0d0f14; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px dashed #00f0ff; text-align: left;'>" +
                "<p style='margin: 5px 0; color: #a0a0a0;'><strong>Venue:</strong> <span style='color: #ffffff;'>" + booking.getEvent().getVenue().getName() + "</span></p>" +
                "<p style='margin: 5px 0; color: #a0a0a0;'><strong>Date & Time:</strong> <span style='color: #ffffff;'>" + dateStr + "</span></p>" +
                "<p style='margin: 5px 0; color: #a0a0a0;'><strong>Quantity:</strong> <span style='color: #ffffff;'>" + booking.getQuantity() + " Ticket(s)</span></p>" +
                "<p style='margin: 5px 0; color: #a0a0a0;'><strong>Booking Ref:</strong> <span style='color: #00f0ff; font-weight: bold;'>" + booking.getBookingHash().substring(0, 8).toUpperCase() + "</span></p>" +
                "</div>" +
                "<p style='color: #a0a0a0; font-size: 14px;'>Show this email or your dashboard ticket at the entrance.</p>" +
                "</div>" +
                "</body>" +
                "</html>";

        sendEmailWrapper(toEmail, subject, content);
    }

    @org.springframework.scheduling.annotation.Async
    public void sendCancellationEmail(String toEmail, Booking booking) {
        String subject = "Booking Cancelled: " + booking.getEvent().getTitle();
        
        String content = "<html>" +
                "<body style='font-family: sans-serif; background-color: #0d0f14; color: #ffffff; padding: 40px; text-align: center;'>" +
                "<div style='max-width: 600px; margin: auto; background-color: #14161e; padding: 40px; border-radius: 20px; border: 1px solid #1e212b;'>" +
                "<h1 style='color: #ff007f; margin-bottom: 20px;'>Booking Cancelled</h1>" +
                "<p style='color: #a0a0a0; font-size: 16px; line-height: 1.6;'>This is to confirm that your booking for <strong>" + booking.getEvent().getTitle() + "</strong> has been successfully cancelled.</p>" +
                "<div style='background-color: #0d0f14; padding: 20px; border-radius: 12px; margin: 30px 0; border: 1px dashed #ff007f;'>" +
                "<p style='color: #a0a0a0; margin: 0;'>Any applicable refunds will be processed according to our cancellation policy.</p>" +
                "</div>" +
                "<p style='color: #a0a0a0; font-size: 14px;'>We hope to see you at another event soon.</p>" +
                "</div>" +
                "</body>" +
                "</html>";

        sendEmailWrapper(toEmail, subject, content);
    }

    private void sendEmailWrapper(String toEmail, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(java.util.Objects.requireNonNull(fromEmail));
            helper.setTo(java.util.Objects.requireNonNull(toEmail));
            helper.setSubject(java.util.Objects.requireNonNull(subject));
            helper.setText(java.util.Objects.requireNonNull(content), true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Error sending email: " + e.getMessage());
        }
    }
}
