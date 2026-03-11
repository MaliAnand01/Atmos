import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import EventDetail from "./pages/EventDetail";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import Tickets from "./pages/Tickets";
import FloatingNav from "./components/FloatingNav";
import AuthModal from "./components/AuthModal";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import { isLoggedIn } from "./services/authStore";
import { ReactLenis } from 'lenis/react';

function AnimatedRoutes() {
  const location = useLocation();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());

  // Check if we should open auth modal (coming from a protected route)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("auth") === "true") {
      setIsAuthOpen(true);
    }
  }, [location.search]);

  // Sync auth state
  useEffect(() => {
    setIsAuthenticated(isLoggedIn());
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <FloatingNav 
        isAuthenticated={isAuthenticated} 
        onAuthClick={() => setIsAuthOpen(true)} 
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => {
          setIsAuthOpen(false);
          // Clean up URL if auth param exists
          if (location.search.includes("auth=true")) {
            window.history.replaceState({}, document.title, location.pathname);
          }
        }} 
        onSuccess={() => setIsAuthenticated(true)}
      />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/event/:id" element={<EventDetail />} />
          
          {/* Protected Routes */}
          <Route path="/discover" element={<Discover />} />
          <Route path="/tickets" element={
            <ProtectedRoute><Tickets /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <ReactLenis root>
      <Router>
        <AnimatedRoutes />
      </Router>
    </ReactLenis>
  );
}

export default App;
