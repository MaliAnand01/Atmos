import React, { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pizza,
  Command,
  Globe,
  Cloud,
  Smartphone,
  CheckCircle,
  LayoutDashboard,
  Wand2,
  Music,
  Martini,
  Sparkles,
  Star,
  CheckCheck,
  MapPin,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { cn } from "../utils/cn";
import { getImageUrl } from "../services/api";
import { Link } from "react-router-dom";

// Helper to wrap indices for infinite scroll logic
const wrap = (min, max, v) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

const AUTO_PLAY_INTERVAL = 4000;
const ITEM_HEIGHT = 85; 

const EventFeatureCarousel = ({ events }) => {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const scrollRef = React.useRef(null);
  const activeChipRef = React.useRef(null);

  const currentIndex = events && events.length > 0 ? ((step % events.length) + events.length) % events.length : 0;
  const currentEvent = events && events.length > 0 ? events[currentIndex] : null;


  // Category to Icon Mapping Using Hugeicons
  const CATEGORY_ICONS = {
    "Music": Music,
    "Nightlife": Martini,
    "Festival": Sparkles,
    "Concert": Star,
    "Trending": CheckCheck,
    "High Energy": Wand2,
    "Food": Pizza,
    "Default": Command,
  };

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (isPaused || !events || events.length === 0) return;
    const interval = setInterval(nextStep, AUTO_PLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, events]);

  // Center active chip on mobile without page jump
  useEffect(() => {
    if (activeChipRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const chip = activeChipRef.current;
      
      const scrollLeft = chip.offsetLeft + (chip.clientWidth / 2) - (container.clientWidth / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth"
      });
    }
  }, [currentIndex]);

  // If no events, show skeleton
  if (!events || events.length === 0) {
    return (
      <div className="w-full h-[450px] bg-clay-surface/20 rounded-[3rem] animate-pulse flex items-center justify-center text-center">
        <p className="text-text-secondary font-display uppercase tracking-widest text-xs">Waiting for the vibe...</p>
      </div>
    );
  }

  const handleChipClick = (index) => {
    const diff = index - currentIndex;
    setStep((s) => s + diff);
  };

  const getCardStatus = (index) => {
    const diff = index - currentIndex;
    const len = events.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return "active";
    if (normalizedDiff === -1) return "prev";
    if (normalizedDiff === 1) return "next";
    return "hidden";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] lg:rounded-[3.5rem] flex flex-col lg:flex-row min-h-[500px] lg:h-[580px] border border-white/10 bg-void shadow-2xl transition-all duration-500 will-change-transform">
        
        {/* Mobile Navigation (Horizontal Scroll) */}
        <div 
          ref={scrollRef}
          className="flex lg:hidden overflow-x-auto scrollbar-hide snap-x p-6 gap-3 z-50 bg-[#0D0F14] border-b border-white/5"
        >
          {events.map((event, index) => {
            const isActive = index === currentIndex;
            const Icon = CATEGORY_ICONS[event.category] || CATEGORY_ICONS.Default;
            return (
              <button
                key={`mobile-nav-${event.id || index}`}
                ref={isActive ? activeChipRef : null}
                onClick={() => handleChipClick(index)}
                className={cn(
                  "snap-center flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-500 border shadow-clay",
                  isActive 
                    ? "bg-white text-void border-white scale-105" 
                    : "bg-clay-surface/40 text-white/40 border-white/5"
                )}
              >
                <Icon size={16} />
                <span className="text-xs font-bold uppercase tracking-tight truncate max-w-[150px]" title={event.title}>{event.title}</span>
              </button>
            );
          })}
        </div>

        {/* Left Side: Navigation Chips (Desktop Only) */}
        <motion.div 
          className="hidden lg:flex lg:w-[40%] h-full relative z-30 flex-col items-start justify-center overflow-hidden lg:pl-12 bg-[#0D0F14] transition-colors duration-1000"
        >
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent z-10 pointer-events-none" />

          {/* Fades for smooth edge transition */}
          <div 
            className="absolute inset-x-0 top-0 h-32 z-40 pointer-events-none bg-gradient-to-b from-[#0D0F14] to-transparent"
          />
          <div 
            className="absolute inset-x-0 bottom-0 h-32 z-40 pointer-events-none bg-gradient-to-t from-[#0D0F14] to-transparent"
          />
          
          <div className="relative w-full h-full flex items-center justify-center lg:justify-start z-20 font-body">
            {events.map((event, index) => {
              const isActive = index === currentIndex;
              const distance = index - currentIndex;
              const wrappedDistance = wrap(
                -(events.length / 2),
                events.length / 2,
                distance
              );

              const Icon = CATEGORY_ICONS[event.category] || CATEGORY_ICONS.Default;

              return (
                <motion.div
                  key={event.id || index}
                  style={{
                    height: ITEM_HEIGHT,
                    width: "fit-content",
                  }}
                  animate={{
                    y: wrappedDistance * ITEM_HEIGHT,
                    opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                    scale: isActive ? 1 : 0.9,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 120,
                    damping: 20,
                    mass: 0.8,
                  }}
                  className="absolute flex items-center justify-start will-change-transform"
                >
                  <button
                    onClick={() => handleChipClick(index)}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className={cn(
                      "relative flex items-center gap-6 px-10 md:px-14 lg:px-10 py-5 md:py-6 lg:py-5 rounded-[2.2rem] transition-all duration-700 text-left group border whitespace-nowrap",
                      isActive
                        ? "bg-white text-void border-white z-10 shadow-clay scale-[1.05]"
                        : "bg-clay-surface/40 text-white/40 border-white/5 shadow-clay hover:border-white/20 hover:text-white"
                    )}
                  >
                    <div
                      className={cn(
                        "flex items-center justify-center transition-colors duration-500",
                        isActive ? "text-void/60" : "text-white/30"
                      )}
                    >
                      <Icon
                        size={24}
                        strokeWidth={2.5}
                      />
                    </div>

                    <span 
                      className={cn(
                        "font-bold text-sm md:text-lg tracking-tight uppercase transition-colors duration-500 truncate max-w-[200px] xl:max-w-[280px]",
                        isActive ? "text-void" : "text-white/60"
                      )}
                      title={event.title}
                    >
                      {event.title}
                    </span>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Side: Image Cards (Premium Parity) */}
        <div 
          className="flex-1 min-h-[400px] lg:h-full relative flex items-center justify-center py-8 lg:py-12 px-6 overflow-hidden border-t lg:border-t-0 lg:border-l border-white/10 bg-[#14161E]/40 backdrop-blur-sm"
        >
          <div className="relative w-full max-w-[320px] md:max-w-[420px] aspect-[4/5] flex items-center justify-center">
            {events.map((event, index) => {
              const status = getCardStatus(index);
              const isActive = status === "active";
              const isPrev = status === "prev";
              const isNext = status === "next";

              return (
                <motion.div
                  key={event.id}
                  initial={false}
                  animate={{
                    x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                    scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                    opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                    rotate: isPrev ? -3 : isNext ? 3 : 0,
                    zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                  drag={isActive ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.2}
                  onDragEnd={(e, info) => {
                    if (info.offset.x < -50) nextStep();
                    else if (info.offset.x > 50) setStep(s => s - 1);
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 150,
                    damping: 25,
                    mass: 0.5,
                  }}
                  className="absolute inset-0 rounded-[1.8rem] md:rounded-[2.4rem] overflow-hidden border-4 md:border-8 border-void bg-void shadow-2xl origin-center will-change-transform"
                >
                  <img
                    src={getImageUrl(event.imageUrl)}
                    alt={event.title}
                    className={cn(
                      "w-full h-full object-cover transition-all duration-700 will-change-transform",
                      isActive
                        ? "grayscale-0 blur-0 scale-100"
                        : "grayscale blur-[2px] brightness-75 scale-105"
                    )}
                  />

                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute inset-x-0 bottom-0 p-8 pt-32 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end pointer-events-none"
                      >
                        <div className="bg-white/10 backdrop-blur-xl text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-fit shadow-clay mb-3 border border-white/20">
                          {index + 1} • {event.category}
                        </div>
                        
                        <div className="space-y-4">
                           <div className="flex items-center gap-4 text-white/80 text-[10px] font-bold tracking-widest uppercase">
                              <div className="flex items-center gap-1.5">
                                 <Calendar size={14} />
                                 <span>{new Date(event.dateTime).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                 <MapPin size={14} />
                                 <span>{event.venue?.name}</span>
                              </div>
                           </div>
                           <p className="text-white font-display font-bold text-xl md:text-2xl leading-tight tracking-tight drop-shadow-md">
                              {event.title}
                           </p>
                           <Link to={`/event/${event.id}`} className="pointer-events-auto block w-fit pt-2">
                            <motion.button 
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="bg-white text-void px-8 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-clay"
                            >
                              Get Access <ArrowRight size={18} strokeWidth={2.5} />
                            </motion.button>
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    className={cn(
                      "absolute top-6 left-6 flex items-center gap-3 transition-opacity duration-300",
                      isActive ? "opacity-100" : "opacity-0"
                    )}
                  >
                    <div className="w-2 h-2 rounded-full bg-energy-pink shadow-clay animate-pulse" />
                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] font-display">
                      Featured Experience
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(EventFeatureCarousel);
