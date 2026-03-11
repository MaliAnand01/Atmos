# 🎵 Atmos — The Ultimate Vibe-Based Event Platform

Atmos is a premium event discovery and booking platform that focuses on "vibe-based" filtering. Built with a high-performance Spring Boot backend and an ultra-premium React frontend, Atmos provides a seamless experience for attendees, organizers, and administrators.

![Atmos Logo](https://raw.githubusercontent.com/username/repo/main/Atmos_Frontend/public/logo_placeholder.png)

## 🌟 Key Features
- **Vibe Slider**: Discover events based on activity intensity and mood using an interactive, GSAP-powered slider.
- **Dynamic Grid**: A high-performance horizontal scroll feed and bento-style venue grid.
- **Role-Based Portals**:
  - **Attendees**: Personal ticket wallet with real-time QR generation and vibe history.
  - **Organizers**: Full event management suite with an intuitive 4-step creation wizard.
  - **Admins**: Platform-wide moderation, user management, and venue controls.
- **Ultra-Premium UI**: Glassmorphism, smooth Lenis scrolling, and Framer Motion transitions.

## 🛠️ Tech Stack
- **Backend**: Spring Boot 3.4.1, Spring Data JPA, MySQL, Spring Security.
- **Frontend**: React 18, Vite, Framer Motion, GSAP, TailwindCSS, Phosphor Icons.
- **Design**: Claymorphism, custom typography (Outfit), and dynamic ambient lighting.

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL Server

### 1. Backend Setup
```bash
cd Atmos_Backend
./mvnw spring-boot:run
```
*Note: The system automatically seeds an Admin, Organizer, and several Mumbai-based events on first boot.*

### 2. Frontend Setup
```bash
cd Atmos_Frontend
npm install
npm run dev
```
Explore the void at `http://localhost:5173`.

## 📁 Project Structure
- **/Atmos_Backend**: Spring Boot source, data repositories, and API controllers.
- **/Atmos_Frontend**: React source, premium components, and design assets.
- **/docs**: Technical analysis, feature designs, and development task lists.

---
*Created as a final project to demonstrate full-stack excellence in technical implementation and visual design.*
