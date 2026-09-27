import { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Ticket, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import toast from "react-hot-toast";

export default function DigitalTicket({ booking, index = 0 }) {
  const event = booking.event;
  const ref = useRef(null);

  // Mouse tracking for tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 30 });
  const shineX = useTransform(mouseX, [-0.5, 0.5], ["-20%", "120%"]);
  const shineY = useTransform(mouseY, [-0.5, 0.5], ["-20%", "120%"]);

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const dateObj = new Date(event.dateTime);
  const dateStr = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const qrData = booking.bookingHash || `atmos-booking-${booking.id}`;

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking? Refunds may take 5-7 business days.")) return;
    try {
      await api.put(`/bookings/${booking.id}/cancel`);
      toast.success("Booking cancelled successfully!");
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      toast.error(e.message || "Failed to cancel booking.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.45, ease: "easeOut" }}
      style={{ perspective: 800 }}
    >
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative rounded-3xl overflow-hidden cursor-default select-none"
      >
        {/* Main ticket body */}
        <div className="relative flex flex-col md:flex-row bg-[#0f0f14] border border-white/10 rounded-3xl shadow-xl overflow-hidden">

          {/* Left accent bar — vibe color strip */}
          <div className="hidden md:block w-1 bg-gradient-to-b from-[#7b8cde] via-[#e96479] to-[#f5a623] shrink-0" />

          {/* QR Section */}
          <div className="flex items-center justify-center p-5 md:p-6 bg-white/5 border-b md:border-b-0 md:border-r border-white/10">
            <div className="bg-white p-2.5 rounded-xl">
              <QRCodeSVG
                value={qrData}
                size={96}
                bgColor="#ffffff"
                fgColor="#0a0a0f"
                level="M"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow p-5 md:p-6 flex flex-col justify-between gap-4">
            {/* Top row: title + badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#7b8cde] mb-1">General Admission x{booking.quantity || 1}</p>
                <h3 className="text-xl md:text-2xl font-display font-bold text-white leading-tight">{event.title}</h3>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#e96479] bg-[#e96479]/10 border border-[#e96479]/20 rounded-full px-2.5 py-1 shrink-0 mt-0.5">
                <ShieldCheck size={11} />
                Confirmed
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/60">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[#7b8cde]" />
                <span className="text-white/90 font-medium">{dateStr}</span>
                <span>·</span>
                <span>{timeStr}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-[#7b8cde]" />
                <span className="text-white/90 font-medium">{event.venue?.name}</span>
              </span>
            </div>

            {/* Footer row: booking ID + action */}
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="flex items-center gap-1.5 text-[11px] text-white/30 font-mono">
                <Ticket size={11} />
                #{booking.id}
              </span>
              <div className="flex gap-4 items-center">
                 <button onClick={handleCancel} className="text-xs font-semibold text-energy-pink hover:text-white transition-colors">Cancel</button>
                 <Link to={`/event/${event.id}`} className="text-xs font-semibold text-[#7b8cde] hover:text-white transition-colors">View Event →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Holographic shine overlay */}
        <motion.div
          style={{ left: shineX, top: shineY }}
          className="pointer-events-none absolute w-40 h-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-2xl"
        />
      </motion.div>
    </motion.div>
  );
}
