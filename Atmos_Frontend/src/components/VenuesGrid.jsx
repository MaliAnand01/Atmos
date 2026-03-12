import { useState, useEffect } from "react";
import ClayCard from "./ClayCard";
import { api } from "../services/api";
import VenueDetailModal from "./VenueDetailModal";
import { Fire, HouseLine } from "@phosphor-icons/react";

export default function VenuesGrid() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const data = await api.get('/venues');
        setVenues(data);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
      }
    };
    fetchVenues();
  }, []);

  const handleVenueClick = (venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-24">
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary">Featured Venues</h2>
        <p className="text-text-secondary mt-2 text-lg">The best spaces for any vibe.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-auto sm:auto-rows-[300px]">
        {venues.map((venue, index) => {
          const isLarge = index === 0 || index === 5;
          const isTall = index === 2 || index === 6;

          return (
            <ClayCard 
              key={venue.id}
              onClick={() => handleVenueClick(venue)}
              className={`p-0 relative group cursor-pointer overflow-hidden transform transition-all hover:ring-2 hover:ring-white/20 ${
                isLarge ? "md:col-span-2 lg:col-span-2 lg:row-span-2" : ""
              } ${isTall ? "lg:row-span-2" : ""}`}
            >
              <img 
                src={venue.imageUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80"} 
                alt={venue.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent/10 opacity-90" />
              <div className={`${isLarge ? "absolute bottom-8 left-8 right-8" : "absolute bottom-6 left-6 right-6"} text-white z-10`}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {isLarge && (
                    <span className="bg-chill-blue text-void text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1">
                      <HouseLine size={12} weight="fill" /> Top Rated
                    </span>
                  )}
                  {index % 3 === 0 && (
                    <span className="bg-energy-pink text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full tracking-wider flex items-center gap-1 animate-pulse shadow-lg shadow-energy-pink/20">
                      <Fire size={12} weight="fill" /> Trending
                    </span>
                  )}
                </div>
                <h3 className={`${isLarge ? "text-3xl mt-3" : "text-xl"} font-display font-bold mb-1`}>{venue.name}</h3>
                <p className="text-text-secondary text-sm">
                  {venue.address} • {venue.capacity} Capacity
                </p>
              </div>
            </ClayCard>
          );
        })}

        {venues.length === 0 && (
          <div className="col-span-full text-center py-20 text-text-secondary">
            No venues found yet.
          </div>
        )}
      </div>

      {selectedVenue && (
        <VenueDetailModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          venue={selectedVenue} 
        />
      )}
    </div>
  );
}
