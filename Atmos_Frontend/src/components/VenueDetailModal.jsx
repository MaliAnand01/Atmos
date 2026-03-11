import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CalendarBlank, Users, ArrowSquareOut, Ticket } from "@phosphor-icons/react";
import ClayButton from "./ClayButton";
import { useState, useEffect } from "react";
import { api, getImageUrl } from "../services/api";
import { Link } from "react-router-dom";

export default function VenueDetailModal({ isOpen, onClose, venue }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && venue?.id) {
      const fetchVenueEvents = async () => {
        try {
          setLoading(true);
          const data = await api.get(`/events/venue/${venue.id}`);
          setEvents(data);
        } catch (error) {
          console.error("Failed to fetch venue events:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVenueEvents();
    }
  }, [isOpen, venue?.id]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDirections = () => {
    if (venue?.address) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address + " " + venue.name)}`, "_blank");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void/80 backdrop-blur-xl"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            className="bg-clay-surface rounded-[2.5rem] shadow-clay w-full max-w-2xl relative overflow-hidden text-text-primary z-10 max-h-[90vh] flex flex-col border border-white/5"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-text-secondary hover:text-white transition-colors z-20 bg-void/50 rounded-full backdrop-blur-md border border-white/10"
            >
              <X size={20} weight="bold" />
            </button>

            {/* Hero Image */}
            <div className="relative h-64 shrink-0 overflow-hidden">
              <img 
                src={venue.imageUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200"} 
                alt={venue.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-clay-surface via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-8">
                 <h2 className="text-4xl font-display font-bold text-white drop-shadow-lg">{venue.name}</h2>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-8 flex-grow overflow-y-auto no-scrollbar">
              <style dangerouslySetInnerHTML={{ __html: `
                .no-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .no-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-void/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-1 items-center text-center">
                   <MapPin size={24} className="text-chill-blue mb-1" weight="fill" />
                   <span className="text-xs uppercase tracking-widest text-text-secondary">Location</span>
                   <span className="text-sm font-medium text-white line-clamp-1">{venue.address}</span>
                </div>
                <div className="bg-void/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-1 items-center text-center">
                   <Users size={24} className="text-energy-pink mb-1" weight="fill" />
                   <span className="text-xs uppercase tracking-widest text-text-secondary">Capacity</span>
                   <span className="text-sm font-medium text-white">{venue.capacity} People</span>
                </div>
                <div className="bg-void/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-1 items-center text-center cursor-pointer hover:bg-void/60 transition-colors"
                     onClick={handleDirections}>
                   <ArrowSquareOut size={24} className="text-purple-400 mb-1" weight="fill" />
                   <span className="text-xs uppercase tracking-widest text-text-secondary">Navigation</span>
                   <span className="text-sm font-medium text-purple-400 underline underline-offset-4">Get Directions</span>
                </div>
              </div>

              {/* Upcoming Events Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-xl font-display font-bold text-white">Upcoming Sets</h3>
                   <span className="text-xs font-bold text-chill-blue uppercase tracking-tighter bg-chill-blue/10 px-2 py-0.5 rounded border border-chill-blue/20">
                     {events.length} Live
                   </span>
                </div>

                <div className="space-y-3">
                  {loading ? (
                    [1,2].map(i => (
                      <div key={i} className="h-20 bg-void/50 rounded-2xl animate-pulse border border-white/5" />
                    ))
                  ) : events.length > 0 ? (
                    events.map(event => (
                      <Link 
                        to={`/event/${event.id}`} 
                        key={event.id}
                        onClick={onClose}
                        className="flex items-center gap-4 bg-void/30 p-3 rounded-2xl border border-white/5 hover:border-white/20 hover:bg-void/50 transition-all group"
                      >
                         <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                            <img src={getImageUrl(event.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={event.title} />
                         </div>
                         <div className="flex-grow">
                            <p className="font-bold text-white">{event.title}</p>
                            <div className="flex items-center gap-3 text-xs text-text-secondary">
                               <div className="flex items-center gap-1">
                                  <CalendarBlank size={12} className="text-chill-blue" />
                                  {new Date(event.dateTime).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                               </div>
                               <div className="flex items-center gap-1">
                                  <Users size={12} className="text-energy-pink" />
                                  {event.availableCapacity} left
                               </div>
                            </div>
                         </div>
                         <div className="px-4">
                            <ArrowSquareOut size={20} className="text-text-secondary group-hover:text-white transition-colors" />
                         </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-void/20 rounded-2xl border border-dashed border-white/10 text-text-secondary">
                       <Ticket size={32} className="mx-auto mb-2 opacity-20" />
                       <p className="text-sm">No scheduled events at this location.</p>
                       <p className="text-xs mt-1">Check back later or tune your vibe slider.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer CTA */}
              <div className="mt-12">
                 <ClayButton 
                    className="w-full bg-chill-blue text-void font-bold shadow-lg shadow-chill-blue/20"
                    variant="primary"
                    onClick={onClose}
                 >
                    Close Discovery
                 </ClayButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
