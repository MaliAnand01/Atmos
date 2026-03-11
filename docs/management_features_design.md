# Design: Advanced Management Features

To bring the Atmos platform to a "real-world" standard, we will implement complete CRUD (Create, Read, Update, Delete) capabilities for Users, Events, and Venues.

## 1. Profile & Account Management
**Goal**: Allow users to maintain their data or leave the platform.

### User/Organizer Dashboard Update
- Add a **Settings** tab.
- **Form**: Fields for `Username`, `Email`.
- **Logic**: Password update requires careful re-encryption.
- **Danger Zone**: "Delete Account" button.
- **Database Impact**: Hard delete of the User record. (Note: Foreign keys for bookings/events will need to be handled via `onDelete=CASCADE` or manual cleanup).

## 2. Event Lifecycle (Organizer)
**Goal**: Allow organizers to fix mistakes or cancel events.

### Actions
- **Edit Event**: Re-opens the event wizard with pre-populated data (`PUT /api/events/{id}`).
- **Delete Event**: Removes the event from the platform.
- **Business Logic**: Deleting an event should automatically set all associated bookings to `CANCELLED`.

## 3. Venue Management (Admin)
**Goal**: Allow admins to update the physical locations available.

### Actions
- **Edit Venue**: Update address, capacity, or name.
- **Delete Venue**: Remove old venues.
- **Safety Guard**: Prevent deletion if any future events are scheduled at the venue.

## Implementation Roadmap
1. **Phase 1 (Backend)**: Add missing `PUT` and `DELETE` endpoints for Events and Venues. Update [UserService](file:///d:/Users/as/Desktop/Final_Project/Atmos_Backend/src/main/java/com/itvedant/atmos/Service/UserService.java#12-83) to handle profile updates.
2. **Phase 2 (Frontend - Profile)**: Build the Settings UI.
3. **Phase 3 (Frontend - Actions)**: Add Edit/Delete buttons to cards and modals.
