import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import ClayCard from "../ClayCard";
import { Users, Calendar, Map, ShieldCheck, Trash2, Plus, Pencil, Activity, Compass, MapPin } from "lucide-react";
import { api } from "../../services/api";
import { getUser } from "../../services/authStore";
import ClayButton from "../ClayButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import AnalyticsCharts from "./AnalyticsCharts";
import VenueFormModal from "./VenueFormModal";

export default function AdminView({ activeTab, setActiveTab }) {
    const [stats, setStats] = useState({ users: 0, events: 0, venues: 0 });
    const [usersList, setUsersList] = useState([]);
    const [eventsList, setEventsList] = useState([]);
    const [venuesList, setVenuesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = useMemo(() => getUser(), []);

    const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
    const [selectedVenue, setSelectedVenue] = useState(null);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const [users, events, venues] = await Promise.all([
                api.get("/users", true),
                api.get("/events", true),
                api.get("/venues", true)
            ]);
            
            setUsersList(users);
            setEventsList(events);
            setVenuesList(venues);
            setStats({
                users: users.length,
                events: events.length,
                venues: venues.length
            });
        } catch (err) {
            console.error("Failed to fetch admin data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsersList(list => list.filter(u => u.id !== id));
            setStats(s => ({ ...s, users: s.users - 1 }));
            toast.success("User deleted successfully.");
        } catch (err) { toast.error(err.message); }
    };

    const handleVenueSuccess = () => {
        fetchAllData();
    };

    const handleDeleteVenue = async (id) => {
        if (!window.confirm("Delete this venue?")) return;
        try {
            await api.delete(`/venues/${id}`);
            setVenuesList(list => list.filter(v => v.id !== id));
            setStats(s => ({ ...s, venues: s.venues - 1 }));
            toast.success("Venue deleted.");
        } catch (err) { toast.error(err.message); }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Delete this event?")) return;
        try {
            await api.delete(`/events/${id}`);
            setEventsList(list => list.filter(e => e.id !== id));
            setStats(s => ({ ...s, events: s.events - 1 }));
            toast.success("Event removed from system.");
        } catch (err) { toast.error(err.message); }
    };

    const handleApproveOrganizer = async (id) => {
        try {
            await api.put(`/users/${id}`, { organizerStatus: "APPROVED" });
            setUsersList(list => list.map(u => u.id === id ? { ...u, organizerStatus: "APPROVED" } : u));
            toast.success("Organizer application approved!");
        } catch (err) { toast.error(err.message); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">            
            <AnimatePresence mode="popLayout">
                {activeTab === "overview" && (
                    <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        {/* Stats Widgets */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { icon: <Users size={32} />, label: "Total Users", val: stats.users, color: "text-chill-blue", trend: "+12% this week" },
                                { icon: <Calendar size={32} />, label: "Total Events", val: stats.events, color: "text-energy-pink", trend: "+5 new today" },
                                { icon: <Map size={32} />, label: "Total Venues", val: stats.venues, color: "text-white", trend: "All operational" }
                            ].map((stat, i) => (
                                <ClayCard key={i} className="flex flex-col p-6 shadow-clay border border-white/5 bg-void/20 relative overflow-hidden group">
                                    <div className={`absolute -right-6 -top-6 opacity-5 group-hover:opacity-10 transition-opacity transform group-hover:scale-110 duration-500 scale-150 ${stat.color}`}>{stat.icon}</div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className={`p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 ${stat.color} drop-shadow-[0_0_8px_currentColor]`}>{stat.icon}</div>
                                        <span className="text-[10px] bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded-md font-bold uppercase tracking-widest">{stat.trend}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest relative z-10">{stat.label}</p>
                                    <p className="text-4xl font-bold font-display mt-1 relative z-10">{loading ? "..." : stat.val}</p>
                                </ClayCard>
                            ))}
                        </div>

                        {/* Recent Activity & Pending Actions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <ClayCard className="p-6 border border-white/5 bg-clay-surface h-[300px] flex flex-col relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-energy-orange/5 blur-3xl rounded-full pointer-events-none" />
                                <h3 className="font-display font-bold text-lg mb-4 flex items-center justify-between relative z-10">
                                    Pending Organizers
                                    <span className="text-xs font-bold bg-energy-orange/10 text-energy-orange px-2 py-1 rounded border border-energy-orange/30">
                                        {usersList.filter(u => u.organizerStatus === 'PENDING').length} Action Required
                                    </span>
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent relative z-10">
                                    {usersList.filter(u => u.organizerStatus === 'PENDING').length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-full text-center text-text-secondary opacity-50">
                                            <ShieldCheck size={32} className="mb-2" />
                                            <p className="text-sm">No pending approvals.</p>
                                        </div>
                                    ) : (
                                        usersList.filter(u => u.organizerStatus === 'PENDING').slice(0, 2).map(user => (
                                            <div key={user.id} className="flex items-center justify-between p-3 rounded-xl bg-void border border-white/5 hover:border-white/10 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-energy-orange/20 text-energy-orange flex items-center justify-center font-bold text-xs">{user.username.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <p className="text-sm font-bold">{user.organizationName || user.username}</p>
                                                        <p className="text-[10px] text-text-secondary">{user.email}</p>
                                                    </div>
                                                </div>
                                                <ClayButton onClick={() => setActiveTab('pending')} variant="ghost" className="text-xs px-3 py-1 scale-90 text-chill-blue hover:bg-chill-blue/10">Review</ClayButton>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <ClayButton onClick={() => setActiveTab('pending')} variant="ghost" className="w-full mt-4 text-xs tracking-widest text-text-secondary hover:text-white uppercase font-bold relative z-10">View All Requests</ClayButton>
                            </ClayCard>

                            <ClayCard className="p-6 border border-white/5 bg-clay-surface h-[300px] flex flex-col relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-32 h-32 bg-chill-blue/5 blur-3xl rounded-full pointer-events-none" />
                                <h3 className="font-display font-bold text-lg mb-4 relative z-10">Quick Actions</h3>
                                <div className="grid grid-cols-2 gap-4 flex-1 relative z-10">
                                    <button onClick={() => setActiveTab("venues")} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-void border border-white/5 hover:border-chill-blue/30 transition-all group">
                                        <div className="p-3 bg-chill-blue/10 rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(0,240,255,0.1)]"><Map size={24} className="text-chill-blue" /></div>
                                        <span className="text-sm font-bold tracking-wide text-text-secondary group-hover:text-white transition-colors">Add Venue</span>
                                    </button>
                                    <button onClick={() => setActiveTab("analytics")} className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-void border border-white/5 hover:border-energy-pink/30 transition-all group">
                                        <div className="p-3 bg-energy-pink/10 rounded-xl group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,0,127,0.1)]"><Activity size={24} className="text-energy-pink" /></div>
                                        <span className="text-sm font-bold tracking-wide text-text-secondary group-hover:text-white transition-colors">View Reports</span>
                                    </button>
                                </div>
                            </ClayCard>
                        </div>
                    </motion.div>
                )}

                {activeTab === "analytics" && (
                    <motion.div key="ana" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <AnalyticsCharts />
                    </motion.div>
                )}

                {activeTab === "directory" && (
                    <motion.div key="dir" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Users size={18} className="text-chill-blue" />
                            <h3 className="font-display font-bold text-xl">User Directory</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {usersList.map(user => (
                                <ClayCard key={user.id} className="p-4 border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-clay ${user.role === 'ROLE_ADMIN' ? 'bg-energy-pink text-white' : 'bg-void text-text-secondary border border-white/10'}`}>{user.username.charAt(0).toUpperCase()}</div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-sm tracking-wide">{user.username}</p>
                                                {user.organizerStatus === 'PENDING' && (
                                                    <span className="w-2 h-2 rounded-full bg-energy-orange animate-pulse" title="Pending Approval" />
                                                )}
                                            </div>
                                            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">{user.role.replace('ROLE_', '')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {user.organizerStatus === 'PENDING' && (
                                            <ClayButton variant="icon" onClick={() => handleApproveOrganizer(user.id)} className="p-2 text-chill-blue hover:scale-110 transition-transform bg-transparent border-none" title="Approve"><ShieldCheck size={18} /></ClayButton>
                                        )}
                                        {user.id !== currentUser?.id && (
                                            <ClayButton variant="icon" onClick={() => handleDeleteUser(user.id)} className="p-2 text-text-secondary hover:text-energy-pink md:opacity-0 group-hover:opacity-100 transition-all bg-transparent border-none"><Trash2 size={18} /></ClayButton>
                                        )}
                                    </div>
                                </ClayCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "pending" && (
                    <motion.div key="pending" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                         <div className="flex items-center gap-2 mb-4">
                            <ShieldCheck size={18} className="text-energy-orange" />
                            <h3 className="font-display font-bold text-xl">Pending Organizers</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {usersList.filter(u => u.organizerStatus === 'PENDING').length === 0 ? (
                                <p className="text-text-secondary text-sm italic col-span-full py-12 text-center bg-void rounded-2xl border border-dashed border-white/5">No organizer applications awaiting verification.</p>
                            ) : (
                                usersList.filter(u => u.organizerStatus === 'PENDING').map(user => (
                                    <ClayCard key={user.id} className="p-6 border border-energy-orange/20 bg-energy-orange/5 relative overflow-hidden group">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-lg font-bold font-display">{user.organizationName || user.username}</h4>
                                                    <p className="text-xs text-text-secondary font-medium tracking-wide">ORGANIZER APPLICATION</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] font-bold uppercase tracking-widest text-text-secondary">
                                                    <div>
                                                        <span className="opacity-50 block mb-1">PHONE</span>
                                                        <span className="text-white">{user.phone || 'NOT PROVIDED'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="opacity-50 block mb-1">TAX ID / PAN</span>
                                                        <span className="text-white">{user.panGstin || 'NOT PROVIDED'}</span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="opacity-50 block mb-1">EMAIL</span>
                                                        <span className="text-white">{user.email}</span>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3 pt-2">
                                                    <ClayButton 
                                                        variant="accent"
                                                        onClick={() => handleApproveOrganizer(user.id)}
                                                        className="px-6 py-2 text-xs hover:shadow-[0_0_20_rgba(0,184,212,0.4)]"
                                                    >
                                                        APPROVE
                                                    </ClayButton>
                                                    <ClayButton 
                                                        variant="secondary"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                        className="px-6 py-2 border border-energy-pink/30 text-energy-pink text-xs hover:bg-energy-pink/10"
                                                    >
                                                        REJECT
                                                    </ClayButton>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-energy-orange/10 rounded-3xl text-energy-orange">
                                                <Users size={32} />
                                            </div>
                                        </div>
                                    </ClayCard>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === "venues" && (
                    <motion.div key="ven" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="flex justify-between items-center bg-clay-surface p-4 border border-white/5 rounded-2xl">
                            <div className="flex items-center gap-2">
                                 <Compass size={18} className="text-white" />
                                 <h3 className="text-lg font-bold font-display">Manage Venues</h3>
                            </div>
                            <ClayButton onClick={() => { setSelectedVenue(null); setIsVenueModalOpen(true); }} variant="accent" className="px-4 py-2 text-xs shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                                Add New Venue
                            </ClayButton>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {venuesList.map(venue => (
                                <ClayCard key={venue.id} className="p-0 border border-white/5 group overflow-hidden">
                                    <div className="h-40 relative">
                                        <img src={venue.imageUrl || "https://images.unsplash.com/photo-1514525253361-bee8a48790c3?auto=format&fit=crop&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={venue.name} />
                                        <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <h4 className="text-lg font-bold text-white font-display mb-1">{venue.name}</h4>
                                            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-1">
                                                <MapPin size={10} className="text-chill-blue" />
                                                {venue.address}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between bg-white/5">
                                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                                            <Users size={14} className="text-chill-blue" />
                                            <span className="font-bold">{venue.capacity} Capacity</span>
                                        </div>
                                        <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setSelectedVenue(venue); setIsVenueModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors"><Pencil size={14} /></button>
                                            <button onClick={() => handleDeleteVenue(venue.id)} className="p-2 bg-white/5 rounded-lg text-text-secondary hover:text-energy-pink hover:bg-energy-pink/10 transition-colors"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </ClayCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "events" && (
                    <motion.div key="evt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                         <div className="flex items-center gap-2 mb-4">
                            <Calendar size={18} className="text-energy-pink" />
                            <h3 className="font-display font-bold text-xl">All Platform Events</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {eventsList.length === 0 ? <p className="text-sm text-text-secondary p-8 bg-void border border-white/5 rounded-2xl text-center">No active events.</p> : eventsList.map(event => (
                                <ClayCard key={event.id} className="p-5 border border-white/5 flex items-center justify-between group hover:border-energy-pink/30 transition-colors">
                                    <div>
                                        <h4 className="font-bold text-sm tracking-wide">{event.title}</h4>
                                        <p className="text-[10px] text-text-secondary uppercase font-bold mt-1">Energy: {event.energyLevel} | By: {event.organizerId || 'Atmos'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                       <ClayButton variant="icon" onClick={() => handleDeleteEvent(event.id)} className="w-8 h-8 rounded-full bg-void flex items-center justify-center text-text-secondary/50 border border-white/5 hover:bg-energy-pink/20 hover:text-energy-pink transition-all opacity-0 group-hover:opacity-100"><Trash2 size={14} /></ClayButton>
                                    </div>
                                </ClayCard>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <VenueFormModal 
                isOpen={isVenueModalOpen}
                onClose={() => setIsVenueModalOpen(false)}
                onSuccess={handleVenueSuccess}
                initialData={selectedVenue}
            />
        </motion.div>
    );
}
