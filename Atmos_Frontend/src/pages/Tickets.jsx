import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import DigitalTicket from "../components/DigitalTicket";
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        
        <div className="flex flex-col gap-6 mb-24">
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
            bookings.map((booking, i) => (
              <DigitalTicket key={booking.id} booking={booking} index={i} />
            ))
          )}
        </div>
      </div>
      
      <Footer />
    </motion.div>
  );
}
