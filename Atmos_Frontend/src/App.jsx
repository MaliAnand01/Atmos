import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ReactLenis } from 'lenis/react';
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Discover from "./pages/Discover";
import EventDetail from "./pages/EventDetail";
import Dashboard from "./pages/Dashboard";
import Tickets from "./pages/Tickets";

import FloatingNav from "./components/FloatingNav";
import AuthModal from "./components/AuthModal";

import ScrollToTopButton from "./components/ScrollToTopButton";
import ScrollToTop from "./components/ScrollToTop";

import { UIProvider, useUI } from "./context/UIContext";


function AnimatedRoutes() {
  const location = useLocation();
  const { state, dispatch } = useUI();
  const { isAuthModalOpen, isAuthenticated } = state;

  return (
    <>
      <FloatingNav onAuthClick={() => dispatch({ type: 'SET_AUTH_MODAL', payload: true })} isAuthenticated={isAuthenticated} />
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
        </Routes>
      </AnimatePresence>



      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => dispatch({ type: 'SET_AUTH_MODAL', payload: false })} 
        onSuccess={() => dispatch({ type: 'SET_AUTH', payload: { isAuthenticated: true, user: JSON.parse(localStorage.getItem('atmos_user') || 'null') } })}
      />
    </>
  );
}

function App() {
  return (
    <UIProvider>
      <ReactLenis root>
        <Toaster 
          position="top-center"
          toastOptions={{
            style: {
              background: '#14161E',
              color: '#F8FAFC',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(12px)',
              borderRadius: '16px',
              fontSize: '14px',
              padding: '12px 24px',
            },
            success: { iconTheme: { primary: '#00F0FF', secondary: '#14161E' } },
            error: { iconTheme: { primary: '#FF007F', secondary: '#14161E' } }
          }}
        />
        <Router>
          <ScrollToTop />
          <ScrollToTopButton />
          <AnimatedRoutes />
        </Router>
      </ReactLenis>
    </UIProvider>
  );
}

export default App;
