import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { 
    Check, 
    Plus, 
    MapPin, 
    BarChart3, 
    Pencil, 
    Trash2,
    Calendar,
    Users,
    ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";
import ClayCard from "../ClayCard";
import ClayButton from "../ClayButton";
import { api, getImageUrl } from "../../services/api";
import { getUser } from "../../services/authStore";
import AnalyticsCharts from "./AnalyticsCharts";
import EventFormModal from "./EventFormModal";

export default function OrganizerView({ activeTab, setActiveTab }) {
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [myEvents, setMyEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const user = useMemo(() => getUser(), []);

    useEffect(() => {
        if (user?.id) {
            fetchMyEvents();
            fetchVenues();
            fetchBookings();
        }
    }, [user?.id]);

    const fetchBookings = async () => {
        if (!user) return;
        setBookingsLoading(true);
        try {
            const data = await api.get(`/bookings/organizer/${user.id}`, true);
            setBookings(data.filter(b => b.status === "ACTIVE"));
        } catch (err) {
            console.error("Failed to fetch organizer bookings:", err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchMyEvents = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await api.get(`/events/organizer/${user.id}`, true);
            setMyEvents(data);
        } catch (err) {
            console.error("Failed to fetch organizer events:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchVenues = async () => {
        try {
            const data = await api.get('/venues');
            setVenues(data);
        } catch (err) {
            console.error("Failed to fetch venues:", err);
        }
    };

    const handleEventSuccess = () => {
        fetchMyEvents();
        fetchBookings();
    };

    const handleEdit = (event) => {
        setSelectedEvent(event);
        setIsEventModalOpen(true);
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event? This will also cancel all bookings.")) return;
        try {
            await api.delete(`/events/${id}`);
            fetchMyEvents();
            toast.success("Event deleted successfully.");
        } catch (err) {
            console.error("Failed to delete event:", err);
            toast.error("Failed to delete event.");
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <AnimatePresence mode="popLayout">
                {activeTab === "overview" && (
                    <motion.div key="over" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ClayCard className="p-6 border border-white/5 bg-void/20 flex flex-col justify-center items-center text-center">
                                <div className="p-3 bg-chill-blue/10 rounded-2xl text-chill-blue mb-4 shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                                    <BarChart3 size={32} />
                                </div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Total Active Events</p>
                                <h4 className="text-4xl font-bold font-display mt-2">{myEvents.length}</h4>
                            </ClayCard>

                            <ClayCard className="p-6 border border-white/5 bg-void/20 flex flex-col justify-center items-center text-center">
                                <div className="p-3 bg-orange-400/10 rounded-2xl text-orange-400 mb-4 shadow-[0_0_15px_rgba(251,146,60,0.1)]">
                                    <Check size={32} />
                                </div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Total Bookings</p>
                                <h4 className="text-4xl font-bold font-display mt-2">{bookings.length}</h4>
                            </ClayCard>

                            <ClayCard className="p-6 border border-white/5 bg-void/20 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-chill-blue/30 cursor-pointer transition-all" onClick={() => { setSelectedEvent(null); setIsEventModalOpen(true); }}>
                                <div className="absolute inset-0 bg-chill-blue/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="p-3 bg-white/5 rounded-2xl text-white mb-4 group-hover:bg-chill-blue group-hover:text-void transition-colors">
                                    <Plus size={32} />
                                </div>
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest mt-1">Quick Action</p>
                                <h4 className="text-xl font-bold font-display mt-2">Publish New Event</h4>
                            </ClayCard>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold font-display opacity-80">Recent Events</h3>
                                    <button onClick={() => setActiveTab("events")} className="flex items-center gap-1 text-[10px] font-bold text-chill-blue uppercase tracking-widest hover:underline">
                                        View All <ArrowRight size={12} />
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="grid grid-cols-1 gap-4">
                                        {[1, 2].map(i => <div key={i} className="h-40 bg-clay-surface rounded-3xl animate-pulse" />)}
                                    </div>
                                ) : myEvents.length === 0 ? (
                                    <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/30">
                                        <p className="text-text-secondary">No events created yet.</p>
                                        <ClayButton variant="secondary" className="mt-4" onClick={() => { setSelectedEvent(null); setIsEventModalOpen(true); }}>Create your first event</ClayButton>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {myEvents.slice(0, 3).map(event => (
                                            <ClayCard key={event.id} className="p-0 border border-white/5 bg-void/20 overflow-hidden group flex h-28">
                                                <div className="w-28 h-full relative overflow-hidden">
                                                    <img src={getImageUrl(event.imageUrl)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                                                </div>
                                                <div className="flex-1 p-3 flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="font-bold text-sm truncate max-w-[150px]">{event.title}</h4>
                                                        <div className="text-[9px] bg-chill-blue/10 text-chill-blue px-2 py-0.5 rounded font-bold uppercase">
                                                            {event.totalCapacity - event.availableCapacity} / {event.totalCapacity} Sold
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] text-text-secondary"><MapPin size={10} className="inline mr-1" /> {event.venue?.name}</span>
                                                        <button onClick={() => handleEdit(event)} className="text-xs text-chill-blue hover:underline">Edit</button>
                                                    </div>
                                                </div>
                                            </ClayCard>
                                        ))}
                                    </div>
                                )}
                             </div>

                             <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold font-display opacity-80">Latest Bookings</h3>
                                    <button onClick={() => setActiveTab("bookings")} className="flex items-center gap-1 text-[10px] font-bold text-chill-blue uppercase tracking-widest hover:underline">
                                        View All <ArrowRight size={12} />
                                    </button>
                                </div>
                                
                                {bookingsLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-20 bg-clay-surface rounded-2xl animate-pulse" />)}
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/30">
                                        <p className="text-text-secondary italic">No bookings yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {bookings.slice(0, 4).map(booking => (
                                            <ClayCard key={booking.id} className="p-3 border border-white/5 bg-white/5 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-chill-blue/10 flex items-center justify-center text-chill-blue text-xs font-bold">
                                                        {booking.user.username[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs">{booking.user.username}</p>
                                                        <p className="text-[8px] text-text-secondary uppercase">{booking.event.title}</p>
                                                    </div>
                                                </div>
                                                <span className="text-[10px] font-bold">₹{booking.event.price}</span>
                                            </ClayCard>
                                        ))}
                                    </div>
                                )}
                             </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "events" && (
                    <motion.div key="ev" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-display font-bold">My Events</h2>
                                <p className="text-text-secondary text-sm">Manage and monitor all your published events</p>
                            </div>
                            <ClayButton onClick={() => { setSelectedEvent(null); setIsEventModalOpen(true); }} variant="primary" className="shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                                + Create New
                            </ClayButton>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-64 bg-clay-surface rounded-3xl animate-pulse" />)}
                            </div>
                        ) : myEvents.length === 0 ? (
                            <div className="p-20 border border-dashed border-white/10 rounded-3xl text-center bg-void/30">
                                <Calendar size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
                                <h3 className="text-xl font-bold mb-2">No events found</h3>
                                <p className="text-text-secondary mb-6">Ready to host something amazing?</p>
                                <ClayButton variant="primary" onClick={() => { setSelectedEvent(null); setIsEventModalOpen(true); }}>Create Event</ClayButton>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myEvents.map(event => (
                                    <ClayCard key={event.id} className="p-0 border border-white/5 bg-void/20 overflow-hidden group hover:border-chill-blue/30 transition-all flex flex-col h-full">
                                        <div className="relative h-40 overflow-hidden">
                                            <img src={getImageUrl(event.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={event.title} />
                                            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
                                            <div className="absolute top-3 left-3 bg-void/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 text-[10px] font-bold text-chill-blue">
                                                ₹{event.price}
                                            </div>
                                        </div>
                                        <div className="p-5 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-lg leading-tight group-hover:text-chill-blue transition-colors">{event.title}</h4>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(event)} className="p-1.5 bg-white/5 rounded-lg text-text-secondary hover:text-white transition-colors" title="Edit"><Pencil size={14}/></button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-1.5 bg-white/5 rounded-lg text-text-secondary hover:text-energy-pink transition-colors" title="Delete"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 mb-4">
                                                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <MapPin size={12} className="text-chill-blue" /> {event.venue?.name}
                                                    </p>
                                                    <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-orange-400" /> {new Date(event.dateTime).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="pt-4 border-t border-white/5">
                                                <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                                                    <span className="text-text-secondary">Sales</span>
                                                    <span className="text-chill-blue">{Math.round(((event.totalCapacity - event.availableCapacity) / event.totalCapacity) * 100)}%</span>
                                                </div>
                                                <div className="h-1 options-void bg-void rounded-full overflow-hidden">
                                                    <div className="h-full bg-chill-blue shadow-[0_0_10px_#00f0ff]" style={{ width: `${((event.totalCapacity - event.availableCapacity) / event.totalCapacity) * 100}%` }} />
                                                </div>
                                                <div className="flex justify-between mt-2 text-[10px] text-text-secondary">
                                                    <span>{event.totalCapacity - event.availableCapacity} Booked</span>
                                                    <span>{event.availableCapacity} Remaining</span>
                                                </div>
                                            </div>
                                        </div>
                                    </ClayCard>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "bookings" && (
                    <motion.div key="bk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <h2 className="text-3xl font-display font-bold">Bookings</h2>
                                <p className="text-text-secondary text-sm">Real-time ticket sales and attendee list</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Total Revenue</p>
                                <p className="text-2xl font-bold font-display text-green-400">₹{bookings.reduce((sum, b) => sum + (b.event.price || 0), 0).toLocaleString()}</p>
                            </div>
                        </div>

                        {bookingsLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-20 bg-clay-surface rounded-2xl animate-pulse" />)}
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="p-20 border border-dashed border-white/10 rounded-3xl text-center bg-void/30">
                                <Users size={48} className="mx-auto text-text-secondary opacity-20 mb-4" />
                                <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
                                <p className="text-text-secondary mb-6">Your ticket sales will appear here as people book.</p>
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-3xl border border-white/5 bg-void/20">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-text-secondary">
                                            <th className="px-6 py-4">Attendee</th>
                                            <th className="px-6 py-4">Event</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {bookings.map(booking => (
                                            <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-chill-blue/10 flex items-center justify-center text-chill-blue font-bold text-xs ring-1 ring-chill-blue/20">
                                                            {booking.user.username[0].toUpperCase()}
                                                        </div>
                                                        <span className="font-bold text-sm tracking-wide">{booking.user.username}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-text-secondary group-hover:text-white transition-colors">{booking.event.title}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-bold">₹{booking.event.price}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-chill-blue/20 text-chill-blue border border-chill-blue/30">
                                                        Confirmed
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-[10px] text-text-secondary">{new Date(booking.bookingTime).toLocaleDateString()}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === "analytics" && (
                     <motion.div key="ana" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <AnalyticsCharts />
                    </motion.div>
                )}
            </AnimatePresence>

            <EventFormModal 
                isOpen={isEventModalOpen}
                onClose={() => setIsEventModalOpen(false)}
                onSuccess={handleEventSuccess}
                initialData={selectedEvent}
                venues={venues}
            />
        </motion.div>
    );
}
