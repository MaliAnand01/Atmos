import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Filter, MapPin, Heart } from "lucide-react";
import { getUser } from "../services/authStore";
import ClayCard from "../components/ClayCard";
import ClayButton from "../components/ClayButton";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { api, getImageUrl } from "../services/api";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// Categories by energy ranges or genre
const ENERGY_CATEGORIES = [
  { label: "All", type: "all" },
  { label: "High Energy", type: "energy" },
  { label: "Balanced", type: "balanced" },
  { label: "Chill", type: "chill" },
];

// Genres from backend
const GENRE_CATEGORIES = ["Techno", "EDM", "Live Music", "Classical", "Acoustic", "Jazz", "Comedy"];

export default function Discover() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [debounced, setDebounced] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const user = getUser();

  const { register, watch, setValue } = useForm({
    defaultValues: {
      searchQuery: ""
    }
  });

  const searchQuery = watch("searchQuery");

  // Debounce search query
  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchQuery), 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Re-fetch when search query or category changes
  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, activeCategory]);

  useEffect(() => {
    if (user) {
      api.get(`/wishlist/${user.id}`).then(setWishlist).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      let data;
      if (debounced.trim()) {
        data = await api.get(`/events/search?q=${encodeURIComponent(debounced)}`);
      } else if (GENRE_CATEGORIES.includes(activeCategory)) {
        data = await api.get(`/events/category?name=${encodeURIComponent(activeCategory)}`);
      } else {
        data = await api.get('/events');
      }
      setEvents(data);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (eventId) => {
    if (!user) return toast.error("Please login to manage your wishlist!");
    
    const isCurrentlyWishlisted = wishlist.some(e => e.id === eventId);
    
    try {
      await api.post(`/wishlist/${user.id}/${eventId}`);
      
      if (isCurrentlyWishlisted) {
        setWishlist(prev => prev.filter(e => e.id !== eventId));
        toast.success("Removed from wishlist");
      } else {
        const event = events.find(e => e.id === eventId);
        setWishlist(prev => [...prev, event]);
        toast.success("Added to wishlist!");
      }
    } catch {
      toast.error("Action failed");
    }
  };

  const isInWishlist = (eventId) => wishlist.some(e => e.id === eventId);

  // Client-side energy filter for the 3 energy categories
  const filteredEvents = events.filter(evt => {
    if (GENRE_CATEGORIES.includes(activeCategory) || debounced.trim()) return true;
    if (activeCategory === "High Energy") return evt.energyLevel >= 8;
    if (activeCategory === "Chill") return evt.energyLevel <= 3;
    if (activeCategory === "Balanced") return evt.energyLevel > 3 && evt.energyLevel < 8;
    return true;
  });

  const allCategories = [
    ...ENERGY_CATEGORIES.map(c => c.label),
    ...GENRE_CATEGORIES,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4 }}
      className="bg-void min-h-screen pt-32 text-text-primary flex flex-col pb-28 md:pb-0"
    >
      <div className="max-w-7xl mx-auto px-6 w-full flex-grow mb-24">
        <h1 className="text-4xl md:text-7xl font-display font-bold mb-4 drop-shadow-sm text-transparent bg-clip-text bg-gradient-to-b from-white to-text-secondary/50">
          Discover
        </h1>
        <p className="text-text-secondary text-lg max-w-2xl mb-12">
          Find the best events, curated experiences, and top-tier venues for your next outing.
        </p>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
            <input 
              {...register("searchQuery")}
              type="text" 
              placeholder="Search events, venues, DJs..." 
              className="w-full bg-clay-surface border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-text-primary focus:outline-none focus:border-chill-blue focus:ring-1 focus:ring-chill-blue transition-all"
            />
          </div>
        </div>

        {/* Categories Carousel */}
        <div 
          className="flex overflow-x-auto gap-3 pb-4 mb-8"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
             {allCategories.map(category => (
                <button 
                  key={category}
                  onClick={() => { setActiveCategory(category); setValue("searchQuery", ""); }}
                  className={`px-6 py-2 rounded-full whitespace-nowrap transition-all duration-300 font-medium text-sm ${
                    activeCategory === category 
                      ? "bg-text-primary text-void shadow-clay scale-105"
                      : "bg-clay-surface border border-white/5 text-text-secondary hover:text-text-primary hover:border-white/20"
                  }`}
                >
                  {category}
                </button>
             ))}
        </div>

        {/* Events Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1,2,3,4,5,6].map(i => (
                <div key={i} className="h-72 bg-clay-surface rounded-3xl animate-pulse border border-white/5" />
              ))
            ) : filteredEvents.map((evt, i) => (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                   <ClayCard className="p-0 overflow-hidden group h-full flex flex-col">
                      <div className="relative h-48 overflow-hidden shrink-0">
                        <img 
                            src={getImageUrl(evt.imageUrl)} 
                            alt={evt.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-80" />

                         <div className="absolute top-4 right-4 flex gap-2 z-10">
                           <button 
                             onClick={(e) => { 
                               e.preventDefault(); 
                               e.stopPropagation(); 
                               toggleWishlist(evt.id); 
                             }}
                             className={`p-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
                                isInWishlist(evt.id) 
                                 ? "bg-energy-pink border-energy-pink/30 text-white shadow-clay scale-110" 
                                 : "bg-void/60 border-white/10 text-white hover:border-energy-pink/50"
                             }`}
                           >
                              <Heart size={16} fill={isInWishlist(evt.id) ? "currentColor" : "none"} />
                           </button>
                           <div className="bg-void/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 text-text-secondary uppercase tracking-tighter flex items-center justify-center leading-none">
                              Level {evt.energyLevel}
                           </div>
                        </div>
                        {evt.category && (
                          <div className="absolute top-4 left-4 bg-chill-blue/10 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold border border-chill-blue/20 text-chill-blue uppercase tracking-tighter z-10 flex items-center justify-center leading-none">
                            {evt.category}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-2xl font-display font-bold mb-2">{evt.title}</h3>
                          <div className="flex items-center gap-2 text-text-secondary mb-4 text-sm">
                            <MapPin size={16} className="text-chill-blue" />
                            <span>{evt.venue?.name}</span>
                            <span className="mx-1">•</span>
                            <span>{new Date(evt.dateTime).toLocaleDateString()}</span>
                          </div>
                          <div className="text-chill-blue font-bold mb-6">₹{evt.price ?? "—"}</div>

                          <div className="mt-auto pt-4 border-t border-white/5">
                              <Link to={`/event/${evt.id}`}>
                                <ClayButton className="w-full" variant="primary">
                                  View Details
                                </ClayButton>
                              </Link>
                          </div>
                      </div>
                   </ClayCard>
                </motion.div>
            ))}

            {!loading && filteredEvents.length === 0 && (
              <div className="col-span-full text-center py-24 bg-clay-surface rounded-3xl border border-white/5 text-text-secondary">
                 <span className="block text-4xl mb-4">🔍</span>
                 No events found.<br/>Try a different search or category.
              </div>
            )}
        </div>
      </div>

      <Footer />
    </motion.div>
  );
}
