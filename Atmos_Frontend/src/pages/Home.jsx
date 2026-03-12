import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VibeSlider from "../components/VibeSlider";
import HorizontalScrollFeed from "../components/HorizontalScrollFeed";
import VenuesGrid from "../components/VenuesGrid";
import Footer from "../components/Footer";
import { api, getImageUrl } from "../services/api";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [targetVibe, setTargetVibe] = useState(5);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteStats, setSiteStats] = useState({ events: 0, venues: 0, bookings: 0 });
  const venuesSectionRef = useRef(null);

  const fetchEventsByVibe = useCallback(async (level) => {
    try {
      setLoading(true);
      const data = await api.get(`/events/vibe?level=${level}`);
      setEvents(data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial events
  useEffect(() => {
    fetchEventsByVibe(targetVibe);
    // Fetch live site stats for hero section
    api.get('/stats').then(data => setSiteStats(data)).catch(() => {});
  }, [fetchEventsByVibe]);

  // Venues parallax slide-up — desktop only
  useEffect(() => {
    const section = venuesSectionRef.current;
    if (!section) return;
    if (window.innerWidth < 768) return; // only on desktop

    // Start slightly below its natural position, ease into place as user scrolls
    gsap.fromTo(
      section,
      { y: 120 },
      {
        y: 0,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          end: "top 20%",
          scrub: 1.2,
          invalidateOnRefresh: true,
        },
      }
    );
    return () => {
      ScrollTrigger.getAll()
        .filter(st => st.trigger === section)
        .forEach(t => t.kill());
    };
  }, []);

  const handleVibeChange = useCallback((vibeLevel) => {
    setTargetVibe(vibeLevel);
    fetchEventsByVibe(vibeLevel);
    
    const colorStops = {
      chill: "radial-gradient(circle at center, rgba(0,240,255,0.08) 0%, rgba(13,15,20,1) 70%)",
      balanced: "radial-gradient(circle at center, rgba(20,22,30,0) 0%, rgba(13,15,20,1) 70%)",
      energy: "radial-gradient(circle at center, rgba(255,0,127,0.08) 0%, rgba(13,15,20,1) 70%)",
    };
    
    let targetGrad = colorStops.balanced;
    if(vibeLevel <= 3) targetGrad = colorStops.chill;
    if(vibeLevel >= 8) targetGrad = colorStops.energy;

    gsap.to(".hero-bg-overlay", {
        background: targetGrad,
        duration: 1.5,
        ease: "power2.inOut"
    });
  }, [fetchEventsByVibe]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-void min-h-screen font-body text-text-primary overflow-x-hidden pb-28 md:pb-0 pt-10 md:pt-0" 
    >
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden z-20 pt-24 pb-28 md:pb-16">
        
        {/* Animated ambient background */}
        <div className="hero-bg-overlay absolute inset-0 z-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,240,255,0.06) 0%, rgba(13,15,20,1) 70%)" }} />
        
        {/* Floating orbs */}
        <motion.div animate={{ y: [-20, 20, -20], rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="absolute top-[10%] right-[5%] w-[28vw] h-[28vw] rounded-full bg-gradient-to-br from-chill-blue/10 to-transparent blur-[80px] pointer-events-none" />
        <motion.div animate={{ y: [20, -20, 20], rotate: -360 }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} className="absolute bottom-[5%] left-[-5%] w-[22vw] h-[22vw] rounded-full bg-gradient-to-br from-energy-pink/10 to-transparent blur-[80px] pointer-events-none" />
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] left-[30%] w-[18vw] h-[18vw] rounded-full bg-gradient-to-br from-purple-600/5 to-transparent blur-[60px] pointer-events-none" />

        {/* Grid / noise overlay */}
        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)" }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text and Vibe Slider */}
          <div className="flex flex-col gap-8">
            {/* Live tag */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="flex items-center gap-3 w-fit">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-energy-pink"></span>
              </span>
              <span className="text-text-secondary text-sm font-medium uppercase tracking-[0.2em]">Showing Live Events</span>
            </motion.div>

            {/* Main heading */}
            <div className="space-y-3">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05]"
              >
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Find Your</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-chill-blue via-purple-400 to-energy-pink">Experience.</span>
              </motion.h1>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "circOut" }}
                  className="text-text-secondary text-base md:text-lg max-w-lg leading-relaxed"
                >
                  Discover events that match your mood. Use the slider below to filter by energy level.
                </motion.p>
            </div>

            {/* Vibe Slider */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.35, ease: "circOut" }}
            >
              <VibeSlider onVibeChange={handleVibeChange} initialLevel={targetVibe} />
            </motion.div>

            {/* Stats row — real data from /api/stats */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="flex items-center gap-6 sm:gap-8 pt-2 flex-wrap">
              {[
                [siteStats.events  >= 0 ? `${siteStats.events}+` : "…",   "Active Events"],
                [siteStats.venues  >= 0 ? `${siteStats.venues}+` : "…",   "Venues"],
                [siteStats.bookings >= 0 ? `${siteStats.bookings}+` : "…", "Bookings"]
              ].map(([num, label]) => (
                <div key={label} className="flex flex-col">
                  <span className="text-xl font-display font-bold text-white">{num}</span>
                  <span className="text-text-secondary text-xs uppercase tracking-widest">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Live Event Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: "circOut" }}
            className="relative hidden lg:block"
          >
            {/* Glow behind preview */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-chill-blue/10 to-energy-pink/10 blur-2xl scale-95 pointer-events-none" />

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col gap-4">
                  {[0,1,2].map(i => (
                    <div key={i} className="h-24 rounded-2xl bg-clay-surface animate-pulse border border-white/5" />
                  ))}
                </motion.div>
              ) : events.length > 0 ? (
                <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex flex-col gap-4">
                  {events.slice(0, 3).map((evt, i) => (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex gap-4 items-center bg-clay-surface/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 group cursor-pointer hover:border-white/20 hover:bg-clay-surface transition-all duration-300 shadow-clay"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={getImageUrl(evt.imageUrl)} alt={evt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-white truncate">{evt.title}</p>
                        <p className="text-text-secondary text-sm">{evt.venue?.name}</p>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-white/10"
                        style={{ background: `hsl(${(evt.energyLevel / 10) * 300}, 80%, 60%)` }}>
                        {evt.energyLevel}
                      </div>
                    </motion.div>
                  ))}
                  {events.length > 3 && (
                    <p className="text-center text-text-secondary text-sm pt-1">+{events.length - 3} more events available</p>
                  )}
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-48 bg-clay-surface/40 rounded-3xl border border-white/5">
                  <p className="text-text-secondary text-sm">Adjust the slider to find events...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-text-secondary/40 z-10">
          <span className="text-[10px] uppercase tracking-[0.3em]">Scroll to Explore</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </motion.div>
      </section>

      {/* Trending Orbits - Handles its own pinning */}
      <div className="relative z-10">
        <HorizontalScrollFeed events={events} />
      </div>

      {/* Featured Venues — slides up over the horizontal feed on desktop */}
      <section
        ref={venuesSectionRef}
        className="relative z-30 bg-clay-surface pt-20 md:pt-24 pb-32 rounded-t-[5rem] shadow-[0_-80px_100px_rgba(0,0,0,1)] border-t border-white/10"
      >
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1.5 bg-white/10 rounded-full mt-10" />
         <VenuesGrid />
      </section>
      
      <div className="relative z-30 bg-clay-surface">
        <Footer />
      </div>
    </motion.div>
  );
}
