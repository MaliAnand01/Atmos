import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Image as ImageIcon, UploadSimple, CheckCircle, Plus, Calendar, MapPin, ChartBar, Pencil, Trash } from "@phosphor-icons/react";
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
    energyLevel: z.coerce.number().min(1).max(10),
    venueId: z.string().min(1, "Please select a venue"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    dateTime: z.string().refine((val) => {
        const date = new Date(val);
        return date > new Date();
    }, { message: "Please select a future date and time" }),
});

export default function OrganizerView() {
    const [step, setStep] = useState(1);
    const [myEvents, setMyEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
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
    }, []);

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
                energyLevel: parseInt(data.energyLevel),
                imageUrl,
                dateTime: data.dateTime,
                totalCapacity: parseInt(data.capacity),
                availableCapacity: parseInt(data.capacity),
                price: parseFloat(data.price),
                venue: { id: parseInt(data.venueId) },
                organizerId: user.id
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
        });
        setPreviewUrl(null);
        setSelectedFile(null);
        setStep(1);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            <div className="flex justify-between items-end">
                <h2 className="text-3xl font-display font-bold">My Events</h2>
                <div className="flex gap-4 text-text-secondary text-sm">
                    <span className="flex items-center gap-1"><ChartBar size={16} /> {myEvents.length} Active Events</span>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* My Events List */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold font-display opacity-80">My Events</h3>
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => <div key={i} className="h-40 bg-clay-surface rounded-3xl animate-pulse" />)}
                        </div>
                    ) : myEvents.length === 0 ? (
                        <div className="p-12 border border-dashed border-white/10 rounded-3xl text-center bg-void/30">
                            <p className="text-text-secondary">No events yet. Use the form on the right to create your first event.</p>
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
                                                    <Trash size={16} />
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
                </div>

                {/* Wizard Component */}
                <div className="lg:col-span-1">
                    <ClayCard className="p-8 sticky top-24 border border-chill-blue/20 shadow-[0_0_30px_rgba(0,240,255,0.05)]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-chill-blue/10 rounded-lg text-chill-blue">
                                <Plus size={20} weight="bold" />
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
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Event Name</label>
                                            <input 
                                                {...register("title")}
                                                type="text" 
                                                className="w-full bg-void text-white p-3 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/10" 
                                                placeholder="Event Title" 
                                            />
                                            {errors.title && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.title.message}</p>}
                                        </div>
                                        <div>
                                            <textarea 
                                                {...register("description")}
                                                rows={3}
                                                className="w-full bg-void text-white p-3 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/10 resize-none text-sm" 
                                                placeholder="Tell people what this event is about..." 
                                            />
                                            {errors.description && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.description.message}</p>}
                                        </div>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                    <motion.div key="step2" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Energy Level (1-10)</label>
                                            <input 
                                                {...register("energyLevel")}
                                                type="range" 
                                                min="1" max="10" 
                                                className="w-full h-1.5 bg-void rounded-lg appearance-none cursor-pointer accent-chill-blue" 
                                            />
                                            <div className="flex justify-between mt-2 text-[10px] font-bold text-text-secondary">
                                                <span className={energyLevel <= 3 ? "text-chill-blue" : ""}>CHILL</span>
                                                <span className="text-white text-xs">{energyLevel}</span>
                                                <span className={energyLevel >= 8 ? "text-energy-pink" : ""}>ENERGY</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Capacity</label>
                                                <input 
                                                    {...register("capacity")}
                                                    type="number" 
                                                    className="w-full bg-void text-white p-3 rounded-xl border border-white/10 outline-none text-sm" 
                                                />
                                                {errors.capacity && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.capacity.message}</p>}
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Price (₹)</label>
                                                <input 
                                                    {...register("price")}
                                                    type="number" 
                                                    className="w-full bg-void text-white p-3 rounded-xl border border-white/10 outline-none text-sm" 
                                                />
                                                {errors.price && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.price.message}</p>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Venue</label>
                                            <select
                                                {...register("venueId")}
                                                className="w-full bg-void text-white p-3 rounded-xl border border-white/10 outline-none text-sm"
                                            >
                                                {venues.length === 0 && <option value="">Loading venues...</option>}
                                                {venues.map(v => (
                                                    <option key={v.id} value={v.id}>{v.name} (cap: {v.capacity})</option>
                                                ))}
                                            </select>
                                            {errors.venueId && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.venueId.message}</p>}
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Date & Time</label>
                                            <input 
                                                {...register("dateTime")}
                                                type="datetime-local" 
                                                className="w-full bg-void text-white p-3 rounded-xl border border-white/10 outline-none text-sm" 
                                            />
                                            {errors.dateTime && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.dateTime.message}</p>}
                                        </div>
                                    </motion.div>
                                )}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Event Photo / Poster</label>
                                            <div className="w-full h-48 border border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center text-text-secondary hover:border-chill-blue hover:bg-chill-blue/5 transition-all cursor-pointer relative overflow-hidden group">
                                                {previewUrl ? (
                                                    <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                                ) : (
                                                    <ImageIcon size={48} className="opacity-20 mb-2" />
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
                                                    <CheckCircle size={32} weight="fill" className="text-chill-blue" />
                                                </div>
                                                <h4 className="text-xl font-bold mb-2">{editingEventId ? "Event Updated!" : "Event Created!"} 🎉</h4>
                                                <p className="text-sm text-text-secondary">Your changes have been saved and the event is live.</p>
                                                <ClayButton className="mt-6" variant="secondary" onClick={resetForm}>{editingEventId ? "Back to Dashboard" : "Create Another"}</ClayButton>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-16 h-16 rounded-full bg-energy-pink/10 flex items-center justify-center mb-4 border border-energy-pink/30">
                                                    <Plus size={32} className="text-energy-pink rotate-45" />
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
