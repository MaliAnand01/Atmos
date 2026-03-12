import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { MapPin, Ticket, CalendarBlank } from "@phosphor-icons/react";
import ClayCard from "../components/ClayCard";
import ClayButton from "../components/ClayButton";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { getUser } from "../services/authStore";

export default function Tickets() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) { setLoading(false); return; }
      try {
        const data = await api.get(`/bookings/user/${user.id}`, true);
        setBookings(data.filter(b => b.status === "ACTIVE"));
      } catch (error) {
        console.error("Failed to load tickets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user?.id]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="bg-void min-h-screen pt-32 text-text-primary flex flex-col pb-28 md:pb-0"
    >
      <div className="max-w-4xl mx-auto px-6 w-full flex-grow">
        <h1 className="text-4xl md:text-6xl font-display font-bold mb-4">Your Tickets</h1>
        <p className="text-text-secondary text-lg mb-12">Manage your upcoming RSVPs and access passes.</p>
        
        <div className="flex flex-col gap-8 mb-24">
          {loading ? (
            [1, 2].map(i => (
              <div key={i} className="h-36 bg-clay-surface rounded-3xl animate-pulse border border-white/5" />
            ))
          ) : bookings.length === 0 ? (
            <div className="text-center py-24 bg-clay-surface rounded-3xl border border-white/5 text-text-secondary">
              <span className="block text-4xl mb-4">🎟️</span>
              You don't have any upcoming tickets.<br />
              <Link to="/discover" className="text-chill-blue hover:underline mt-2 inline-block font-medium">Find your next experience →</Link>
            </div>
          ) : (
            bookings.map((booking, i) => {
              const event = booking.event;
              const dateObj = new Date(event.dateTime);
              const dateStr = dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
              const timeStr = dateObj.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=atmos-booking-${booking.id}`;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <ClayCard className="flex flex-col md:flex-row gap-6 p-6 md:p-8 relative overflow-hidden group border border-white/5">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-energy-pink/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform" />
                    
                    {/* QR Code */}
                    <div className="bg-white p-2 rounded-xl shrink-0 self-start md:self-center">
                      <img src={qrUrl} alt="QR Code" className="w-24 h-24 md:w-32 md:h-32 rounded-lg" />
                    </div>
                    
                    <div className="flex flex-col justify-center flex-grow">
                      <h3 className="text-2xl font-display font-bold text-white mb-1">{event.title}</h3>
                      <div className="text-chill-blue font-medium mb-4 text-sm">General Admission · CONFIRMED</div>
                      
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-text-secondary text-sm">
                        <div className="flex items-center gap-2">
                          <CalendarBlank size={14} className="text-chill-blue" />
                          <span className="font-medium text-white">{dateStr} at {timeStr}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-chill-blue" />
                          <span className="font-medium text-white">{event.venue?.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Ticket size={14} className="text-energy-pink" />
                          <span className="text-energy-pink font-bold text-xs uppercase tracking-wider">#{booking.id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center border-t border-white/5 pt-4 mt-2 md:pt-0 md:mt-0 md:pl-6 md:border-t-0 md:border-l">
                      <Link to={`/event/${event.id}`}>
                        <ClayButton variant="secondary" className="w-full md:w-auto mt-4 md:mt-0">
                          View Event
                        </ClayButton>
                      </Link>
                    </div>
                  </ClayCard>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
      
      <Footer />
    </motion.div>
  );
}
