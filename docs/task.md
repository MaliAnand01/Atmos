# Atmos — Step-by-Step Fix & Improvement Plan

## 🔴 Critical Bugs
- [x] **Fix [getEventById](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Service/EventService.java#54-58)** — use `eventRepository.findById()`
- [x] **Restore capacity on cancellation** — increment `availableCapacity` on cancel
- [x] **Add ownership check to [cancelBooking](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Controller/BookingController.java#28-47)** — only booking owner or admin can cancel
- [x] **Remove redundant `@CrossOrigin("*")`** from all controllers

## 🟡 Medium Bugs
- [x] **Wire [CheckoutModal](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/CheckoutModal.jsx#9-141) to real backend** — calls `POST /api/events/{id}/book/{userId}` with loading/error/success states
- [x] **Add `price` field to [Event](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Entity/Event.java#12-57) entity** — real prices from DB (seeds: ₹199–₹999)
- [x] **Venue dropdown in Organizer wizard** — `<select>` fetched from `GET /api/venues`
- [x] **Connect [Tickets](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/Tickets.jsx#11-117) page to real API** — `GET /bookings/user/{userId}`, real QR codes from booking IDs
- [x] **Wire Admin "Delete Event" button** — calls `DELETE /api/events/{id}`
- [x] **DateTime validation in Organizer wizard** — rejects past dates
- [x] **Wire [EventDetail](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/EventDetail.jsx#10-313) price to backend** — displays `event.price` from DB
- [x] **Fix duplicate username in DataLoader** — organizer renamed to "Priya Sharma"

## 🟢 Minor Fixes
- [x] **Fix dead code in [AuthModal](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/AuthModal.jsx#9-254)** — simplified navigation
- [x] **Dynamic Vibe History** — 3-way bar (High/Balanced/Chill) from real booking energy levels
- [x] **Dynamic homepage stats** — `/api/stats` endpoint → live events/venues/bookings counts

## ✨ Feature Proposals (Intermediate)
- [x] **Server-side search** — `/events/search?q=` JPQL query by title or venue name with 350ms debounce on frontend
- [x] **Event Category/Tags** — `category` field on Event, `/events/category?name=`, real category badges on Discover cards
- [x] **Pagination** — `/api/events?page=&size=` supported on backend via Spring Pageable
