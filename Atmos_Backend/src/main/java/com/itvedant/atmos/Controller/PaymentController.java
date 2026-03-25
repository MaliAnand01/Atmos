package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.Booking;
import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

// mock payment gateway
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

    // process payment
    @PostMapping("/atmos-pay")
    public ResponseEntity<?> processAtmosPay(@RequestBody Map<String, Object> data) {
        try {
            Long bookingId = Long.parseLong(data.get("bookingId").toString());
            String cardNumber = data.get("cardNumber").toString();
            
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found for ID: " + bookingId));

            // accept 4242 test cards
            if (cardNumber != null && cardNumber.replace(" ", "").startsWith("4242")) {
                
                // set active
                booking.setPaymentStatus("SUCCESS");
                booking.setStatus("ACTIVE");
                booking.setRazorpayPaymentId("ATMOS_TXN_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                booking.setBookingHash(UUID.randomUUID().toString());
                bookingRepository.save(booking);

                // notify user
                notificationService.createNotification(booking.getUser().getId(), 
                    "Payment Successful! Your ticket to " + booking.getEvent().getTitle() + " is confirmed.", 
                    "BOOKING");

                // notify org
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
