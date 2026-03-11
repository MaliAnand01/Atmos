import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, ArrowUpRight } from "@phosphor-icons/react";
import ClayCard from "./ClayCard";
import { Link } from "react-router-dom";
import { getImageUrl } from "../services/api";

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScrollFeed({ events = [] }) {
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!section || !scrollContainer || !events || events.length === 0) return;

    // Refresh ScrollTrigger to ensure accurate measurements
    ScrollTrigger.refresh();

    const scrollWidth = scrollContainer.scrollWidth - window.innerWidth;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + (scrollWidth + window.innerHeight * 1.5), 
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      }
    });

    // Move first
    tl.to(scrollContainer, {
      x: -scrollWidth,
      ease: "none",
      duration: 1
    });

    // Then wait
    tl.to({}, { duration: 0.8 }); 

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(t => t.kill());
    };
  }, [events]);

  return (
    <div ref={sectionRef} className="min-h-screen w-full relative flex flex-col bg-void z-10 overflow-hidden py-24">
      {/* Proper Section Heading - Consistent with VenuesGrid */}
      <div className="w-full max-w-7xl mx-auto px-6 mb-12 relative z-20">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight">
          Trending Orbits
        </h2>
        <p className="text-text-secondary mt-2 text-lg">Top-tier frequencies detected near you.</p>
      </div>

      <div 
        ref={scrollContainerRef} 
        className="flex gap-12 px-6 md:px-12 lg:px-24 flex-nowrap items-center h-full will-change-transform min-w-full relative z-10"
      >
        {events && events.length > 0 ? (
          <>
            {events.map((evt, index) => (
              <div key={evt.id || index} className="w-[85vw] md:w-[45vw] lg:w-[35vw] flex-shrink-0 h-[60vh] group relative">
                <Link to={`/event/${evt.id}`}>
                  <ClayCard className="w-full h-full p-0 overflow-hidden relative cursor-pointer group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.8)] transition-all duration-700">
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={getImageUrl(evt.imageUrl)} 
                        alt={evt.title} 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-void via-void/40 to-transparent opacity-90" />
                    </div>

                    <div className="relative z-10 p-8 h-full flex flex-col justify-end">
                      <div className="mb-auto flex justify-between items-start">
                        <span className="px-3 py-1 bg-clay-surface/50 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-clay">
                          Level {evt.energyLevel}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <ArrowUpRight size={18} weight="bold" />
                        </div>
                      </div>

                      <div className="space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-left">
                        <h3 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow-md leading-tight">
                          {evt.title}
                        </h3>
                        <div className="flex items-center gap-4 text-text-secondary font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={18} className="text-chill-blue" />
                            <span>{evt.venue?.name}</span>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-energy-pink" />
                          <span className="text-sm font-display tracking-wide">{new Date(evt.dateTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </ClayCard>
                </Link>
              </div>
            ))}
            {/* Added Spacer so last card is fully visible with space at the end */}
            <div className="w-[10vw] md:w-[20vw] flex-shrink-0 h-1" />
          </>
        ) : (
          <div className="w-full flex justify-center items-center py-40">
            <p className="text-chill-blue text-2xl font-display animate-pulse">Waiting for signals...</p>
          </div>
        )}
      </div>
    </div>
  );
}
