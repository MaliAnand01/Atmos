import { useState, useEffect, useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  MapPin, 
  Users, 
  Star, 
  Flame,
  ArrowRight,
  Building2,
  Ticket
} from "lucide-react";
import { api } from "../services/api";
import VenueDetailModal from "./VenueDetailModal";
import { cn } from "../utils/cn";

gsap.registerPlugin(ScrollTrigger);

const BENTO_CLASSES = [
  "md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2", // 0: Large
  "md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1", // 1: Small
  "md:col-span-1 md:row-span-2 lg:col-span-1 lg:row-span-2", // 2: Tall
  "md:col-span-2 md:row-span-1 lg:col-span-2 lg:row-span-1", // 3: Wide
  "md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1", // 4: Small
  "md:col-span-1 md:row-span-2 lg:col-span-1 lg:row-span-2", // 5: Tall
];

export default function VenuesGrid() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoading(true);
        const data = await api.get('/venues');
        setVenues(data);
      } catch (error) {
        console.error("Failed to fetch venues:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  useEffect(() => {
    if (!loading && venues.length > 0) {
      // 1. Reset and Kill previous triggers
      cardsRef.current = cardsRef.current.filter(Boolean); // Clean up any nulls first
      
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.id?.includes('venuesGrid')) t.kill();
      });

      // 2. Initial sequence for grid entry

      // Entry animation for cards
      gsap.fromTo(cardsRef.current, 
        { 
          opacity: 0, 
          y: 50, 
          scale: 0.9,
          rotationX: 10
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          duration: 1.2,
          stagger: 0.1,
          ease: "expo.out",
          force3D: true,
          scrollTrigger: {
            id: 'venuesGrid',
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none none"
          }
        }
      );

      // Mobile Center-Stage Activation
      const mm = gsap.matchMedia();
      mm.add("(max-width: 768px)", () => {
        cardsRef.current.forEach((card, i) => {
          if (!card) return;
          
          const img = card.querySelector('img');
          const overlay = card.querySelector('.metadata-overlay');
          const button = card.querySelector('.action-btn');

          ScrollTrigger.create({
            id: `venuesGrid-mobile-${i}`,
            trigger: card,
            start: "top 85%",
            end: "bottom 15%",
            onEnter: () => {
              gsap.to(img, { scale: 1.1, duration: 0.6, ease: "power2.out" });
              gsap.to(overlay, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
              gsap.to(button, { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.7)" });
            },
            onEnterBack: () => {
              gsap.to(img, { scale: 1.1, duration: 0.6, ease: "power2.out" });
              gsap.to(overlay, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
              gsap.to(button, { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.7)" });
            },
            onLeave: () => {
              gsap.to(img, { scale: 1, duration: 0.5, ease: "power2.inOut" });
              gsap.to(overlay, { y: 20, opacity: 0, duration: 0.4, ease: "power2.in" });
              gsap.to(button, { opacity: 0, x: 20, duration: 0.3, ease: "power2.in" });
            },
            onLeaveBack: () => {
              gsap.to(img, { scale: 1, duration: 0.5, ease: "power2.inOut" });
              gsap.to(overlay, { y: 20, opacity: 0, duration: 0.4, ease: "power2.in" });
              gsap.to(button, { opacity: 0, x: 20, duration: 0.3, ease: "power2.in" });
            }
          });
        });
      });

      return () => mm.revert();
    }
  }, [loading, venues]);

  const handleVenueClick = useCallback((venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  }, []);

  const addToRefs = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  // Reset refs before rendering to avoid growing arrays
  cardsRef.current = [];

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-20 overflow-hidden" ref={containerRef}>
      {/* Cinematic Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-12 h-[1px] bg-chill-blue/50" />
             <span className="text-chill-blue text-[10px] font-bold uppercase tracking-[0.5em] font-display">Iconic Atmos Spaces</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-display font-bold text-white tracking-tighter leading-[0.9]">
            The World's <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-chill-blue via-energy-pink to-energy-pink/50">
               Elite Venues.
            </span>
          </h2>
        </div>
        
        <div className="lg:max-w-md space-y-6">
           <p className="text-text-secondary text-lg leading-relaxed font-light italic">
             "Architecture is the frozen music of the sphere. We've curated only the most resonant stages for your journey."
           </p>
           <button className="flex items-center gap-2 text-white font-bold uppercase tracking-widest text-[10px] group border-b border-white/10 pb-2 hover:border-chill-blue transition-colors">
              Explore All Spaces <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
      </div>

      {/* Bento Grid Layout (GSAP Powered) */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-[260px] md:auto-rows-[300px] grid-flow-dense">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn("bg-clay-surface/10 rounded-[2.5rem] animate-pulse border border-white/5", BENTO_CLASSES[i % BENTO_CLASSES.length])} />
          ))
        ) : venues.length > 0 ? (
          venues.map((venue, index) => {
            const bentoClass = BENTO_CLASSES[index % BENTO_CLASSES.length];
            const isLarge = bentoClass.includes("row-span-2") && bentoClass.includes("col-span-2");
            
            return (
              <div
                key={venue.id}
                ref={addToRefs}
                onClick={() => handleVenueClick(venue)}
                className={cn(
                  "relative group cursor-pointer overflow-hidden rounded-[2.5rem] bg-clay-surface shadow-clay border border-white/5 transition-all duration-500 will-change-transform active:scale-[0.97]",
                  bentoClass
                )}
                onMouseEnter={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  const overlay = e.currentTarget.querySelector('.metadata-overlay');
                  const button = e.currentTarget.querySelector('.action-btn');
                  gsap.to(img, { scale: 1.1, duration: 0.6, ease: "power2.out" });
                  gsap.to(overlay, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
                  gsap.to(button, { opacity: 1, x: 0, duration: 0.4, ease: "back.out(1.7)" });
                }}
                onMouseLeave={(e) => {
                  const img = e.currentTarget.querySelector('img');
                  const overlay = e.currentTarget.querySelector('.metadata-overlay');
                  const button = e.currentTarget.querySelector('.action-btn');
                  gsap.to(img, { scale: 1, duration: 0.5, ease: "power2.inOut" });
                  gsap.to(overlay, { y: 20, opacity: 0, duration: 0.4, ease: "power2.in" });
                  gsap.to(button, { opacity: 0, x: 20, duration: 0.3, ease: "power2.in" });
                }}
              >
                {/* Immersive Image Layer */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={venue.imageUrl || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&q=90"} 
                    alt={venue.name} 
                    className="w-full h-full object-cover transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent opacity-90 transition-opacity group-hover:opacity-80" />
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 p-8 md:p-10 flex flex-col justify-end">
                   {/* Meta Chips (Hover) */}
                   <div className="metadata-overlay flex flex-wrap gap-2 mb-6 opacity-0 translate-y-5">
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-clay">
                         <Users size={14} className="text-white" />
                         <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{venue.capacity}</span>
                      </div>
                      <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 shadow-clay">
                         <Ticket size={14} className="text-white" />
                         <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Book Now</span>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/60 text-[10px] font-bold uppercase tracking-[0.3em]">
                         <MapPin size={14} />
                         <span className="truncate">{venue.address?.split(',')[0] || "Atmos District"}</span>
                      </div>
                      <h3 className={cn(
                        "font-display font-bold text-white leading-[1.1] transition-transform duration-500",
                        isLarge ? "text-3xl md:text-5xl" : "text-xl md:text-2xl"
                      )}>
                        {venue.name}
                      </h3>
                   </div>

                   {/* Floating Action Button */}
                   <div className="action-btn absolute top-10 right-10 opacity-0 translate-x-10">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-void shadow-clay hover:scale-105 transition-transform active:scale-95">
                         <ArrowRight size={28} />
                      </div>
                   </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full h-64 flex items-center justify-center bg-clay-surface/5 rounded-[3rem] border border-white/5 border-dashed">
             <div className="text-center space-y-4">
                <Building2 size={48} className="mx-auto text-white/5" />
                <p className="text-text-secondary font-display uppercase tracking-widest text-sm italic">"The stage is being set..."</p>
             </div>
          </div>
        )}
      </div>

      <VenueDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        venue={selectedVenue} 
      />
    </div>
  );
}
