package com.itvedant.atmos.Controller;

import com.itvedant.atmos.Entity.Booking;
import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Service.NotificationService;
import com.itvedant.atmos.Service.RazorpayService;
import com.itvedant.atmos.Service.EmailService;
import com.razorpay.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${RAZORPAY_KEY_ID}")
    private String keyId;

    private final BookingRepository bookingRepository;
    private final NotificationService notificationService;
    private final RazorpayService razorpayService;
    private final EmailService emailService;

    // Creates a Razorpay order for the given booking and returns payment details to the frontend
    @PostMapping("/create-order/{bookingId}")
    public ResponseEntity<?> createOrder(@PathVariable Long bookingId) {
        if (bookingId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Booking ID is required"));
        }
        try {
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            double amount = booking.getEvent().getPrice() * booking.getQuantity();
            String currency = "INR";
            String receipt = "receipt_booking_" + bookingId;

            Order order = razorpayService.createOrder(amount, currency, receipt);

            booking.setRazorpayOrderId(order.get("id").toString());
            bookingRepository.save(booking);

            return ResponseEntity.ok(Map.of(
                "orderId", order.get("id").toString(),
                "amount", order.get("amount").toString(),
                "currency", order.get("currency").toString(),
                "keyId", keyId
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    // Verifies the Razorpay signature and marks the booking as ACTIVE on success
    @PostMapping("/verify-payment")
    public ResponseEntity<?> verifyPayment(@RequestBody Map<String, String> data) {
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");

        boolean isValid = razorpayService.verifySignature(orderId, paymentId, signature);

        if (isValid) {
            Booking booking = bookingRepository.findByRazorpayOrderId(orderId)
                    .orElseThrow(() -> new RuntimeException("Booking not found for order: " + orderId));

            booking.setPaymentStatus("SUCCESS");
            booking.setStatus("ACTIVE");
            booking.setRazorpayPaymentId(paymentId);
            booking.setBookingHash(UUID.randomUUID().toString());
            bookingRepository.save(booking);

            notificationService.createNotification(booking.getUser().getId(),
                "Payment Successful! Your ticket to " + booking.getEvent().getTitle() + " is confirmed.",
                "BOOKING");

            notificationService.createNotification(booking.getEvent().getOrganizerId(),
                "New Booking! " + booking.getUser().getUsername() + " booked a ticket for " + booking.getEvent().getTitle(),
                "ORGANIZER_NOTIFICATION");

            emailService.sendBookingConfirmationEmail(booking.getUser().getEmail(), booking);

            return ResponseEntity.ok(Map.of("status", "success", "message", "Payment verified."));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "failed", "message", "Invalid signature."));
        }
    }
}
