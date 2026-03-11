# 🎵 Atmos — Full Codebase Analysis

## Tech Stack Summary
| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.4.1, Java 17, JPA (Hibernate), Spring Security, MySQL |
| Frontend | React 18 (Vite), Framer Motion, GSAP, Lenis, TailwindCSS, Phosphor Icons |
| Auth | localStorage (Basic Auth token + user object), custom [HeaderAuthFilter](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/HeaderAuthFilter.java#23-53) |

---

## ✅ Features & Functionalities (What Works Now)

### 🔐 Authentication System
- User **Registration** (`POST /api/auth/register`) with role selection: `ROLE_USER` (Attendee) or `ROLE_ORGANIZER`
- User **Login** (`POST /api/auth/login`) with BCrypt password validation
- Self-registration as `ROLE_ADMIN` is blocked server-side
- Password hashed via `BCryptPasswordEncoder` before storing
- Auth state stored in `localStorage` (`atmos_user`, `atmos_token`)
- **Logout** clears localStorage and redirects to home
- Password visibility toggle in the AuthModal
- Login on Enter key press

### 🛡️ Authorization (RBAC)
- Custom [HeaderAuthFilter](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/HeaderAuthFilter.java#23-53): reads `X-User-Id` and `X-User-Role` headers set by the frontend
- Spring `@PreAuthorize` annotations protect write endpoints per role
- 3 roles in play: `ROLE_ADMIN`, `ROLE_ORGANIZER`, `ROLE_USER`
- Protected routes on frontend using `ProtectedRoute` component (redirects to `?auth=true`)

### 📅 Events
- **List all events** (`GET /api/events`) — public endpoint
- **Event detail** (`GET /api/events/{id}`) — public endpoint
- **Vibe/Energy filter** (`GET /api/events/vibe?level=n`) — filters events with energy level ±1 of slider value
- **Organizer events** (`GET /api/events/organizer/{id}`) — protected
- **Create event** (`POST /api/events`) — organizer/admin only, with image upload
- **Delete event** (`DELETE /api/events/{id}`) — admin only
- Events have: `title`, `description`, `imageUrl`, `energyLevel` (1–10), `dateTime`, `totalCapacity`, `availableCapacity`, `venue`, `organizerId`

### 🎟️ Booking System
- **Book an event** (`POST /api/events/{eventId}/book/{userId}`) — @Transactional, decrements capacity, prevents overbooking
- **View user bookings** (`GET /api/bookings/user/{userId}`) — protected
- **Cancel booking** (`PUT /api/bookings/{bookingId}/cancel`) — sets status to "CANCELLED"
- Bookings have: `user`, `event`, `status` ("ACTIVE"/"CANCELLED"), `bookingTime`

### 🏟️ Venues
- **List all venues** (`GET /api/venues`) — public endpoint
- **Create venue** (`POST /api/venues`) — admin UI
- **Delete venue** — admin UI, via `DELETE /api/venues/{id}`
- Venues have: `name`, `address`, `capacity`, `imageUrl`, linked events

### 📁 File Upload
- Image upload to local `uploads/` directory (`POST /api/files/upload`)
- UUID-based filenames to prevent overwrites
- Path traversal protection (`..` check)
- Returns relative URL `/uploads/{filename}` for use as `imageUrl` on events

### 👤 User Management
- **List all users** — admin only
- **Get user by ID** — own profile or admin
- **Update profile** — username, email, optional password change, with live save in `localStorage`
- **Delete user** — admin only

### 🌐 Frontend Pages & Components
| Page/Component | Description |
|---|---|
| **Home** | Hero + animated Vibe Slider + live event preview + horizontal scroll feed + venues grid |
| **Discover** | Full event grid with search bar + category filter (All / Chill / Balanced / High Energy) |
| **EventDetail** | Full detail page with hero image, info grid, vibe meter bar, availability bar, sticky booking sidebar |
| **Dashboard** | Role-aware dashboard: routes to AdminView / OrganizerView / AttendeeView |
| **Tickets** | (partially implemented) Displays hardcoded mock tickets with QR codes |
| **AuthModal** | Login/Register modal with animated form switching, role picker |
| **CheckoutModal** | Booking confirmation modal (UI only — no real API call) |
| **AdminView** | Stats cards, user directory with delete, event moderation list, venue CRUD |
| **OrganizerView** | 4-step wizard to create events + list of organizer's own events with sales ring |
| **AttendeeView** | My Tickets (from real API) + Vibe History + Profile edit |

### 🎨 UI/UX Highlights
- Smooth scroll via Lenis (ReactLenis)
- Page transitions via Framer Motion `AnimatePresence`
- GSAP ambient background tint change on vibe slider move
- Floating orbs, glassmorphism ClayCards, gradient typography
- Animated skeletons / loading states throughout
- Horizontal scroll snap for attendee tickets
- Responsive & mobile-aware layout (mobile CTA bar on EventDetail)

### 🗃️ Database Seeding (DataLoader)
- Seeds 3 users (Admin, User, Organizer), 5 Mumbai venues, 5 events on app startup (only if tables are empty)

---

## ⚠️ Problems & Flaws Found

### 🔴 Critical (Security)

| # | Issue | Location | Detail |
|---|---|---|---|
| 1 | **Trusting client-sent headers for auth** | [HeaderAuthFilter.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/HeaderAuthFilter.java) | The filter trusts `X-User-Id` and `X-User-Role` headers with zero verification. Any malicious user can set these headers manually in a browser/Postman and impersonate any role or user ID. **No real token validation happens.** |
| 2 | **Plaintext credentials stored in localStorage** | [AuthModal.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/AuthModal.jsx) L46 | The Basic Auth token is `btoa(email:password)` — essentially plain credentials in base64 in `localStorage`. Easy to decode if XSS occurs. |
| 3 | **[cancelBooking](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Service/BookingService.java#25-34) doesn't restore capacity** | [BookingService.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Service/BookingService.java) L30–32 | A comment even acknowledges this: `"You could also add logic here to increase the Event capacity back up by 1"` — but it was never implemented. Cancellations leak capacity permanently. |
| 4 | **No ownership check in [cancelBooking](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Service/BookingService.java#25-34)** | [BookingController.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Controller/BookingController.java) L29 | Any logged-in user with `ROLE_USER` can cancel **anyone else's** booking if they know the `bookingId`. |
| 5 | **`@CrossOrigin(origins = "*")`** | All Controllers | Each controller has wildcard CORS, but [SecurityConfig](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/SecurityConfig.java#19-64) already configures CORS properly for `localhost:5173`. The controller-level annotations are redundant and could cause conflicts or inconsistency in production. |

### 🟡 Medium (Logic/Functionality Bugs)

| # | Issue | Location | Detail |
|---|---|---|---|
| 6 | **CheckoutModal doesn't call the API** | [CheckoutModal.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/CheckoutModal.jsx) L11–16 | [handleConfirm](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/CheckoutModal.jsx#11-17) uses a `setTimeout` to fake success. The actual booking endpoint (`POST /api/events/{id}/book/{userId}`) is **never called** from here. Tickets appear in the modal but not in the database. |
| 7 | **Tickets page uses hardcoded mock data** | [Tickets.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/Tickets.jsx) L6–9 | The page shows 2 hardcoded fake tickets instead of fetching real bookings from the backend. This is a dead page. |
| 8 | **Vibe History is static/hardcoded** | [AttendeeView.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/dashboards/AttendeeView.jsx) L138 | Shows `"80% High-Energy"` as a hardcoded string; not computed from real bookings. |
| 9 | **EventDetail price is hardcoded** | [EventDetail.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/EventDetail.jsx) L239, L298 | Shows `₹499` / `$45.00` hardcoded. There is no `price` field on the [Event](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Entity/Event.java#12-51) entity. |
| 10 | **Organizer's venue picker is a raw number input** | [OrganizerView.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/dashboards/OrganizerView.jsx) L230–236 | The wizard asks for a "Structural Venue ID" as a number. Organizers have no way to know what IDs exist — should be a dropdown populated from `GET /api/venues`. |
| 11 | **[getEventById](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Controller/EventController.java#29-37) uses in-memory stream instead of repo** | [EventController.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Controller/EventController.java) L31–36 | Fetches **all** events and then filters in Java, instead of using `eventRepository.findById(id)`. Inefficient and wrong pattern. |
| 12 | **Stats on Home page are completely hardcoded** | [Home.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/Home.jsx) L124 | Shows `"1.2K+ Active Events"`, `"340+ Venues"`, `"50K+ Attendees"` with no real data. |
| 13 | **Admin's "Delete Event" in Moderation tab is broken** | [AdminView.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/dashboards/AdminView.jsx) L190 | The trash button on the Events tab has no `onClick` handler — it's a UI dead button. |
| 14 | **No datetime constraint on event creation** | [OrganizerView.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/dashboards/OrganizerView.jsx) L77 | If no date is selected, `new Date().toISOString()` is used as a fallback — an event instantly in the past is created. |
| 15 | **[DataLoader](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/DataLoader.java#18-108) seeds same username twice** | [DataLoader.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/DataLoader.java) L32, L44 | Both admin and organizer users are named `"Anand Mali"`. `username` has a `UNIQUE` constraint, so this will fail if not caught by the `if (count == 0)` guard (it is guarded, but it's still confusing). |

### 🟢 Minor (Code Quality)

| # | Issue | Location | Detail |
|---|---|---|---|
| 16 | **Post-login navigation is identical for all roles** | [AuthModal.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/AuthModal.jsx) L54–60 | All 3 role branches navigate to `/dashboard` — the `if/else` is dead code. |
| 17 | **[WebConfig.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/WebConfig.java) not read** | — | Static resource serving for `/uploads/**` should be confirmed configured there. |
| 18 | **`api.put()` 3rd arg `true` is silently ignored** | [AttendeeView.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/dashboards/AttendeeView.jsx) L45 | The custom `ApiService.put()` only takes 2 args. The 3rd `true` is a no-op (JS accepts extras), but shows a misunderstanding of the API. |
| 19 | **Share button is non-functional** | [EventDetail.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/EventDetail.jsx) L118–120 | Has no `onClick` — purely decorative. |
| 20 | **Heart/like button state is not persisted** | [EventDetail.jsx](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/pages/EventDetail.jsx) L17, 113 | Like state is lost on page refresh. |

---

## 💡 Proposals — What to Add Next (Intermediate Level)

Keeping the project at a **solid intermediate level**, here are prioritized additions:

### 🔥 High Priority (Fix core gaps)

1. **Wire the CheckoutModal to the real backend**  
   Call `POST /api/events/{eventId}/book/{userId}` in `CheckoutModal.handleConfirm()`. This connects the entire booking flow end-to-end.

2. **Restore event capacity on booking cancellation**  
   In `BookingService.cancelBooking()`, fetch the booking's event and increment `availableCapacity` by 1 before saving. This is already noted as a TODO in the code.

3. **Fix [getEventById](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Controller/EventController.java#29-37) to use the repository**  
   Replace the stream filter in [EventController](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Controller/EventController.java#13-69) with a direct `eventRepository.findById(id)` call.

4. **Add a `price` field to the [Event](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Entity/Event.java#12-51) entity**  
   Add `private Double price;` to [Event.java](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Entity/Event.java) so the EventDetail page can show real prices from the database.

5. **Venue dropdown in Organizer wizard (Step 2)**  
   Fetch `GET /api/venues` and render a `<select>` instead of a raw number input.

6. **Connect the Tickets page to real data**  
   The Tickets page already exists — just wire it up to the `GET /bookings/user/{userId}` API (same data as AttendeeView's tickets tab).

### ✨ Medium Priority (Enhance features)

7. **Event Search/Filter on backend** (add to `EventRepository`)  
   Add `findByTitleContainingIgnoreCase(String keyword)` so search happens server-side rather than loading all events and filtering in the browser.

8. **Compute dynamic Vibe History**  
   Calculate the distribution of energy levels from the attendee's real bookings and render the bar chart accordingly.

9. **Wire Admin's Event Delete button**  
   Add an `onClick` handler to the trash button in [AdminView](file:///d:/Users/as/Desktop/Final_Project/Atmos_Frontend/src/components/dashboards/AdminView.jsx#9-202) that calls `DELETE /api/events/{id}`.

10. **"Add to Wallet" / QR Code for tickets**  
    Generate a QR code using the real `bookingId` (e.g., `qr-server.com` API with `data=booking_{id}`) in the AttendeeView ticket cards.

11. **Dynamic homepage stats**  
    Fetch counts from the API: total events, venues, and total bookings to populate the stats row in the hero.

### 🌟 Stretch Goals (Takes the project further)

12. **JWT Authentication** — Replace the Basic Auth token (base64 credentials) with a proper JWT returned by the backend. The [HeaderAuthFilter](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/config/HeaderAuthFilter.java#23-53) would then verify the token signature. This is the primary security uplift needed.

13. **Event Category / Tags**  
    Add a `category` or `tags` field to [Event](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Entity/Event.java#12-51) (e.g., "Techno", "Jazz", "Comedy") for richer filtering on the Discover page.

14. **Pagination on `GET /api/events`**  
    Use Spring's `Pageable` to return paginated events as the DB grows, instead of loading everything at once.

15. **Email / Ticket Confirmation**  
    Integrate Spring Boot's `JavaMailSender` to send a booking confirmation email with event details when a booking is created.

16. **Organizer Analytics Dashboard**  
    Show real charts (using recharts or chart.js) for ticket sales over time for each event.

17. **Event Status (Published / Draft / Cancelled)**  
    Add a `status` field to [Event](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Entity/Event.java#12-51) so organizers can draft events before publishing them.
