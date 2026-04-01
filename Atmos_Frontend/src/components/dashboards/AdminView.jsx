import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import ClayCard from "../ClayCard";
import { Users, Calendar, Map, ShieldCheck, Trash2, Plus, Pencil } from "lucide-react";
import { api } from "../../services/api";
import { getUser } from "../../services/authStore";
import ClayButton from "../ClayButton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const venueSchema = z.object({
    name: z.string().min(2, "Venue name must be at least 2 characters"),
    address: z.string().min(5, "Address must be at least 5 characters"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

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
    const [editingVenueId, setEditingVenueId] = useState(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(venueSchema),
        defaultValues: {
            name: "",
            address: "",
            capacity: 500,
            imageUrl: "",
        }
    });

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

    const onVenueSubmit = async (data) => {
        try {
            const method = editingVenueId ? 'put' : 'post';
            const endpoint = editingVenueId ? `/venues/${editingVenueId}` : '/venues';
            const result = await api[method](endpoint, data);
            
            if (editingVenueId) {
                setVenuesList(list => list.map(v => v.id === editingVenueId ? result : v));
                setEditingVenueId(null);
            } else {
                setVenuesList([...venuesList, result]);
                setStats(s => ({ ...s, venues: s.venues + 1 }));
            }
            
            setShowVenueForm(false);
            reset({ name: "", address: "", capacity: 500, imageUrl: "" });
            toast.success(editingVenueId ? "Venue updated!" : "New venue created!");
        } catch (err) { toast.error(err.message); }
    };

    const handleEditVenue = (venue) => {
        setEditingVenueId(venue.id);
        reset({
            name: venue.name,
            address: venue.address,
            capacity: venue.capacity,
            imageUrl: venue.imageUrl
        });
        setShowVenueForm(true);
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-energy-pink/10 rounded-2xl text-energy-pink">
                        <ShieldCheck size={32} />
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
                    { icon: <Users size={32} />, label: "Total Users", val: stats.users, color: "text-chill-blue" },
                    { icon: <Calendar size={32} />, label: "Total Events", val: stats.events, color: "text-energy-pink" },
                    { icon: <Map size={32} />, label: "Total Venues", val: stats.venues, color: "text-white" }
                ].map((stat, i) => (
                    <ClayCard key={i} className="flex flex-col items-center justify-center p-8 text-center shadow-clay border border-white/5 bg-void/20">
                        <div className={`mb-4 ${stat.color} drop-shadow-[0_0_8px_currentColor]`}>{stat.icon}</div>
                        <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">{stat.label}</p>
                        <p className="text-4xl font-bold font-display mt-2">{loading ? "..." : stat.val}</p>
                    </ClayCard>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 p-1 bg-void rounded-2xl border border-white/5 w-full overflow-x-auto scrollbar-hide flex-nowrap shrink-0 max-w-full">
                <ClayButton onClick={() => setActiveTab("directory")} variant={activeTab === 'directory' ? 'accent' : 'ghost'} className="px-6 py-2 rounded-xl text-xs whitespace-nowrap">Users</ClayButton>
                <ClayButton onClick={() => setActiveTab("pending")} variant={activeTab === 'pending' ? 'danger' : 'ghost'} className={`px-6 py-2 rounded-xl text-xs whitespace-nowrap ${activeTab === 'pending' ? '!bg-energy-orange' : ''}`}>Pending Organizers</ClayButton>
                <ClayButton onClick={() => setActiveTab("events")} variant={activeTab === 'events' ? 'danger' : 'ghost'} className="px-6 py-2 rounded-xl text-xs whitespace-nowrap">Events</ClayButton>
                <ClayButton onClick={() => setActiveTab("venues")} variant={activeTab === 'venues' ? 'primary' : 'ghost'} className={`px-6 py-2 rounded-xl text-xs whitespace-nowrap ${activeTab === 'venues' ? 'bg-white text-void' : ''}`}>Venues</ClayButton>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {usersList.filter(u => u.organizerStatus === 'PENDING').length === 0 ? (
                                <p className="text-text-secondary text-sm italic col-span-full py-12 text-center">No organizer applications awaiting verification.</p>
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
                                                        className="px-6 py-2 border-energy-pink/30 text-energy-pink text-xs hover:bg-energy-pink/10"
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
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold font-display">Manage Venues</h3>
                            <ClayButton onClick={() => { setShowVenueForm(!showVenueForm); if(showVenueForm) { setEditingVenueId(null); reset({ name: "", address: "", capacity: 500, imageUrl: "" }); } }} variant={showVenueForm ? "secondary" : "primary"} className="px-4 py-2 text-xs">
                                {showVenueForm ? "Cancel" : "Add New Venue"}
                            </ClayButton>
                        </div>

                        {showVenueForm && (
                            <ClayCard className="p-6 border-chill-blue/30 bg-chill-blue/5">
                                <form onSubmit={handleSubmit(onVenueSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <input {...register("name")} placeholder="Venue Name" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" />
                                        {errors.name && <p className="text-energy-pink text-[10px] ml-1">{errors.name.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <input {...register("address")} placeholder="Address (e.g. Bandra, Mumbai)" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" />
                                        {errors.address && <p className="text-energy-pink text-[10px] ml-1">{errors.address.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <input {...register("capacity")} type="number" placeholder="Seating Capacity" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" />
                                        {errors.capacity && <p className="text-energy-pink text-[10px] ml-1">{errors.capacity.message}</p>}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <input {...register("imageUrl")} placeholder="Image URL" className="bg-void border border-white/10 rounded-xl px-4 py-2 text-sm focus:border-chill-blue outline-none" />
                                        {errors.imageUrl && <p className="text-energy-pink text-[10px] ml-1">{errors.imageUrl.message}</p>}
                                    </div>
                                    <div className="md:col-span-2">
                                        <ClayButton type="submit" disabled={isSubmitting} className="w-full bg-chill-blue text-void font-bold">
                                            {isSubmitting ? "Processing..." : editingVenueId ? "Save Changes" : "Add Venue"}
                                        </ClayButton>
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
                                        <div className="absolute top-2 right-2 flex gap-2 md:opacity-0 group-hover:opacity-100 transition-all">
                                            <ClayButton variant="icon" onClick={() => handleEditVenue(venue)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white/20 backdrop-blur-md border border-white/10"><Pencil size={16} /></ClayButton>
                                            <ClayButton variant="icon" onClick={() => handleDeleteVenue(venue.id)} className="p-2 bg-energy-pink/20 text-energy-pink rounded-lg hover:bg-energy-pink hover:text-white backdrop-blur-md border border-energy-pink/10"><Trash2 size={16} /></ClayButton>
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
                                       <ClayButton variant="icon" onClick={() => handleDeleteEvent(event.id)} className="w-8 h-8 rounded-full bg-void flex items-center justify-center text-text-secondary/50 border border-white/5 hover:bg-energy-pink/20 hover:text-energy-pink transition-all"><Trash2 size={14} /></ClayButton>
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
