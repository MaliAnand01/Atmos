import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Users, ArrowLeft, Lightning, Ticket, Share, Heart } from "@phosphor-icons/react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ClayCard from "../components/ClayCard";
import ClayButton from "../components/ClayButton";
import CheckoutModal from "../components/CheckoutModal";
import { api, getImageUrl } from "../services/api";

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get(`/events/${id}`);
        setEvent(data);
      } catch (err) {
        console.error("Failed to load event details:", err);
        setError("This event could not be found.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEventData();
  }, [id]);

  // Derived energy color
  const energyColor = event
    ? event.energyLevel >= 8
      ? "rgba(255,0,127,1)"
      : event.energyLevel <= 3
      ? "rgba(0,240,255,1)"
      : "rgba(168,85,247,1)"
    : "rgba(168,85,247,1)";

  const energyLabel = event
    ? event.energyLevel >= 8 ? "High Energy" : event.energyLevel <= 3 ? "Chill" : "Balanced"
    : "";

  const availabilityPct = event
    ? Math.round((event.availableCapacity / (event.venue?.capacity || 1)) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex flex-col justify-center items-center gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-full border-2 border-chill-blue border-t-transparent"
        />
        <p className="text-text-secondary font-display tracking-widest text-sm uppercase animate-pulse">
          Loading Signal...
        </p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-void flex flex-col justify-center items-center gap-6 text-center px-6">
        <span className="text-6xl">🛸</span>
        <h2 className="text-3xl font-display font-bold text-white">Signal Lost</h2>
        <p className="text-text-secondary">{error || "This event doesn't exist."}</p>
        <ClayButton onClick={() => navigate("/")} variant="primary">Back to Home</ClayButton>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-void min-h-screen font-body text-text-primary"
    >
      {/* ── Hero Image ── */}
      <div className="w-full h-[55vh] md:h-[70vh] relative overflow-hidden">
        <motion.img
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: "circOut" }}
          src={getImageUrl(event.imageUrl)}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-void/10" />
        {/* Energy color glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${energyColor}18 0%, transparent 70%)` }} />

        {/* Top actions */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-void/50 backdrop-blur-md rounded-full text-white hover:bg-void/80 transition-colors border border-white/10 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiked(l => !l)}
              className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-300 ${liked ? "bg-energy-pink border-energy-pink text-white" : "bg-void/50 border-white/10 text-white"}`}
            >
              <Heart size={18} weight={liked ? "fill" : "regular"} />
            </button>
            <button className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md bg-void/50 border border-white/10 text-white hover:border-white/30 transition-all">
              <Share size={18} />
            </button>
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 max-w-7xl mx-auto">
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, duration: 0.8, ease: "circOut" }}>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-lg"
                style={{ background: energyColor, boxShadow: `0 0 20px ${energyColor}60` }}
              >
                <Lightning size={14} weight="fill" />
                Level {event.energyLevel} · {energyLabel}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold drop-shadow-lg leading-tight">
              {event.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 flex flex-col lg:flex-row gap-16">
        
        {/* Left: Details */}
        <motion.div
          className="flex-1 space-y-12"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.3 } } }}
        >
          {/* Info grid */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { icon: <MapPin size={22} weight="duotone" className="text-chill-blue" />, label: "Venue", value: event.venue?.name },
              { icon: <Calendar size={22} weight="duotone" className="text-chill-blue" />, label: "Date", value: new Date(event.dateTime).toLocaleDateString("en-IN", { day:'numeric', month:'short', year:'numeric' }) },
              { icon: <Clock size={22} weight="duotone" className="text-chill-blue" />, label: "Time", value: new Date(event.dateTime).toLocaleTimeString("en-IN", { hour:'2-digit', minute:'2-digit' }) },
              { icon: <Users size={22} weight="duotone" className="text-chill-blue" />, label: "Capacity", value: `${event.venue?.capacity} total` },
            ].map(({ icon, label, value }) => (
              <ClayCard key={label} className="p-5 flex flex-col gap-2">
                {icon}
                <p className="text-text-secondary text-xs uppercase tracking-wider mt-1">{label}</p>
                <p className="text-white font-bold text-sm">{value}</p>
              </ClayCard>
            ))}
          </motion.div>

          {/* Divider */}
          <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="h-px bg-white/5" />

          {/* About */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <h2 className="text-2xl font-display font-bold mb-4">About the Event</h2>
            <p className="text-text-secondary text-lg leading-relaxed">
              {event.description || "No description provided for this event. Check back closer to the date for more details."}
            </p>
          </motion.div>

          {/* Vibe meter */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
            <h2 className="text-2xl font-display font-bold mb-6">Vibe Frequency</h2>
            <div className="bg-clay-surface rounded-2xl p-6 border border-white/5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-text-secondary text-sm">Chill</span>
                <span className="text-white font-display font-bold text-lg">Level {event.energyLevel}</span>
                <span className="text-text-secondary text-sm">High Energy</span>
              </div>
              <div className="h-3 bg-void rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${event.energyLevel * 10}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, rgba(0,240,255,1), ${energyColor})` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Location */}
          {event.venue?.address && (
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <h2 className="text-2xl font-display font-bold mb-4">Location</h2>
              <ClayCard className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-chill-blue/10 flex items-center justify-center flex-shrink-0">
                  <MapPin size={24} className="text-chill-blue" weight="duotone" />
                </div>
                <div>
                  <p className="font-bold text-white">{event.venue.name}</p>
                  <p className="text-text-secondary text-sm">{event.venue.address}</p>
                </div>
              </ClayCard>
            </motion.div>
          )}
        </motion.div>

        {/* Right: Ticket sidebar */}
        <div className="w-full lg:w-[360px] shrink-0">
          <div className="sticky top-28">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <ClayCard className="border border-white/10 overflow-hidden">
                {/* Colorful top accent */}
                <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, rgba(0,240,255,1), ${energyColor})` }} />
                
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Ticket size={22} className="text-chill-blue" />
                    <h3 className="text-xl font-display font-bold">Grab Your Spot</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <p className="text-text-secondary text-xs uppercase tracking-widest mb-1">Entry Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-display font-bold text-white">₹{event.price ?? 499}</span>
                      <span className="text-text-secondary">/ person</span>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="mb-8 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Spots Remaining</span>
                      <span className="text-energy-pink font-bold flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-energy-pink opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-energy-pink"></span>
                        </span>
                        {event.availableCapacity ?? "Limited"}
                      </span>
                    </div>
                    <div className="h-2 bg-void rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${availabilityPct}%` }}
                        transition={{ duration: 1, delay: 0.6, ease: "circOut" }}
                        className="h-full rounded-full bg-energy-pink"
                      />
                    </div>
                    <p className="text-text-secondary text-xs">{availabilityPct}% capacity available</p>
                  </div>

                  <ClayButton
                    className="w-full text-void bg-chill-blue text-base py-4 shadow-[0_4px_30px_rgba(0,240,255,0.3)] hover:shadow-[0_4px_40px_rgba(0,240,255,0.5)] border-none font-bold tracking-wide"
                    variant="primary"
                    onClick={() => setIsCheckoutOpen(true)}
                  >
                    Book Now
                  </ClayButton>
                  
                  <p className="text-center text-text-secondary/60 text-xs mt-4">
                    🔒 Safe & secure checkout
                  </p>
                </div>
              </ClayCard>

              {/* Event meta tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {["Nightlife", energyLabel, "Live Music"].map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-clay-surface border border-white/5 text-text-secondary text-xs">
                    #{tag.replace(" ","")}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-clay-surface/95 backdrop-blur-xl p-4 border-t border-white/10 z-40 flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-[10px] uppercase tracking-wider">Entry</p>
          <p className="text-xl font-bold font-display">₹{event.price ?? 499}</p>
        </div>
        <ClayButton
          className="bg-chill-blue text-void font-bold shadow-[0_0_20px_rgba(0,240,255,0.3)] border-none px-8"
          variant="primary"
          onClick={() => setIsCheckoutOpen(true)}
        >
          Book Now
        </ClayButton>
      </div>

      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} eventName={event.title} eventId={event.id} price={event.price ?? 499} />
    </motion.div>
  );
}
