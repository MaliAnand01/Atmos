import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ClayCard from "../ClayCard";
import { Ticket, ClockClockwise, MapPin, User, ShieldCheck } from "@phosphor-icons/react";
import { api } from "../../services/api";
import { getUser, saveAuth } from "../../services/authStore";
import ClayButton from "../ClayButton";

export default function AttendeeView() {
    const [activeTab, setActiveTab] = useState("tickets");
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(getUser());
    
    // Profile Edit State
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [updateStatus, setUpdateStatus] = useState({ type: "", msg: "" });
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;
            try {
                const data = await api.get(`/bookings/user/${user.id}`, true);
                setBookings(data);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user?.id]);

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

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setUpdateStatus({ type: "", msg: "" });
        try {
            const updates = { username, email };
            if (password) updates.password = password;
            
            const updatedUser = await api.put(`/users/${user.id}`, updates, true);
            saveAuth(updatedUser);
            setUser(updatedUser);
            setUpdateStatus({ type: "success", msg: "Profile updated successfully!" });
            setPassword("");
        } catch (err) {
            setUpdateStatus({ type: "error", msg: err.message || "Failed to update profile." });
        } finally {
            setUpdating(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex gap-4 p-1 bg-void rounded-2xl border border-white/5 w-fit mb-8">
                <button 
                    onClick={() => setActiveTab("tickets")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'tickets' ? 'bg-energy-pink text-white shadow-[0_0_20px_rgba(255,0,127,0.3)]' : 'text-text-secondary hover:text-white'}`}
                >
                    <Ticket size={18} />
                    My Tickets
                </button>
                <button 
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-chill-blue text-white shadow-[0_0_20px_rgba(0,240,255,0.3)]' : 'text-text-secondary hover:text-white'}`}
                >
                    <User size={18} />
                    Profile
                </button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "tickets" ? (
                    <motion.div 
                        key="tickets"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-8"
                    >
                        <h2 className="text-3xl font-display font-bold">Your Frequencies</h2>
                        
                        {loading ? (
                            <div className="flex gap-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="min-w-[300px] h-48 bg-clay-surface rounded-3xl animate-pulse" />
                                ))}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center">
                                <p className="text-text-secondary">You haven't booked any frequencies yet.</p>
                            </div>
                        ) : (
                            <div className="flex gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar">
                                {bookings.map((booking) => {
                                    const event = booking.event;
                                    const dateObj = new Date(event.dateTime);
                                    const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
                                    
                                    return (
                                        <ClayCard key={booking.id} className="min-w-[300px] snap-center flex-shrink-0 border border-white/5 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1.5 h-full bg-energy-pink shadow-[2px_0_10px_rgba(255,0,127,0.3)]" />
                                            <div className="pl-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">{dateStr}</p>
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-energy-pink/30 text-energy-pink bg-energy-pink/5">
                                                        CONFIRMED
                                                    </span>
                                                </div>
                                                <h3 className="text-xl font-bold font-display mb-4 group-hover:text-energy-pink transition-colors">{event.title}</h3>
                                                
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                        <MapPin size={14} className="text-energy-pink" />
                                                        {event.venue.name}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                                                        <Ticket size={14} className="text-energy-pink" />
                                                        1x General Admission
                                                    </div>
                                                </div>
                                            </div>
                                        </ClayCard>
                                    );
                                })}
                            </div>
                        )}

                        <h2 className="text-3xl font-display font-bold mt-12">Vibe History</h2>
                        <ClayCard className="p-8">
                            <div className="flex items-center justify-between mb-8 text-text-secondary">
                                <span className="flex items-center gap-2"><ClockClockwise size={20} /> Last 30 Days</span>
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
                ) : (
                    <motion.div 
                        key="profile"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="max-w-2xl"
                    >
                        <h2 className="text-3xl font-display font-bold mb-8">Profile Management</h2>
                        
                        <ClayCard className="p-8 space-y-8">
                            {updateStatus.msg && (
                                <div className={`p-4 rounded-xl text-center text-sm font-medium ${updateStatus.type === 'success' ? 'bg-chill-blue/10 text-chill-blue border border-chill-blue/20' : 'bg-energy-pink/10 text-energy-pink border border-energy-pink/20'}`}>
                                    {updateStatus.msg}
                                </div>
                            )}

                            <form onSubmit={handleUpdateProfile} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 block group-focus-within:text-chill-blue transition-colors">Identification</label>
                                        <input 
                                            type="text" 
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            className="w-full bg-void border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-chill-blue transition-all"
                                            placeholder="Full Name"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 block group-focus-within:text-chill-blue transition-colors">Direct Frequency (Email)</label>
                                        <input 
                                            type="email" 
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-void border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-chill-blue transition-all"
                                            placeholder="Email Address"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-2 block group-focus-within:text-chill-blue transition-colors">New Security Key (Password)</label>
                                        <input 
                                            type="password" 
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full bg-void border border-white/5 rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-chill-blue transition-all"
                                            placeholder="Leave blank to keep current"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <ClayButton 
                                        type="submit" 
                                        disabled={updating}
                                        className="w-full md:w-fit px-8 py-3 bg-chill-blue text-void font-bold"
                                    >
                                        {updating ? "Updating..." : "Synchronize Profile"}
                                    </ClayButton>
                                </div>
                            </form>
                            
                            <div className="p-4 bg-void/50 rounded-xl border border-white/5 flex items-start gap-4">
                                <ShieldCheck size={24} className="text-chill-blue flex-shrink-0" />
                                <p className="text-xs text-text-secondary leading-relaxed">
                                    Your account is secured with RBAC (Role-Based Access Control). 
                                    Synchronizing your profile will update your identity across the Atmos network instantly.
                                </p>
                            </div>
                        </ClayCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
