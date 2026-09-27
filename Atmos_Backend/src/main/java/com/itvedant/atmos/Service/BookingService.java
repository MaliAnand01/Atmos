package com.itvedant.atmos.Service;

import com.itvedant.atmos.Entity.Booking;
import com.itvedant.atmos.Entity.Event;
import com.itvedant.atmos.Repo.BookingRepository;
import com.itvedant.atmos.Repo.EventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;

    public List<Booking> getUserBookings(Long userId) {
        if (userId == null)
            return List.of();
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getOrganizerBookings(Long organizerId) {
        if (organizerId == null)
            return List.of();
        return bookingRepository.findByEventOrganizerId(organizerId);
    }

    // Cancels a booking, restores event capacity, and notifies the user
    @Transactional
    public void cancelBooking(Long bookingId) {
        if (bookingId == null)
            return;
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new RuntimeException("Booking is already cancelled.");
        }

        booking.setStatus("CANCELLED");
        bookingRepository.save(Objects.requireNonNull(booking));

        Event event = booking.getEvent();
        event.setAvailableCapacity(event.getAvailableCapacity() + booking.getQuantity());
        eventRepository.save(event);

        notificationService.createNotification(booking.getUser().getId(),
            "Your booking for " + event.getTitle() + " has been cancelled. Any applicable refunds have been initiated.",
            "CANCELLATION");

        emailService.sendCancellationEmail(booking.getUser().getEmail(), booking);
    }
}