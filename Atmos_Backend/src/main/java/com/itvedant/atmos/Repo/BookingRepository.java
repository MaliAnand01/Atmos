package com.itvedant.atmos.Repo;

import com.itvedant.atmos.Entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByEventOrganizerId(Long organizerId);
    void deleteByUserId(Long userId);
    java.util.Optional<Booking> findByRazorpayOrderId(String rzpOrderId);
    java.util.Optional<Booking> findByRazorpayPaymentId(String rzpPaymentId);
    void deleteByEventId(Long eventId);
}