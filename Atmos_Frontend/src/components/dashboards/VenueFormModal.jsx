import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Compass, MapPin, Users, Check } from "lucide-react";
import ClayButton from "../ClayButton";
import { api } from "../../services/api";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import ClayCard from "../ClayCard";

const venueSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  capacity: z.coerce.number().min(1, "Capacity must be positive"),
  imageUrl: z.string().url("Invalid image URL").or(z.literal("")),
});

export default function VenueFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(venueSchema),
    defaultValues: initialData || {
      name: "",
      address: "",
      capacity: 500,
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({ name: "", address: "", capacity: 500, imageUrl: "" });
    }
  }, [initialData, reset, isOpen]);

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

  const onVenueSubmit = async (data) => {
    try {
      if (initialData?.id) {
        await api.put(`/venues/${initialData.id}`, data);
        toast.success("Venue updated successfully!");
      } else {
        await api.post("/venues", data);
        toast.success("Venue created successfully!");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to save venue");
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
        className="absolute inset-0 bg-void/80 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-xl relative transform-gpu"
      >
        <ClayCard className="p-8 border-chill-blue/30 overflow-hidden relative shadow-[0_0_50px_rgba(0,240,255,0.15)]">
           {/* Decorative Background Element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-chill-blue/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chill-blue/10 rounded-xl text-chill-blue">
                <Compass size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display">{initialData ? "Edit Venue" : "New Venue"}</h2>
                <p className="text-xs text-text-secondary tracking-widest uppercase font-bold mt-1">Manage Platform Locations</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-text-secondary transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit(onVenueSubmit)} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Venue Name</label>
                <div className="relative">
                  <input
                    {...register("name")}
                    placeholder="Grand Ballroom"
                    className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none transition-all focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                  />
                </div>
                {errors.name && <p className="text-energy-pink text-[10px] ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Location / Address</label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"><MapPin size={14}/></div>
                    <input
                      {...register("address")}
                      placeholder="Bandra, Mumbai"
                      className="w-full bg-void border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-chill-blue outline-none transition-all focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                    />
                </div>
                {errors.address && <p className="text-energy-pink text-[10px] ml-1">{errors.address.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Seating Capacity</label>
                <div className="relative">
                   <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"><Users size={14}/></div>
                    <input
                      {...register("capacity")}
                      type="number"
                      placeholder="1500"
                      className="w-full bg-void border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-chill-blue outline-none transition-all focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                    />
                </div>
                {errors.capacity && <p className="text-energy-pink text-[10px] ml-1">{errors.capacity.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-text-secondary uppercase tracking-widest ml-1">Venue Image URL</label>
                <input
                  {...register("imageUrl")}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-void border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-chill-blue outline-none transition-all focus:shadow-[0_0_15px_rgba(0,240,255,0.1)]"
                />
                {errors.imageUrl && <p className="text-energy-pink text-[10px] ml-1">{errors.imageUrl.message}</p>}
              </div>
            </div>

            <ClayButton
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-chill-blue text-void font-bold mt-4 py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,240,255,0.3)] hover:shadow-[0_0_30px_rgba(0,240,255,0.5)] transition-all"
            >
              {isSubmitting ? "Processing..." : (
                <>
                  <Check size={18} />
                  {initialData ? "Save Changes" : "Create Venue"}
                </>
              )}
            </ClayButton>
          </form>
        </ClayCard>
      </motion.div>
    </div>,
    document.body
  );
}
