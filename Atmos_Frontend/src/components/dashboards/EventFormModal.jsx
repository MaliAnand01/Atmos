import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Plus, MapPin, Image, Info, Check, Calendar, Users, Activity } from "lucide-react";
import ClayButton from "../ClayButton";
import { api } from "../../services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import ClayCard from "../ClayCard";

const eventSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    tagline: z.string().optional(),
    description: z.string().min(10, "Description must be at least 10 characters"),
    venueId: z.string().min(1, "Please select a venue"),
    dateTime: z.string().min(1, "Date and time are required"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    energyLevel: z.coerce.number().min(1).max(10),
    imageUrl: z.string().url("Invalid image URL").min(1, "Event image is required"),
    ageLimit: z.string().optional(),
    dressCode: z.string().optional(),
    doorPolicy: z.string().optional(),
    performerName: z.string().optional(),
    performerBio: z.string().optional(),
    performerImage: z.string().optional(),
    tourName: z.string().optional(),
});

export default function EventFormModal({ isOpen, onClose, onSuccess, initialData = null, venues = [] }) {
    const [step, setStep] = useState(1);
    const [publishSuccess, setPublishSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(eventSchema),
        mode: "onChange",
        defaultValues: {
            energyLevel: 5,
            capacity: 100,
            price: 499,
        }
    });

    const energyLevel = watch("energyLevel");
    const imageUrl = watch("imageUrl");

    useEffect(() => {
        if (initialData) {
            reset({
                ...initialData,
                venueId: initialData.venue?.id?.toString() || "",
                dateTime: initialData.dateTime ? initialData.dateTime.substring(0, 16) : "",
                capacity: initialData.totalCapacity || 100,
            });
        } else {
            reset({
                title: "",
                tagline: "",
                description: "",
                venueId: venues[0]?.id?.toString() || "",
                dateTime: "",
                capacity: 100,
                price: 499,
                energyLevel: 5,
                imageUrl: "",
            });
        }
        setStep(1);
        setPublishSuccess(false);
    }, [initialData, reset, isOpen, venues]);

    useEffect(() => {
        if (!isOpen) return;
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        return () => {
          document.body.style.position = "";
          document.body.style.top = "";
          document.body.style.width = "";
          window.scrollTo(0, scrollY);
        };
    }, [isOpen]);

    const nextStep = () => {
        if (step < 4) setStep(s => s + 1);
        else handleSubmit(onSubmit)();
    };

    const prevStep = () => {
        if (step > 1) setStep(s => s - 1);
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                totalCapacity: parseInt(data.capacity),
                venue: { id: parseInt(data.venueId) }
            };
            
            if (initialData?.id) {
                await api.put(`/events/${initialData.id}`, payload);
            } else {
                await api.post("/events", payload);
            }
            
            setPublishSuccess(true);
            setStep(5);
            onSuccess?.();
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            toast.error(err.message || "Failed to save event");
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-void/90 backdrop-blur-xl"
            />
            
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="w-full max-w-2xl relative"
            >
                <ClayCard className="p-0 border-white/5 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {/* Header with Step Indicator */}
                    <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-chill-blue/10 rounded-xl text-chill-blue">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-display">{initialData ? "Edit Event" : "Create Event"}</h3>
                                <div className="flex gap-1 mt-1">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className={`h-1 w-6 rounded-full transition-all duration-500 ${step >= i ? 'bg-chill-blue' : 'bg-white/10'}`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-secondary transition-colors">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="st1" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Event Title</label>
                                        <input {...register("title")} placeholder="e.g. Neon Nights Symphony" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        {errors.title && <p className="text-energy-pink text-[10px]">{errors.title.message}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tagline</label>
                                        <input {...register("tagline")} placeholder="A short catchy hook..." className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Description</label>
                                        <textarea {...register("description")} rows={4} placeholder="Describe the atmosphere and vibe..." className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none resize-none" />
                                        {errors.description && <p className="text-energy-pink text-[10px]">{errors.description.message}</p>}
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="st2" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Venue</label>
                                            <select {...register("venueId")} className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none appearance-none">
                                                {venues.length === 0 ? <option disabled>No venues available</option> : 
                                                 venues.map(v => <option key={v.id} value={v.id.toString()}>{v.name} ({v.address})</option>)
                                                }
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Date & Time</label>
                                            <input {...register("dateTime")} type="datetime-local" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Capacity</label>
                                            <input {...register("capacity")} type="number" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Ticket Price (₹)</label>
                                            <input {...register("price")} type="number" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-4 pt-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Energy Level</label>
                                            <span className="text-xs font-bold text-chill-blue">Level {energyLevel}</span>
                                        </div>
                                        <input {...register("energyLevel")} type="range" min="1" max="10" className="w-full h-1.5 bg-void rounded-lg appearance-none accent-chill-blue border border-white/5" />
                                        <div className="flex justify-between text-[8px] text-text-secondary font-bold uppercase">
                                            <span>Chill</span>
                                            <span>Balanced</span>
                                            <span>High-Energy</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div key="st3" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Age Limit</label>
                                            <input {...register("ageLimit")} placeholder="e.g. 21+" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Dress Code</label>
                                            <input {...register("dressCode")} placeholder="e.g. Smart Casual" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Cover Image URL</label>
                                        <input {...register("imageUrl")} placeholder="https://..." className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        {errors.imageUrl && <p className="text-energy-pink text-[10px]">{errors.imageUrl.message}</p>}
                                    </div>
                                    {imageUrl && (
                                        <div className="w-full h-40 rounded-2xl overflow-hidden border border-white/10 bg-void">
                                            <img src={imageUrl} className="w-full h-full object-cover opacity-60" onError={(e) => e.target.style.display = 'none'} />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div key="st4" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4 text-chill-blue">
                                        <Activity size={16} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Artist Spotlight</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Artist Name</label>
                                            <input {...register("performerName")} placeholder="e.g. Alan Walker" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Tour Name</label>
                                            <input {...register("tourName")} placeholder="e.g. Walkerworld Tour" className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Artist Bio</label>
                                        <textarea {...register("performerBio")} rows={3} className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none resize-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Artist Photo URL</label>
                                        <input {...register("performerImage")} className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none" />
                                    </div>
                                </motion.div>
                            )}

                            {step === 5 && (
                                <motion.div key="st5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center py-12">
                                    {publishSuccess ? (
                                        <>
                                            <div className="w-20 h-20 rounded-full bg-chill-blue/10 flex items-center justify-center mb-6 border border-chill-blue/30 shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                                                <Check size={40} className="text-chill-blue" />
                                            </div>
                                            <h4 className="text-2xl font-bold mb-3 font-display">{initialData ? "Event Updated!" : "Event Published!"} 🎉</h4>
                                            <p className="text-sm text-text-secondary max-w-xs">Your event is now live and visible to the Atmos community.</p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 rounded-full bg-energy-pink/10 flex items-center justify-center mb-6 border border-energy-pink/30">
                                                <Info size={40} className="text-energy-pink" />
                                            </div>
                                            <h4 className="text-2xl font-bold mb-3 font-display">Submission Failed</h4>
                                            <p className="text-sm text-text-secondary max-w-xs">There was an error processing your request. Please try again.</p>
                                            <ClayButton className="mt-8" variant="primary" onClick={() => setStep(3)}>Retry</ClayButton>
                                        </>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer Actions */}
                    {step < 5 && (
                        <div className="p-6 border-t border-white/5 bg-void/50 flex gap-4">
                            <ClayButton onClick={prevStep} disabled={step === 1} variant="secondary" className="flex-1 py-3 disabled:opacity-20">
                                Back
                            </ClayButton>
                            <ClayButton onClick={nextStep} variant="primary" className="flex-1 py-3 bg-white text-void hover:bg-chill-blue hover:text-void transition-colors shadow-lg">
                                {step === 4 ? (initialData ? "Save Changes" : "Create Event") : "Next"}
                            </ClayButton>
                        </div>
                    )}
                </ClayCard>
            </motion.div>
        </div>,
        document.body
    );
}
