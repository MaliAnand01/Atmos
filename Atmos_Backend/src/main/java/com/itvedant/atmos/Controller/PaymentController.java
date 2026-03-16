package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.Booking;
import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Atmos Pay - Internal Mock Payment Gateway
 */
@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;

    public PaymentController(BookingRepository bookingRepository, 
                             NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.notificationService = notificationService;
    }

    /**
     * Internal endpoint to process Atmos Pay transactions.
     * Simulates real-world validation and network latency on the frontend.
     */
    @PostMapping("/atmos-pay")
    public ResponseEntity<?> processAtmosPay(@RequestBody Map<String, Object> data) {
        try {
            Long bookingId = Long.parseLong(data.get("bookingId").toString());
            String cardNumber = data.get("cardNumber").toString();
            
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found for ID: " + bookingId));

            // Basic validation simulation
            // In Atmos Pay, we accept anything starting with '4242'
            if (cardNumber != null && cardNumber.replace(" ", "").startsWith("4242")) {
                
                // Update booking record to ACTIVE
                booking.setPaymentStatus("SUCCESS");
                booking.setStatus("ACTIVE");
                booking.setRazorpayPaymentId("ATMOS_TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                booking.setBookingHash(UUID.randomUUID().toString());
                bookingRepository.save(booking);

                // Notify User
                notificationService.createNotification(booking.getUser().getId(), 
                    "Payment Successful! Your ticket to " + booking.getEvent().getTitle() + " is confirmed.", 
                    "BOOKING");

                // Notify Organizer
                notificationService.createNotification(booking.getEvent().getOrganizerId(),
                    "New Booking! " + booking.getUser().getUsername() + " booked a ticket for " + booking.getEvent().getTitle(),
                    "ORGANIZER_NOTIFICATION");

                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "transactionId", booking.getRazorpayPaymentId(),
                    "message", "Payment processed successfully."
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "status", "failed",
                    "message", "Invalid card. Please use a valid test card."
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "System error: " + e.getMessage()));
        }
    }
}
