import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ClayCard from "../ClayCard";
import { Users, Calendar, MapTrifold, ShieldCheck, Trash, Plus, Pencil } from "@phosphor-icons/react";
import { api } from "../../services/api";
import { getUser } from "../../services/authStore";
import ClayButton from "../ClayButton";

export default function AdminView() {
    const [activeTab, setActiveTab] = useState("directory");
    const [stats, setStats] = useState({ users: 0, events: 0, venues: 0 });
    const [usersList, setUsersList] = useState([]);
    const [eventsList, setEventsList] = useState([]);
    const [venuesList, setVenuesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = getUser();

    // Venue Form State
    const [showVenueForm, setShowVenueForm] = useState(false);
    const [newVenue, setNewVenue] = useState({ name: "", address: "", capacity: 500, imageUrl: "" });
    const [editingVenueId, setEditingVenueId] = useState(null);

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
        if (!window.confirm("Banish this user from the protocol?")) return;
        try {
            await api.delete(`/users/${id}`);
            setUsersList(list => list.filter(u => u.id !== id));
            setStats(s => ({ ...s, users: s.users - 1 }));
        } catch (err) { alert(err.message); }
    };

    const handleAddVenue = async (e) => {
        e.preventDefault();
        try {
            const method = editingVenueId ? 'put' : 'post';
            const endpoint = editingVenueId ? `/venues/${editingVenueId}` : '/venues';
            const result = await api[method](endpoint, newVenue);
            
            if (editingVenueId) {
                setVenuesList(list => list.map(v => v.id === editingVenueId ? result : v));
                setEditingVenueId(null);
            } else {
                setVenuesList([...venuesList, result]);
                setStats(s => ({ ...s, venues: s.venues + 1 }));
            }
            
            setShowVenueForm(false);
            setNewVenue({ name: "", address: "", capacity: 500, imageUrl: "" });
        } catch (err) { alert(err.message); }
    };

    const handleEditVenue = (venue) => {
        setEditingVenueId(venue.id);
        setNewVenue({
            name: venue.name,
            address: venue.address,
            capacity: venue.capacity,
            imageUrl: venue.imageUrl
        });
        setShowVenueForm(true);
    };

    const handleDeleteVenue = async (id) => {
        if (!window.confirm("Remove this structural location?")) return;
        try {
            await api.delete(`/venues/${id}`);
            setVenuesList(list => list.filter(v => v.id !== id));
            setStats(s => ({ ...s, venues: s.venues - 1 }));
        } catch (err) { alert(err.message); }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Permanently remove this event from the protocol?")) return;
        try {
            await api.delete(`/events/${id}`);
            setEventsList(list => list.filter(e => e.id !== id));
            setStats(s => ({ ...s, events: s.events - 1 }));
        } catch (err) { alert(err.message); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-energy-pink/10 rounded-2xl text-energy-pink">
                        <ShieldCheck size={32} weight="fill" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-display font-bold">Admin Panel</h2>
                        <p className="text-text-secondary text-sm">Full access to all data</p>
                    </div>
                </div>
            </div>
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: <Users size={32} weight="duotone" />, label: "Total Users", val: stats.users, color: "text-chill-blue" },
                    { icon: <Calendar size={32} weight="duotone" />, label: "Total Events", val: stats.events, color: "text-energy-pink" },
                    { icon: <MapTrifold size={32} weight="duotone" />, label: "Total Venues", val: stats.venues, color: "text-white" }
                ].map((stat, i) => (
                    <ClayCard key={i} className="flex flex-col items-center justify-center p-8 text-center shadow-clay border border-white/5 bg-void/20">
                        <div className={`mb-4 ${stat.color} drop-shadow-[0_0_8px_currentColor]`}>{stat.icon}</div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</p>
                        <p className="text-4xl font-bold font-display mt-2">{loading ? "..." : stat.val}</p>
                    </ClayCard>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 p-1 bg-void rounded-2xl border border-white/5 w-fit">
                <button onClick={() => setActiveTab("directory")} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'directory' ? 'bg-chill-blue text-void' : 'text-text-secondary hover:text-white'}`}>Users</button>
                <button onClick={() => setActiveTab("events")} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'events' ? 'bg-energy-pink text-white' : 'text-text-secondary hover:text-white'}`}>Events</button>
                <button onClick={() => setActiveTab("venues")} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'venues' ? 'bg-white text-void' : 'text-text-secondary hover:text-white'}`}>Venues</button>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "directory" && (
                    <motion.div key="dir" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {usersList.map(user => (
                                <ClayCard key={user.id} className="p-4 border border-white/5 flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${user.role === 'ROLE_ADMIN' ? 'bg-energy-pink text-white' : 'bg-void text-text-secondary border border-white/10'}`}>{user.username.charAt(0)}</div>
                                        <div>
                                            <p className="font-bold text-sm tracking-wide">{user.username}</p>
                                            <p className="text-[10px] text-text-secondary uppercase font-bold tracking-tighter">{user.role.replace('ROLE_', '')}</p>
                                        </div>
                                    </div>
                                    {user.id !== currentUser?.id && (
                                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-text-secondary hover:text-energy-pink opacity-0 group-hover:opacity-100 transition-all"><Trash size={18} /></button>
                                    )}
                                </ClayCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "venues" && (
                    <motion.div key="ven" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold font-display">Manage Venues</h3>
                            <ClayButton onClick={() => { setShowVenueForm(!showVenueForm); if(showVenueForm) setEditingVenueId(null); }} variant={showVenueForm ? "secondary" : "primary"} className="px-4 py-2 text-xs">
                                {showVenueForm ? "Cancel" : "Add New Venue"}
                            </ClayButton>
                        </div>

                        {showVenueForm && (
                            <ClayCard className="p-6 border-chill-blue/30 bg-chill-blue/5">
                                <form onSubmit={handleAddVenue} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input value={newVenue.name} onChange={e => setNewVenue({...newVenue, name: e.target.value})} placeholder="Venue Name" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" required />
                                    <input value={newVenue.address} onChange={e => setNewVenue({...newVenue, address: e.target.value})} placeholder="Address (e.g. Bandra, Mumbai)" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" required />
                                    <input type="number" value={newVenue.capacity} onChange={e => setNewVenue({...newVenue, capacity: e.target.value})} placeholder="Seating Capacity" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" required />
                                    <input value={newVenue.imageUrl} onChange={e => setNewVenue({...newVenue, imageUrl: e.target.value})} placeholder="Image URL" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" />
                                    <div className="md:col-span-2">
                                        <ClayButton type="submit" className="w-full bg-chill-blue text-void font-bold">{editingVenueId ? "Save Changes" : "Add Venue"}</ClayButton>
                                    </div>
                                </form>
                            </ClayCard>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {venuesList.map(venue => (
                                <ClayCard key={venue.id} className="p-0 overflow-hidden group hover:border-chill-blue/30 transition-all">
                                    <div className="h-32 bg-void relative">
                                        {venue.imageUrl && <img src={venue.imageUrl} className="w-full h-full object-cover opacity-60" />}
                                        <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
                                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => handleEditVenue(venue)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"><Pencil size={16} /></button>
                                            <button onClick={() => handleDeleteVenue(venue.id)} className="p-2 bg-energy-pink/20 text-energy-pink rounded-lg hover:bg-energy-pink hover:text-white transition-all"><Trash size={16} /></button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-sm">{venue.name}</h4>
                                        <p className="text-[10px] text-text-secondary uppercase mt-1 line-clamp-1">{venue.address}</p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-chill-blue">CAPACITY {venue.capacity}</span>
                                        </div>
                                    </div>
                                </ClayCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {activeTab === "events" && (
                    <motion.div key="evt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {eventsList.map(event => (
                                <ClayCard key={event.id} className="p-5 border border-white/5 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-sm tracking-wide">{event.title}</h4>
                                        <p className="text-[10px] text-text-secondary uppercase font-bold mt-1">Energy Level: {event.energyLevel} | By: {event.organizerId || 'Atmos'}</p>
                                    </div>
                                    <div className="flex gap-2">
                                       <button onClick={() => handleDeleteEvent(event.id)} className="w-8 h-8 rounded-full bg-void flex items-center justify-center text-text-secondary/50 border border-white/5 hover:bg-energy-pink/20 hover:text-energy-pink transition-all"><Trash size={14} /></button>
                                    </div>
                                </ClayCard>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
