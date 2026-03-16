import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ClayCard from "../ClayCard";
import { Ticket, History, MapPin, Heart, Users } from "lucide-react";
import { api, getImageUrl } from "../../services/api";
import { getUser } from "../../services/authStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function AttendeeView() {
    const [bookings, setBookings] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [activeTab, setActiveTab] = useState("bookings");
    const [loading, setLoading] = useState(true);
    const [user] = useState(getUser());

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const [bookingsData, wishlistData] = await Promise.all([
                    api.get(`/bookings/user/${user.id}`, true),
                    api.get(`/wishlist/${user.id}`).catch(() => [])
                ]);
                setBookings(bookingsData);
                setWishlist(wishlistData);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user?.id]);
  
    const handleRemoveWishlist = async (e, eventId) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await api.post(`/wishlist/${user.id}/${eventId}`);
        setWishlist(prev => prev.filter(item => item.id !== eventId));
        toast.success("Removed from wishlist");
      } catch (err) {
        toast.error("Failed to remove");
      }
    };

    // Compute vibe stats from real bookings
    const activeBookings = bookings.filter(b => b.status === "ACTIVE");
    const total = activeBookings.length || 1; // avoid div by zero
    const highEnergy = activeBookings.filter(b => b.event?.energyLevel >= 8).length;
    const chill      = activeBookings.filter(b => b.event?.energyLevel <= 3).length;
    const balanced   = total - highEnergy - chill;
    const highPct    = Math.round((highEnergy / total) * 100);
    const chillPct   = Math.round((chill      / total) * 100);
    const balancedPct = Math.round((balanced   / total) * 100);
    const dominantLabel = highPct >= chillPct && highPct >= balancedPct ? `${highPct}% High-Energy` :
                          chillPct >= highPct  && chillPct >= balancedPct ? `${chillPct}% Chill` :
                          `${balancedPct}% Balanced`;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="space-y-8"
        >
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-end">
                    <h2 className="text-3xl font-display font-bold">Your Dashboard</h2>
                    <p className="text-text-secondary text-sm italic opacity-60">System Status: Connected</p>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-4 p-1 bg-void rounded-2xl border border-white/5 w-fit">
                    <button 
                        onClick={() => setActiveTab("bookings")} 
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'bookings' ? 'bg-energy-pink text-white' : 'text-text-secondary hover:text-white'}`}
                    >
                        <Ticket size={16} /> My Bookings
                    </button>
                    <button 
                        onClick={() => setActiveTab("wishlist")} 
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'wishlist' ? 'bg-chill-blue text-white' : 'text-text-secondary hover:text-white'}`}
                    >
                        <Heart size={16} /> Wishlist
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {[1, 2].map(i => (
                        <div key={i} className="min-w-[300px] h-48 bg-clay-surface rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : activeTab === "bookings" ? (
                bookings.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/20">
                        <p className="text-text-secondary">You haven't booked any tickets yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                        {bookings.map((booking) => {
                            const event = booking.event;
                            const dateObj = new Date(event.dateTime);
                            const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                            
                            return (
                                <ClayCard key={booking.id} className="border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-energy-pink shadow-[2px_0_10px_rgba(255,0,127,0.3)]" />
                                    <div className="pl-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{dateStr}</p>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-energy-pink/30 text-energy-pink bg-energy-pink/5">
                                                CONFIRMED
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold font-display mb-4 group-hover:text-energy-pink transition-colors truncate">{event.title}</h3>
                                        
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                <MapPin size={14} className="text-energy-pink" />
                                                {event.venue.name}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                <Ticket size={14} className="text-energy-pink" />
                                                1x Ticket
                                            </div>
                                        </div>
                                    </div>
                                </ClayCard>
                            );
                        })}
                    </div>
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {wishlist.length === 0 ? (
                        <div className="col-span-full p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/20">
                            <p className="text-text-secondary italic">Your wishlist is empty. Add events from the Discover page.</p>
                        </div>
                    ) : (
                        wishlist.map(event => (
                            <Link key={event.id} to={`/event/${event.id}`}>
                                <ClayCard className="p-4 border border-white/5 flex gap-4 group hover:border-chill-blue/30 transition-all">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0">
                                        <img src={getImageUrl(event.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-white truncate">{event.title}</h4>
                                            <button 
                                                onClick={(e) => handleRemoveWishlist(e, event.id)}
                                                className="p-1 hover:text-energy-pink transition-colors"
                                            >
                                                <Heart size={16} fill="currentColor" className="text-energy-pink" />
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-1">
                                            <MapPin size={12} className="text-chill-blue" />
                                            {event.venue?.name}
                                        </div>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-chill-blue font-bold text-sm">₹{event.price}</span>
                                            <span className="text-[10px] uppercase font-bold text-text-secondary tracking-widest">{new Date(event.dateTime).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </ClayCard>
                            </Link>
                        ))
                    )}
                </div>
            )}

            <AnimatePresence mode="wait">
                {activeTab === "bookings" && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }} 
                        animate={{ opacity: 1, height: "auto" }} 
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-8 border-t border-white/5"
                    >
                <h2 className="text-3xl font-display font-bold mb-8">Activity History</h2>
                <ClayCard className="p-8">
                    <div className="flex items-center justify-between mb-8 text-text-secondary">
                        <span className="flex items-center gap-2"><History size={20} /> Last 30 Days</span>
                        <span>{activeBookings.length > 0 ? dominantLabel : "No bookings yet"}</span>
                    </div>
                    
                    <div className="w-full h-8 bg-void rounded-full overflow-hidden flex shadow-inner">
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${highPct}%` }} 
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-energy-pink to-energy-orange relative"
                        >
                            <div className="absolute inset-0 bg-white/20 blur-[2px]" />
                        </motion.div>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${balancedPct}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
                            className="h-full bg-gradient-to-r from-yellow-400/50 to-orange-400/50 relative"
                        >
                            <div className="absolute inset-0 bg-white/10 blur-[2px]" />
                        </motion.div>
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${chillPct}%` }} 
                            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                            className="h-full bg-chill-blue opacity-50 relative"
                        >
                            <div className="absolute inset-0 bg-white/10 blur-[2px]" />
                        </motion.div>
                    </div>
                    
                    <div className="flex justify-between mt-4 text-xs font-bold uppercase tracking-widest text-text-secondary">
                        <span className="text-energy-pink drop-shadow-[0_0_8px_rgba(255,0,127,0.5)]">High Energy {highPct > 0 ? `${highPct}%` : ""}</span>
                        <span className="text-yellow-400">Balanced {balancedPct > 0 ? `${balancedPct}%` : ""}</span>
                        <span className="text-chill-blue">Chill {chillPct > 0 ? `${chillPct}%` : ""}</span>
                    </div>
                </ClayCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
