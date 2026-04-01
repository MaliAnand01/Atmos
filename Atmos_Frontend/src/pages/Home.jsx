import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import VibeSlider from "../components/VibeSlider";
import EventFeatureCarousel from "../components/EventFeatureCarousel";
import VenuesGrid from "../components/VenuesGrid";
import Footer from "../components/Footer";
import { api, getImageUrl } from "../services/api";
import { useUI } from "../context/UIContext";
import VibePillars from "../components/VibePillars";
import WeekendOutlook from "../components/WeekendOutlook";
import AtmosStories from "../components/AtmosStories";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

gsap.registerPlugin(ScrollTrigger);

// memoized sections
const MemoizedEventCarousel = memo(EventFeatureCarousel);
const MemoizedVenuesGrid = memo(VenuesGrid);
const MemoizedFooter = memo(Footer);

export default function Home() {
  const { state, dispatch } = useUI();
  const { vibeLevel } = state;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [siteStats, setSiteStats] = useState({ events: 0, venues: 0, bookings: 0 });
  const [showVibeHint, setShowVibeHint] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(false);
  
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const venuesSectionRef = useRef(null);
  const orbsRef = useRef(null);


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

  useEffect(() => {
    fetchEventsByVibe(vibeLevel);
    api.get('/stats').then(data => setSiteStats(data)).catch(() => {});
  }, [fetchEventsByVibe, vibeLevel]);

  useEffect(() => {
    const hasSeenHint = sessionStorage.getItem("atmos_vibe_hint_seen");
    if (!hasSeenHint) {
      const timer = setTimeout(() => setShowVibeHint(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // vibe context
  const vibeCtxRef = useRef(null);

  const handleVibeChange = useCallback((level) => {
    dispatch({ type: 'SET_VIBE', payload: level });
    
    // Show scroll hint and toast
    setShowScrollHint(true);
    sessionStorage.setItem("atmos_vibe_hint_seen", "true");
    localStorage.setItem("atmos_vibe_hint_seen", "true"); 
    setShowVibeHint(false);

    toast.success(`Vibe tuned to level ${level}`, {
      id: 'vibe-update',
      icon: '✨',
      duration: 3000,
    });
    
    const colorStops = {
      chill: "radial-gradient(circle at center, rgba(0,240,255,0.08) 0%, rgba(13,15,20,1) 70%)",
      balanced: "radial-gradient(circle at center, rgba(20,22,30,0) 0%, rgba(13,15,20,1) 70%)",
      energy: "radial-gradient(circle at center, rgba(255,0,127,0.08) 0%, rgba(13,15,20,1) 70%)",
    };
    
    let targetGrad = colorStops.balanced;
    if(level <= 3) targetGrad = colorStops.chill;
    if(level >= 8) targetGrad = colorStops.energy;

    // handle vibe update
    if (vibeCtxRef.current) vibeCtxRef.current.revert();
    vibeCtxRef.current = gsap.context(() => {
        gsap.to(".hero-bg-overlay", {
            background: targetGrad,
            duration: 1.5,
            ease: "power2.inOut",
            overwrite: "auto"
        });
    }, containerRef);
  }, [dispatch]);

  // animations
  useEffect(() => {
    // Force a fresh refresh to sync with Lenis/ScrollTrigger
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // orbs
      gsap.to(".orb-1", { x: "20%", y: "15%", duration: 25, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb-2", { x: "-20%", y: "-15%", duration: 30, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".orb-3", { scale: 1.2, duration: 10, repeat: -1, yoyo: true, ease: "power1.inOut" });

      // parallax
      if (window.innerWidth >= 768 && venuesSectionRef.current) {
        gsap.fromTo(venuesSectionRef.current,
          { y: 120 },
          {
            y: 0,
            scrollTrigger: {
              trigger: venuesSectionRef.current,
              start: "top 85%",
              end: "top 20%",
              scrub: 1.2,
              invalidateOnRefresh: true,
            }
          }
        );
      }
    }, containerRef);
    
    return () => {
        ctx.revert();
        if (vibeCtxRef.current) vibeCtxRef.current.revert();
        // clear triggers
        ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-void min-h-screen font-body text-text-primary overflow-x-hidden pb-28 md:pb-0 pt-0 md:pt-0">
      {/* hero */}
      <section className="relative w-full min-h-[90vh] flex flex-col justify-center overflow-hidden z-20 pt-20 pb-20 md:pb-12">
        <div className="hero-bg-overlay absolute inset-0 z-0 pointer-events-none transition-colors duration-1000" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(0,240,255,0.06) 0%, rgba(13,15,20,1) 70%)" }} />
        
        <div ref={orbsRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <div className="orb-1 absolute top-[10%] right-[5%] w-[35vw] h-[35vw] rounded-full bg-gradient-to-br from-chill-blue/10 to-transparent blur-[100px]" />
            <div className="orb-2 absolute bottom-[5%] left-[-10%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-energy-pink/10 to-transparent blur-[100px]" />
            <div className="orb-3 absolute top-[40%] left-[25%] w-[25vw] h-[25vw] rounded-full bg-gradient-to-br from-purple-600/5 to-transparent blur-[80px]" />
        </div>

        <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.1) 40px, rgba(255,255,255,0.1) 41px)" }} />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3 w-fit">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-pink opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-energy-pink"></span>
              </span>
              <span className="text-text-secondary text-sm font-medium uppercase tracking-[0.2em]">Showing Live Events</span>
            </motion.div>

            <div className="space-y-3">
              <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Find Your</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-chill-blue via-purple-400 to-energy-pink">Experience.</span>
              </motion.h1>
              <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="text-text-secondary text-base md:text-lg max-w-lg leading-relaxed">
                  Discover events that match your mood. Use the slider below to filter by energy level.
              </motion.p>
            </div>

            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
              <VibeSlider 
                onVibeChange={handleVibeChange} 
                initialLevel={vibeLevel} 
                showHint={showVibeHint} 
              />
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex items-center gap-6 sm:gap-8 pt-2 flex-wrap">
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

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-chill-blue/10 to-energy-pink/10 blur-2xl scale-95 pointer-events-none" />
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  {[0,1,2].map(i => <div key={i} className="h-24 rounded-2xl bg-clay-surface animate-pulse border border-white/5" />)}
                </motion.div>
              ) : events.length > 0 ? (
                <motion.div key="events" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                  {events.slice(0, 3).map((evt, i) => (
                    <motion.div 
                      key={evt.id} 
                      initial={{ opacity: 0, y: 20 }} 
                      animate={{ opacity: 1, y: 0 }} 
                      transition={{ delay: i * 0.08 }} 
                      onClick={() => navigate(`/event/${evt.id}`)}
                      className="flex gap-4 items-center bg-clay-surface/60 backdrop-blur-xl rounded-2xl border border-white/5 p-4 group cursor-pointer hover:border-chill-blue/30 hover:bg-clay-surface transition-all duration-300 shadow-clay relative overflow-hidden"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={getImageUrl(evt.imageUrl)} alt={evt.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-bold text-white truncate group-hover:text-chill-blue transition-colors">{evt.title}</p>
                        <p className="text-text-secondary text-sm">{evt.venue?.name}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border border-white/10" style={{ background: `hsl(${(evt.energyLevel / 10) * 300}, 80%, 60%)` }}>{evt.energyLevel}</div>
                        <ArrowUpRight size={14} className="text-white/20 group-hover:text-white transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="empty" className="flex items-center justify-center h-48 bg-clay-surface/40 rounded-3xl border border-white/5">
                  <p className="text-text-secondary text-sm">Adjust the slider to find events...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* scroll hint */}
        <AnimatePresence>
          {showScrollHint && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
                setShowScrollHint(false);
              }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 cursor-pointer group flex flex-col items-center gap-2"
            >
              <span className="text-xs font-bold text-white uppercase tracking-[0.3em] bg-void/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 group-hover:border-white/20 transition-all">
                Scroll to explore results
              </span>
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-void animate-bounce shadow-clay">
                <ChevronDown size={24} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* pillars */}
      <VibePillars />

      <div className="relative z-10 bg-void pt-10 pb-4 px-6 max-w-7xl mx-auto">
        <div className="space-y-4 text-center md:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex items-center justify-center md:justify-start gap-3">
             <div className="w-12 h-[1px] bg-white/20" />
             <span className="text-text-secondary text-[10px] font-bold uppercase tracking-[0.4em]">Curated Picks</span>
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-4xl md:text-5xl lg:text-5xl font-display font-bold text-white tracking-tight">
             Spotlight <span className="text-chill-blue">Experiences.</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="text-text-secondary max-w-xl mx-auto md:mx-0 text-xs md:text-sm">
             Hand-picked events that define the current vibe. Choose your journey.
          </motion.p>
        </div>
      </div>

      <div id="events-section" className="relative z-10 bg-void py-6 pb-12">
        <MemoizedEventCarousel events={events} />
      </div>

      {/* outlook */}
      <WeekendOutlook />

      <section ref={venuesSectionRef} className="relative z-30 bg-void pt-4 pb-20">
         <MemoizedVenuesGrid />
      </section>

      {/* stories */}
      <AtmosStories />
      
      <div className="relative z-30 bg-clay-surface">
        <MemoizedFooter />
      </div>
    </div>
  );
}
