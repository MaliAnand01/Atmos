import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
    Image, 
    Upload, 
    Check, 
    Plus, 
    Calendar, 
    MapPin, 
    BarChart3, 
    Pencil, 
    Trash2,
    Info,
    Clock
} from "lucide-react";
import ClayCard from "../ClayCard";
import ClayButton from "../ClayButton";
import { api, getImageUrl } from "../../services/api";
import { getUser } from "../../services/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    tagline: z.string().optional(),
    energyLevel: z.coerce.number().min(1).max(10),
    venueId: z.string().min(1, "Please select a venue"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    dateTime: z.string().refine((val) => {
        const date = new Date(val);
        return date > new Date();
    }, { message: "Please select a future date and time" }),
    ageLimit: z.string().optional(),
    dressCode: z.string().optional(),
    doorPolicy: z.string().optional(),
});

export default function OrganizerView() {
    const [step, setStep] = useState(1);
    const [myEvents, setMyEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState("events"); // "events" or "bookings"
    const [loading, setLoading] = useState(true);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const user = getUser();
    
    // Non-form UI states
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [editingEventId, setEditingEventId] = useState(null);

    const {
        register,
        handleSubmit,
        trigger,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(eventSchema),
        defaultValues: {
            energyLevel: 5,
            capacity: 100,
            price: 499,
        }
    });

    const energyLevel = watch("energyLevel");
    const title = watch("title");
    const venueId = watch("venueId");

    useEffect(() => {
        fetchMyEvents();
        fetchVenues();
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        if (!user) return;
        setBookingsLoading(true);
        try {
            const data = await api.get(`/bookings/organizer/${user.id}`, true);
            setBookings(data);
        } catch (err) {
            console.error("Failed to fetch organizer bookings:", err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchMyEvents = async () => {
        if (!user) return;
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
            if (data.length > 0) setValue("venueId", data[0].id.toString());
        } catch (err) {
            console.error("Failed to fetch venues:", err);
        }
    };

    const nextStep = async () => {
        let isStepValid = false;
        if (step === 1) {
            isStepValid = await trigger(["title", "description"]);
        } else if (step === 2) {
            isStepValid = await trigger(["energyLevel", "capacity", "price", "venueId", "dateTime"]);
        } else if (step === 3) {
            // Step 3 is just image upload, we'll proceed to launch
            await handleSubmit(handleFinalPublish)();
            return;
        }

        if (isStepValid) {
            setStep(s => Math.min(4, s + 1));
        }
    };
    
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleFinalPublish = async (data) => {
        setIsUploading(true);
        try {
            let imageUrl = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80"; // Fallback
            
            if (selectedFile) {
                const result = await api.upload('/files/upload', selectedFile);
                imageUrl = result.imageUrl;
            }

            // Create the real event
            const eventPayload = {
                title: data.title,
                description: data.description,
                tagline: data.tagline,
                energyLevel: parseInt(data.energyLevel),
                imageUrl,
                dateTime: data.dateTime,
                totalCapacity: parseInt(data.capacity),
                availableCapacity: parseInt(data.capacity),
                price: parseFloat(data.price),
                venue: { id: parseInt(data.venueId) },
                organizerId: user.id,
                ageLimit: data.ageLimit,
                dressCode: data.dressCode,
                doorPolicy: data.doorPolicy,
            };

            await api[editingEventId ? 'put' : 'post'](
                editingEventId ? `/events/${editingEventId}` : '/events', 
                eventPayload
            );
            
            setUploadSuccess(true);
            setStep(4);
            setEditingEventId(null);
            fetchMyEvents(); // Refresh list
            toast.success(editingEventId ? "Event updated successfully!" : "Event published successfully!");
        } catch (error) {
            console.error("Launch failed:", error);
            setUploadSuccess(false);
            setStep(4);
            toast.error("Failed to publish event. Please check your data.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleEdit = (event) => {
        setEditingEventId(event.id);
        reset({
            title: event.title,
            description: event.description,
            energyLevel: event.energyLevel,
            venueId: event.venue.id.toString(),
            capacity: event.totalCapacity,
            price: event.price,
            dateTime: event.dateTime,
            tagline: event.tagline || "",
            ageLimit: event.ageLimit || "",
            dressCode: event.dressCode || "",
            doorPolicy: event.doorPolicy || "",
        });
        setPreviewUrl(getImageUrl(event.imageUrl));
        setStep(1);
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm("Are you sure you want to delete this event? This will also cancel all bookings.")) return;
        try {
            await api.delete(`/events/${id}`);
            fetchMyEvents();
            toast.success("Event deleted and bookings cancelled.");
        } catch (err) {
            console.error("Failed to delete event:", err);
            toast.error("Failed to delete event.");
        }
    };

    const resetForm = () => {
        setEditingEventId(null);
        reset({
            title: "",
            description: "",
            energyLevel: 5,
            venueId: venues.length > 0 ? venues[0].id.toString() : "",
            capacity: 100,
            price: 499,
            dateTime: "",
            tagline: "",
            ageLimit: "",
            dressCode: "",
            doorPolicy: "",
        });
        setPreviewUrl(null);
        setSelectedFile(null);
        setStep(1);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <h2 className="text-3xl font-display font-bold">Organizer Dashboard</h2>
                    <p className="text-text-secondary text-sm mt-1">Manage your events and track bookings</p>
                </div>
                <div className="flex bg-clay-surface p-1 rounded-2xl border border-white/5">
                    <button 
                        onClick={() => setActiveTab("events")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "events" ? "bg-chill-blue text-void shadow-lg" : "text-text-secondary hover:text-white"}`}
                    >
                        Events
                    </button>
                    <button 
                        onClick={() => setActiveTab("bookings")}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "bookings" ? "bg-chill-blue text-void shadow-lg" : "text-text-secondary hover:text-white"}`}
                    >
                        Bookings
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
                    {activeTab === "events" ? (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold font-display opacity-80">My Events</h3>
                                <span className="flex items-center gap-1 text-xs text-text-secondary"><BarChart3 size={14} /> {myEvents.length} Active</span>
                            </div>
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2].map(i => <div key={i} className="h-40 bg-clay-surface rounded-3xl animate-pulse" />)}
                                </div>
                            ) : myEvents.length === 0 ? (
                                <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/30">
                                    <p className="text-text-secondary">No events yet. Use the form to create your first event.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myEvents.map(event => (
                                        <ClayCard key={event.id} className="group hover:border-chill-blue/30 transition-all p-0 overflow-hidden border border-white/5">
                                            <div className="h-32 w-full overflow-hidden relative">
                                                <img src={getImageUrl(event.imageUrl)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent" />
                                                <div className="absolute bottom-3 left-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest bg-chill-blue/20 text-chill-blue px-2 py-1 rounded-md border border-chill-blue/30">
                                                        Energy {event.energyLevel}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h4 className="text-lg font-bold truncate pr-4">{event.title}</h4>
                                                    
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleEdit(event)} className="p-2 bg-white/5 hover:bg-chill-blue/20 text-text-secondary hover:text-chill-blue rounded-lg transition-all">
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button onClick={() => handleDeleteEvent(event.id)} className="p-2 bg-white/5 hover:bg-energy-pink/20 text-text-secondary hover:text-energy-pink rounded-lg transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2 text-xs text-text-secondary">
                                                    <div className="flex items-center gap-2"><MapPin size={14} className="text-chill-blue" /> {event.venue?.name || 'Venue tbd'}</div>
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <span className="text-chill-blue">{event.totalCapacity - event.availableCapacity}</span> / {event.totalCapacity} Sold
                                                    </div>
                                                </div>
                                            </div>
                                        </ClayCard>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold font-display opacity-80">Recent Bookings</h3>
                                <button onClick={fetchBookings} className="text-xs text-chill-blue hover:underline">Refresh</button>
                            </div>
                            {bookingsLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <div key={i} className="h-20 bg-clay-surface rounded-2xl animate-pulse" />)}
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/30">
                                    <p className="text-text-secondary">No bookings received yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map(booking => (
                                        <ClayCard key={booking.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5 border-white/5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-chill-blue/10 flex items-center justify-center text-chill-blue">
                                                    <Check size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{booking.user.username}</h4>
                                                    <p className="text-xs text-text-secondary">Booked <span className="text-white">{booking.event.title}</span></p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${booking.status === 'ACTIVE' ? 'bg-chill-blue/20 text-chill-blue' : 'bg-energy-pink/20 text-energy-pink'}`}>
                                                    {booking.status}
                                                </span>
                                                <p className="text-[10px] text-text-secondary">{new Date(booking.bookingTime).toLocaleDateString()}</p>
                                            </div>
                                        </ClayCard>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Form Section */}
                <div className="lg:col-span-1 order-1 lg:order-2">
                    <ClayCard className="p-8 sticky top-24 border border-chill-blue/20 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-chill-blue/10 rounded-lg text-chill-blue">
                                <Plus size={20} />
                            </div>
                            <h3 className="text-xl font-bold font-display">{editingEventId ? 'Edit Event' : 'New Event'}</h3>
                            {editingEventId && (
                                <button onClick={resetForm} className="ml-auto text-xs text-text-secondary hover:text-white uppercase tracking-widest font-bold">Cancel</button>
                            )}
                        </div>
                        
                        <div className="min-h-[250px] relative">
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block font-body">Event Name</label>
                                            <input 
                                                {...register("title")}
                                                type="text" 
                                                className="w-full bg-void text-white p-3 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/20 text-sm font-body" 
                                                placeholder="e.g., Midnight Techno Session" 
                                            />
                                            {errors.title && <p className="text-energy-pink text-[10px] mt-1 ml-1 font-body">{errors.title.message}</p>}
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block font-body">Short Tagline</label>
                                            <input 
                                                {...register("tagline")}
                                                type="text" 
                                                className="w-full bg-void text-white p-3 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/20 text-sm font-body" 
                                                placeholder="Keep it catchy & short" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block font-body">About Event</label>
                                            <textarea 
                                                {...register("description")}
                                                rows={3}
                                                className="w-full bg-void text-white p-3 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/20 resize-none text-sm font-body" 
                                                placeholder="Simple description of the vibe..." 
                                            />
                                            {errors.description && <p className="text-energy-pink text-[10px] mt-1 ml-1 font-body">{errors.description.message}</p>}
                                        </div>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                    <motion.div key="step2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block font-body">Age Limit</label>
                                                <input {...register("ageLimit")} placeholder="e.g. 21+" className="w-full bg-void text-white p-3 rounded-xl border border-white/10 outline-none text-xs font-body" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block font-body">Dress Code</label>
                                                <input {...register("dressCode")} placeholder="e.g. Smart Casual" className="w-full bg-void text-white p-3 rounded-xl border border-white/10 outline-none text-xs font-body" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block font-body">Door Policy</label>
                                            <input {...register("doorPolicy")} placeholder="e.g. Carry valid ID" className="w-full bg-void text-white p-3 rounded-xl border border-white/10 outline-none text-xs font-body" />
                                        </div>
                                    </motion.div>
                                )}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Event Photo / Poster</label>
                                            <div className="w-full h-48 border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center text-text-secondary hover:border-chill-blue hover:bg-chill-blue/5 transition-all cursor-pointer relative overflow-hidden group font-body">
                                                {previewUrl ? (
                                                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                                ) : (
                                                    <Image size={48} className="opacity-20 mb-2" />
                                                )}
                                                <span className="text-sm mt-2 relative z-10 font-medium">{previewUrl ? "Change Image" : "Upload Event Poster"}</span>
                                                <p className="text-[10px] opacity-40 mt-1 relative z-10">PNG, JPG or WEBP (Max 5MB)</p>
                                                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                                {step === 4 && (
                                    <motion.div key="step4" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center py-8">
                                        {uploadSuccess ? (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-chill-blue/10 flex items-center justify-center mb-4 border border-chill-blue/30 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                                                    <Check size={32} className="text-chill-blue" />
                                                </div>
                                                <h4 className="text-xl font-bold mb-2">{editingEventId ? "Event Updated!" : "Event Created!"} 🎉</h4>
                                                <p className="text-sm text-text-secondary">Your changes have been saved and the event is live.</p>
                                                <ClayButton className="mt-6" variant="secondary" onClick={resetForm}>{editingEventId ? "Back to Dashboard" : "Create Another"}</ClayButton>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-energy-pink/10 flex items-center justify-center mb-4 border border-energy-pink/30">
                                                    <Info size={32} className="text-energy-pink" />
                                                </div>
                                                <h4 className="text-xl font-bold mb-2">Something Went Wrong</h4>
                                                <p className="text-sm text-text-secondary">We could not create the event. Please check your details and try again.</p>
                                                <ClayButton className="mt-6" variant="primary" onClick={() => setStep(3)}>Try Again</ClayButton>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex gap-3 mt-8 border-t border-white/5 pt-6">
                            {step < 4 && (
                                <>
                                    <ClayButton 
                                        variant="secondary" 
                                        onClick={prevStep} 
                                        disabled={step === 1 || isUploading}
                                        className="flex-1 text-xs py-2 disabled:opacity-20"
                                    >
                                        Back
                                    </ClayButton>
                                    <ClayButton 
                                        variant="primary" 
                                        onClick={nextStep} 
                                        disabled={isUploading}
                                        className={`flex-1 text-xs py-2 shadow-lg transition-all ${step === 3 ? "bg-chill-blue text-void hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]" : "bg-white text-void"}`}
                                    >
                                        {isUploading ? "Saving..." : step === 3 ? (editingEventId ? "Save Changes" : "Publish Event") : "Next"}
                                    </ClayButton>
                                </>
                            )}
                        </div>
                    </ClayCard>
                </div>
            </div>
        </motion.div>
    );
}
