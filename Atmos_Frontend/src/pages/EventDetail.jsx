import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  ArrowLeft, 
  Zap, 
  Ticket, 
  Share2, 
  Heart,
  Info,
  ShieldCheck,
  IdCard,
  Shirt
} from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ClayCard from "../components/ClayCard";
import ClayButton from "../components/ClayButton";
import CheckoutModal from "../components/CheckoutModal";
import { api, getImageUrl } from "../services/api";
import { getUser } from "../services/authStore";
import toast from "react-hot-toast";
import { useUI } from "../context/UIContext";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const user = getUser();
  const { dispatch } = useUI();

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get(`/events/${id}`);
        setEvent(data);
        
        if (user) {
          try {
            const wl = await api.get(`/wishlist/${user.id}`);
            setLiked(wl.some(fav => fav.id === parseInt(id)));
          } catch (e) { console.error(e); }
        }
      } catch (err) {
        console.error("Failed to load event details:", err);
        setError("This event could not be found.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEventData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user?.id]);

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/?auth=true");
      return;
    }
    const isAdding = !liked;
    setLiked(isAdding);
    try {
      await api.post(`/wishlist/${user.id}/${id}`, {});
      toast.success(isAdding ? "Added to wishlist!" : "Removed from wishlist");
    } catch {
      setLiked(!isAdding);
      toast.error("Action failed");
    }
  };
  
  const handleBookingClick = () => {
    if (!user) {
      toast.error("Please login to book this event", {
        icon: '🔒',
        duration: 4000
      });
      dispatch({ type: 'SET_AUTH_MODAL', payload: true });
      return;
    }
    setIsCheckoutOpen(true);
  };

  const energyColor = event
    ? event.energyLevel >= 8 ? "rgba(255,0,127,1)" : event.energyLevel <= 3 ? "rgba(0,240,255,1)" : "rgba(168,85,247,1)"
    : "rgba(168,85,247,1)";

  const energyLabel = event
    ? event.energyLevel >= 8 ? "High Energy" : event.energyLevel <= 3 ? "Chill" : "Balanced"
    : "";

  const availabilityPct = event
    ? Math.round((event.availableCapacity / (event.venue?.capacity || 100)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex flex-col justify-center items-center gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-12 h-12 rounded-full border-2 border-chill-blue border-t-transparent" />
        <p className="text-text-secondary font-display tracking-widest text-sm uppercase animate-pulse">Loading Event Details...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-void flex flex-col justify-center items-center gap-6 text-center px-6">
        <span className="text-6xl">📍</span>
        <h2 className="text-3xl font-display font-bold text-white">Event Not Found</h2>
        <p className="text-text-secondary">{error || "This event is no longer available."}</p>
        <ClayButton onClick={() => navigate("/")} variant="primary">Back to Home</ClayButton>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-void min-h-screen font-body text-text-primary pb-48 md:pb-20">
      <div className="w-full h-[55vh] md:h-[70vh] relative overflow-hidden">
        <motion.img initial={{ scale: 1.08 }} animate={{ scale: 1 }} transition={{ duration: 1.4, ease: "circOut" }} src={getImageUrl(event.imageUrl)} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/10" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${energyColor}18 0%, transparent 70%)` }} />
        <div className="absolute top-20 md:top-8 left-6 right-6 flex items-center justify-between z-20">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-4 py-2 bg-void/50 backdrop-blur-md rounded-full text-white hover:bg-void/80 transition-colors border border-white/10 text-xs font-bold uppercase tracking-widest">
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-3">
            <button onClick={handleWishlistToggle} className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${liked ? "bg-energy-pink border-energy-pink text-white" : "bg-void/50 border-white/10 text-white"}`}>
              <Heart size={18} fill={liked ? "currentColor" : "none"} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-void/50 border border-white/10 text-white hover:border-white/30 transition-all">
              <Share2 size={18} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: "circOut" }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg" style={{ background: energyColor, boxShadow: `0 0 20px ${energyColor}60` }}>
                <Zap size={14} fill="currentColor" /> Level {event.energyLevel} · {energyLabel}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold drop-shadow-lg leading-tight">{event.title}</h1>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-16">
        <motion.div className="flex-1 space-y-12" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}>
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: <MapPin size={22} className="text-chill-blue" />, label: "Venue", value: event.venue?.name },
                { icon: <Calendar size={22} className="text-chill-blue" />, label: "Date", value: new Date(event.dateTime).toLocaleDateString("en-IN", { day:'numeric', month:'short', year:'numeric' }) },
                { icon: <Clock size={22} className="text-chill-blue" />, label: "Time", value: new Date(event.dateTime).toLocaleTimeString("en-IN", { hour:'2-digit', minute:'2-digit' }) },
                { icon: <Users size={22} className="text-chill-blue" />, label: "Capacity", value: `${event.venue?.capacity} total` },
              ].map(({ icon, label, value }) => (
              <ClayCard key={label} className="p-5 flex flex-col gap-2">{icon}<p className="text-text-secondary text-[10px] uppercase font-bold tracking-widest mt-1">{label}</p><p className="text-white font-bold text-sm tracking-tight">{value}</p></ClayCard>
            ))}
          </motion.div>
          <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="h-px bg-white/5" />
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <div className="flex items-center gap-3 mb-4">
              <Zap size={24} className="text-chill-blue" />
              <h2 className="text-2xl font-display font-bold">The Vibe</h2>
            </div>
            {event.tagline && (
              <p className="text-chill-blue font-display font-bold text-xl mb-3 tracking-tight italic opacity-90">"{event.tagline}"</p>
            )}
            <p className="text-text-secondary text-lg leading-relaxed font-body">{event.description || "No description provided."}</p>
          </motion.div>

          {/* artist */}
          {(event.performerName || event.performerBio) && (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }} className="relative group">
               <div className="absolute -inset-4 bg-gradient-to-r from-chill-blue/5 via-energy-pink/5 to-transparent blur-2xl rounded-[3rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-1.5 h-8 bg-chill-blue rounded-full" />
                 <h2 className="text-2xl font-display font-bold">Artist Spotlight</h2>
               </div>
               
               <ClayCard className="p-8 md:p-10 border-white/10 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
                     {event.performerImage && (
                        <div className="relative shrink-0">
                           <div className="w-40 h-40 md:w-56 md:h-56 rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/10 group-hover:border-chill-blue/30 transition-colors duration-500">
                              <img src={getImageUrl(event.performerImage)} alt={event.performerName} className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" />
                           </div>
                           <div className="absolute -inset-2 bg-chill-blue/20 blur-xl rounded-full mix-blend-screen opacity-50 animate-pulse" />
                        </div>
                     )}
                     
                     <div className="flex-1 space-y-6">
                        <div className="space-y-1">
                           {event.tourName && (
                              <span className="text-chill-blue text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">{event.tourName}</span>
                           )}
                           <h3 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">{event.performerName || "Featured Artist"}</h3>
                        </div>
                        
                        <p className="text-text-secondary text-base md:text-lg leading-relaxed font-body italic">
                           {event.performerBio || "Biography coming soon..."}
                        </p>
                        
                        <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-4">
                           <button className="px-6 py-2 rounded-full border border-white/5 bg-white/5 hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest transition-all">View Discography</button>
                           <button className="px-6 py-2 rounded-full border border-chill-blue/20 bg-chill-blue/5 hover:bg-chill-blue/10 text-chill-blue text-[10px] font-bold uppercase tracking-widest transition-all">Tour Schedule</button>
                        </div>
                     </div>
                  </div>
               </ClayCard>
            </motion.div>
          )}
          
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <h2 className="text-2xl font-display font-bold mb-6">Know Before You Go</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ClayCard className="p-4 flex items-start gap-4 border-white/5">
                <div className="text-energy-pink/80 mt-1"><ShieldCheck size={20} /></div>
                <div className="flex-1 min-w-0"><p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Entry Age</p><p className="text-white text-sm font-bold break-words">{event.ageLimit || "18+"}</p></div>
              </ClayCard>
              <ClayCard className="p-4 flex items-start gap-4 border-white/5">
                <div className="text-chill-blue/80 mt-1"><Shirt size={20} /></div>
                <div className="flex-1 min-w-0"><p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Dress Code</p><p className="text-white text-sm font-bold break-words">{event.dressCode || "Smart Casual"}</p></div>
              </ClayCard>
              <ClayCard className="p-4 flex items-start gap-4 border-white/5">
                <div className="text-energy-orange/80 mt-1"><IdCard size={20} /></div>
                <div className="flex-1 min-w-0"><p className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">Door Policy</p><p className="text-white text-sm font-bold break-words">{event.doorPolicy || "Valid ID Required"}</p></div>
              </ClayCard>
            </div>
          </motion.div>

          {event.venue?.address && (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <div className="flex items-center gap-3 mb-4">
                <MapPin size={24} className="text-chill-blue" />
                <h2 className="text-2xl font-display font-bold">Venue Info</h2>
              </div>
              <ClayCard className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-chill-blue/10 flex items-center justify-center flex-shrink-0"><MapPin size={24} className="text-chill-blue" /></div>
                <div><p className="font-bold text-white tracking-tight">{event.venue.name}</p><p className="text-text-secondary text-sm font-body">{event.venue.address}</p></div>
              </ClayCard>
            </motion.div>
          )}
        </motion.div>

        {/* sidebar */}
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="sticky top-28">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <ClayCard className="border border-white/10 overflow-hidden">
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, rgba(0,240,255,1), ${energyColor})` }} />
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6"><Ticket size={22} className="text-chill-blue" /><h3 className="text-xl font-display font-bold uppercase tracking-tight">Access Passes</h3></div>
                  <div className="mb-6"><p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Entry Price</p><div className="flex items-baseline gap-2"><span className="text-5xl font-display font-bold text-white">₹{event.price ?? 499}</span><span className="text-text-secondary">/ person</span></div></div>
                  <div className="mb-8 space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-text-secondary">Spots Remaining</span><span className="text-energy-pink font-bold flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-pink opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-energy-pink"></span></span>{event.availableCapacity ?? "Limited"}</span></div>
                    <div className="h-2 bg-void rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${availabilityPct}%` }} transition={{ duration: 1 }} className="h-full rounded-full bg-energy-pink" /></div>
                    <p className="text-text-secondary text-xs">{availabilityPct}% capacity available</p>
                  </div>
                  <ClayButton className="w-full" variant="primary" onClick={handleBookingClick}>Book Now</ClayButton>
                  <p className="text-center text-text-secondary/60 text-xs mt-4">🔒 Safe & secure checkout</p>
                </div>
              </ClayCard>
              <div className="mt-4 flex flex-wrap gap-2 text-left">
                {["Nightlife", energyLabel, "Live Music"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-clay-surface border border-white/5 text-text-secondary text-[10px] font-bold uppercase tracking-tighter">#{tag.replace(" ","")}</span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-24 left-0 right-0 bg-clay-surface/95 backdrop-blur-xl p-4 border-t border-white/10 z-[60] flex items-center justify-between">
        <div><p className="text-text-secondary text-[10px] uppercase tracking-wider">Entry</p><p className="text-xl font-bold font-display">₹{event.price ?? 499}</p></div>
        <ClayButton className="px-8" variant="primary" onClick={handleBookingClick}>Book Now</ClayButton>
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} eventName={event.title} eventId={event.id} price={event.price ?? 499} />
    </motion.div>
  );
}
