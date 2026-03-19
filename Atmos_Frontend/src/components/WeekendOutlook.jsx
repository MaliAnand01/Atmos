import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, ChevronRight } from "lucide-react";
import { api, getImageUrl } from "../services/api";
import ClayCard from "./ClayCard";
import ClayButton from "./ClayButton";
import { Link } from "react-router-dom";

export default function WeekendOutlook() {
  const [activeTab, setActiveTab] = useState(5); // 5 = Friday, 6 = Saturday, 0 = Sunday
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        setLoading(true);
        const data = await api.get("/events");
        setEvents(data);
      } catch (err) {
        console.error("Failed to fetch events for weekend outlook:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllEvents();
  }, []);

  const TABS = [
    { day: "Friday", id: 5 },
    { day: "Saturday", id: 6 },
    { day: "Sunday", id: 0 },
  ];

  const filteredEvents = events.filter(evt => {
    const date = new Date(evt.dateTime);
    return date.getDay() === activeTab;
  }).slice(0, 4);

  return (
    <section className="py-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
             <div className="w-12 h-[1px] bg-energy-pink/30" />
             <span className="text-energy-pink text-[10px] font-bold uppercase tracking-[0.4em]">Planning Ahead</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            Weekend <span className="text-energy-pink">Outlook.</span>
          </h2>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-void/50 p-1 rounded-2xl border border-white/5 backdrop-blur-md self-start md:self-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                activeTab === tab.id ? "text-white" : "text-text-secondary hover:text-white"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabOutlook"
                  className="absolute inset-0 bg-energy-pink rounded-xl shadow-lg shadow-energy-pink/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{tab.day}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-3xl bg-clay-surface animate-pulse" />
              ))}
            </motion.div>
          ) : filteredEvents.length > 0 ? (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {filteredEvents.map((evt) => (
                <Link key={evt.id} to={`/event/${evt.id}`}>
                  <ClayCard className="p-0 h-full flex flex-col group cursor-pointer border border-white/5 hover:border-energy-pink/30 transition-all duration-500 overflow-hidden shadow-clay hover:shadow-energy-pink/10">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={getImageUrl(evt.imageUrl)}
                        alt={evt.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent opacity-60" />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-void/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest">
                         ₹{evt.price || 499}
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col gap-4">
                      <div className="space-y-2">
                        <h3 className="font-display font-bold text-lg text-white group-hover:text-energy-pink transition-colors line-clamp-1">
                          {evt.title}
                        </h3>
                        <p className="text-text-secondary text-xs flex items-center gap-1.5 line-clamp-1">
                          <MapPin size={12} className="text-energy-pink" />
                          {evt.venue?.name}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondary uppercase tracking-widest">
                           <Clock size={14} className="text-energy-pink" />
                           {new Date(evt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <ChevronRight size={18} className="text-energy-pink group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </ClayCard>
                </Link>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-64 bg-clay-surface/40 rounded-3xl border border-white/5 border-dashed"
            >
              <Calendar size={48} className="text-white/10 mb-4" />
              <p className="text-text-secondary text-sm">No major events scheduled for this {TABS.find(t => t.id === activeTab).day}.</p>
              <p className="text-text-secondary/50 text-xs mt-1">Check back soon for latest drops.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-12 flex justify-center">
         <Link to="/discover">
            <ClayButton variant="outline" className="px-8 border-white/10 text-text-secondary hover:text-white hover:border-white/30">
              View All Calendar Events
            </ClayButton>
         </Link>
      </div>
    </section>
  );
}
