# Atmos — Product Roadmap & Backend Implementation Plan

## 🔐 Authentication & Trust

### 1. Email Verification on Signup
**Priority:** Critical — prevents spam accounts  
**Backend steps:**
1. Add `isEmailVerified: Boolean = false` + `emailVerificationToken: String` to `User` entity
2. On `POST /auth/register`, generate a UUID token, save it to user, send verification email (Spring Mail)
3. Add `GET /auth/verify-email?token=xxx` endpoint — sets `isEmailVerified = true`, clears token
4. Guard `/auth/login` to reject unverified users with a clear error message
5. Frontend: show "Check your email" screen after registration; resend OTP button

---

### 2. Organizer Approval Workflow
**Priority:** Critical — currently anyone can create events  
**Backend steps:**
1. Add `organizerStatus: Enum {PENDING, APPROVED, REJECTED}` to `User`
2. Extend `/auth/register` to save `organizationName`, `phone`, `panOrGstin`, `website` in an `OrganizerProfile` table (FK → User)
3. Block event creation for organizers where `organizerStatus != APPROVED`
4. Add admin endpoint `PATCH /admin/organizers/{id}/approve` and `reject`
5. Frontend: dashboard shows "Application Pending" state; organizer unlocks full dashboard on approval

---

### 3. Forgot Password / Reset
**Priority:** High  
**Backend steps:**
1. Add `passwordResetToken: String` + `resetTokenExpiry: Instant` to `User`
2. `POST /auth/forgot-password` — generates token, emails reset link
3. `POST /auth/reset-password` — validates token expiry, updates password hash, clears token
4. Frontend: "Forgot password?" link → email input → confirmation screen

---

### 4. Social Login (Google / Apple)
**Priority:** Medium  
**Backend steps:**
1. Add Spring Security OAuth2 dependency
2. Configure [application.properties](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/resources/application.properties) with Google client ID/secret
3. `GET /oauth2/callback/google` — exchange code for profile, upsert User, return JWT
4. Frontend: "Continue with Google" button using the OAuth redirect flow

---

## 💳 Payments

### 5. Real Payment Gateway (Razorpay)
**Priority:** Critical — currently no real payment  
**Backend steps:**
1. Add Razorpay Java SDK dependency
2. `POST /payments/create-order` — create Razorpay order, return `orderId` + `key`
3. `POST /payments/verify` — validate `razorpay_signature` HMAC, mark booking as PAID
4. Add `paymentStatus: Enum {PENDING, PAID, REFUNDED}` to [Booking](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/Tickets.jsx#17-28)
5. Frontend: integrate Razorpay checkout JS SDK in the ticket booking modal

---

### 6. Refunds & Cancellations
**Priority:** High  
**Backend steps:**
1. `POST /bookings/{id}/cancel` — checks event is >24h away, triggers Razorpay refund API, updates status
2. Add `Refund` table: `bookingId`, `amount`, `razorpayRefundId`, `status`
3. Frontend: "Cancel Booking" button in dashboard with confirmation dialog

---

## 🎫 Ticketing

### 7. Multi-Ticket Quantity Booking
**Priority:** High — currently only 1 ticket per booking  
**Backend steps:**
1. Add `quantity: int` to [Booking](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/Tickets.jsx#17-28); deduct `quantity` from `Event.availableCapacity` atomically (`@Lock`)
2. Update `POST /bookings` to accept `{ eventId, quantity }`
3. Generate one QR code per ticket (loop, return list of QR codes)
4. Frontend: number stepper in the booking modal (1 → available cap)

---

### 8. QR Code Ticket Validation
**Priority:** High — for entry management  
**Backend steps:**
1. On booking, generate JWT-signed QR payload: `{ bookingId, userId, eventId, qty }`
2. `POST /tickets/scan` — decode QR, verify signature, check not already scanned, mark `Booking.scanned = true`
3. Add `ROLE_SCANNER` — only organizers/admins of that event can call scan endpoint
4. Frontend: organizer dashboard → "Scan Tickets" view using device camera (react-qr-reader)

---

### 9. Promo Codes / Early Bird
**Priority:** Medium  
**Backend steps:**
1. `PromoCode` entity: code, discountType (PERCENT/FIXED), value, usageLimit, expiry, eventId (nullable = global)
2. `POST /bookings/apply-promo` — validates + returns discounted price
3. Frontend: promo input field in checkout flow

---

## 👤 User Experience

### 10. Event Wishlist
**Priority:** Medium  
**Backend steps:**
1. `Wishlist` table: `userId`, `eventId`, unique constraint
2. `POST /wishlist/{eventId}` (toggle), `GET /wishlist`
3. Frontend: heart icon on event cards, filled when wishlisted; Wishlist tab in dashboard

---

### 11. Post-Event Reviews & Ratings
**Priority:** Medium  
**Backend steps:**
1. `Review` entity: `userId`, `eventId`, `rating (1-5)`, `comment`, `createdAt`
2. Guard: user must have a PAID booking for that event to review
3. `POST /events/{id}/review`, `GET /events/{id}/reviews`
4. Frontend: stars + text on past events in dashboard; aggregate stars on event cards

---

### 12. Event Notifications (Email + In-App)
**Priority:** High  
**Backend steps:**
1. Scheduled job (`@Scheduled`): 24h before event → email all PAID booking users
2. `Notification` table: `userId`, `message`, `read`, `createdAt`
3. `GET /notifications` (unread count in nav badge), `PATCH /notifications/read-all`
4. Frontend: bell icon in FloatingNav with red badge count

---

## 🛠️ Admin & Analytics

### 13. Admin Panel
**Priority:** High  
**Backend steps:**
1. `ROLE_ADMIN` — seed one admin user in `data.sql`
2. Guard all `/admin/**` routes with `hasRole('ADMIN')`
3. Endpoints: `GET /admin/users`, `GET /admin/events`, `PATCH /admin/events/{id}/approve`, organizer approval
4. Frontend: separate `/admin` route with tables for users / pending organizers / events

---

### 14. Organizer Analytics
**Priority:** Medium  
**Backend steps:**
1. `GET /organizer/analytics/events/{id}` — tickets sold per day, revenue, capacity %
2. `GET /organizer/analytics/summary` — all-time revenue, total attendees, top event
3. Frontend: Chart.js line + doughnut charts in organizer dashboard

---

### 15. Seat Map for Seated Venues
**Priority:** Low (complex)  
**Backend steps:**
1. `Seat` entity: `venueId`, `row`, `number`, `category (VIP/GENERAL)`, `price`
2. `BookedSeat` join table: `bookingId`, `seatId`
3. Seat lock with Redis (TTL 10 min) during checkout to prevent double-booking
4. Frontend: SVG seat map in event detail, green/red seat indicators

---

## 🗺️ Discovery

### 16. Map View on Discover Page
**Priority:** Medium  
**Backend steps:** None (lat/lng already in Venue entity, add if missing)  
**Frontend steps:** Leaflet.js map; toggle button Grid ↔ Map; venue pins with popup

---

### 17. Personalized Feed (ML-lite)
**Priority:** Low  
**Backend steps:**
1. Track user events viewed/booked in `UserActivity` table
2. Simple content-based recommendation: return events matching top genres from user's booking history
3. `GET /events/recommended` endpoint
4. Frontend: "Recommended for You" section on home between hero and horizontal feed
