import { useState, useEffect, useMemo } from "react";
import ClayCard from "../ClayCard";
import ClayButton from "../ClayButton";
import { Ticket, History, MapPin, Heart, Users } from "lucide-react";
import { api, getImageUrl } from "../../services/api";
import { getUser } from "../../services/authStore";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendeeView({ activeTab, setActiveTab }) {
    const user = useMemo(() => getUser(), []);
    const [bookings, setBookings] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    const activeBookings = useMemo(() => bookings.filter(b => b.status === "ACTIVE"), [bookings]);
    
    const sortedBookings = useMemo(() => {
        return bookings
            .filter(b => b.status !== "PENDING" && b.status !== "FAILED")
            .sort((a, b) => {
                if (a.status === "ACTIVE" && b.status !== "ACTIVE") return -1;
                if (a.status !== "ACTIVE" && b.status === "ACTIVE") return 1;
                return new Date(b.bookingTime || 0).getTime() - new Date(a.bookingTime || 0).getTime();
            });
    }, [bookings]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);
  
    const handleRemoveWishlist = async (e, eventId) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        await api.post(`/wishlist/${user.id}/${eventId}`);
        setWishlist(prev => prev.filter(item => item.id !== eventId));
        toast.success("Removed from wishlist");
      } catch {
        toast.error("Failed to remove");
      }
    };

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
            <AnimatePresence mode="popLayout">
                {activeTab === "overview" && (
                     <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ClayCard className="flex flex-col items-center justify-center p-8 text-center shadow-clay border border-white/5 bg-void/20">
                                <div className="mb-4 text-energy-pink drop-shadow-[0_0_8px_currentColor]"><Ticket size={32} /></div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Active Passes</p>
                                <p className="text-4xl font-bold font-display mt-2">{loading ? "..." : activeBookings.length}</p>
                            </ClayCard>
                            <ClayCard className="flex flex-col items-center justify-center p-8 text-center shadow-clay border border-white/5 bg-void/20">
                                <div className="mb-4 text-chill-blue drop-shadow-[0_0_8px_currentColor]"><Heart size={32} /></div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Wishlist Items</p>
                                <p className="text-4xl font-bold font-display mt-2">{loading ? "..." : wishlist.length}</p>
                            </ClayCard>
                        </div>

                        <div className="pt-8 border-t border-white/5">
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
                        </div>
                    </motion.div>
                )}

                {activeTab === "bookings" && (
                    <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Ticket size={18} className="text-energy-pink" />
                            <h3 className="font-display font-bold text-xl">My Tickets</h3>
                        </div>
                        {loading ? (
                            <div className="flex gap-4 overflow-x-auto pb-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="min-w-[300px] h-48 bg-clay-surface rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/20">
                                <p className="text-text-secondary">You haven't booked any tickets yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
                                {sortedBookings.map((booking) => {
                                    const event = booking.event;
                                    const dateObj = new Date(event.dateTime);
                                    const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                    const isCancelled = booking.status === "CANCELLED";
                                    
                                    return (
                                        <ClayCard key={booking.id} className={`border border-white/5 relative overflow-hidden group transition-opacity ${isCancelled ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                                            <div className={`absolute top-0 left-0 w-1.5 h-full ${isCancelled ? 'bg-text-secondary/30' : 'bg-energy-pink shadow-[2px_0_10px_rgba(255,0,127,0.3)]'}`} />
                                            <div className="pl-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{dateStr}</p>
                                                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                                                        isCancelled 
                                                            ? 'border-white/10 text-text-secondary bg-white/5' 
                                                            : 'border-energy-pink/30 text-energy-pink bg-energy-pink/5'
                                                    }`}>
                                                        {booking.status || "CONFIRMED"}
                                                    </span>
                                                </div>
                                                <h3 className={`text-xl font-bold font-display mb-4 transition-colors truncate ${isCancelled ? 'text-text-secondary' : 'group-hover:text-energy-pink'}`}>{event.title}</h3>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                        <MapPin size={14} className={isCancelled ? "text-text-secondary/50" : "text-energy-pink"} />
                                                        {event.venue.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                        <Ticket size={14} className={isCancelled ? "text-text-secondary/50" : "text-energy-pink"} />
                                                        {booking.quantity || 1}x Ticket
                                                    </div>
                                                </div>
                                            </div>
                                        </ClayCard>
                                    );
                                })}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "wishlist" && (
                    <motion.div key="wishlist" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Heart size={18} className="text-chill-blue" />
                            <h3 className="font-display font-bold text-xl">Saved Events</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {loading ? (
                                <p className="text-text-secondary text-sm">Loading...</p>
                            ) : wishlist.length === 0 ? (
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
                                                    <ClayButton 
                                                        variant="icon"
                                                        onClick={(e) => handleRemoveWishlist(e, event.id)}
                                                        className="hover:text-energy-pink p-1 bg-white/5 rounded-full"
                                                    >
                                                        <Heart size={16} fill="currentColor" className="text-energy-pink" />
                                                    </ClayButton>
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
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
