import { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, ArrowUpRight } from "@phosphor-icons/react";
import ClayCard from "./ClayCard";
import { Link } from "react-router-dom";
import { getImageUrl } from "../services/api";

gsap.registerPlugin(ScrollTrigger);

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function HorizontalScrollFeed({ events = [] }) {
  const sectionRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Desktop-only: GSAP horizontal scroll pinning
    if (isMobile) return;

    const section = sectionRef.current;
    const scrollContainer = scrollContainerRef.current;
    if (!section || !scrollContainer || !events || events.length === 0) return;

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

    tl.to(scrollContainer, {
      x: -scrollWidth,
      ease: "none",
      duration: 1
    });

    tl.to({}, { duration: 0.8 });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().filter(st => st.trigger === section).forEach(t => t.kill());
    };
  }, [events, isMobile]);

  return (
    <div
      ref={sectionRef}
      className="w-full relative flex flex-col bg-void z-10 overflow-hidden py-16 md:py-24 min-h-0 md:min-h-screen"
    >
      {/* Section Header */}
      <div className="w-full max-w-7xl mx-auto px-6 mb-8 md:mb-12 relative z-20">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-text-primary uppercase tracking-tight">
          Trending Events
        </h2>
        <p className="text-text-secondary mt-2 text-base md:text-lg">Top events happening near you.</p>
      </div>

      {/* Card Strip */}
      <div
        ref={scrollContainerRef}
        className={`flex gap-6 md:gap-12 px-6 md:px-12 lg:px-24 flex-nowrap items-center will-change-transform min-w-full relative z-10 ${
          isMobile
            ? "overflow-x-auto pb-4 snap-x snap-mandatory"
            : ""
        }`}
        style={isMobile ? { scrollbarWidth: "none", msOverflowStyle: "none" } : {}}
      >
        {events && events.length > 0 ? (
          <>
            {events.map((evt, index) => (
              <div
                key={evt.id || index}
                className="w-[78vw] md:w-[45vw] lg:w-[35vw] flex-shrink-0 h-[52vh] md:h-[60vh] group relative snap-start"
              >
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

                    <div className="relative z-10 p-6 md:p-8 h-full flex flex-col justify-end">
                      <div className="mb-auto flex justify-between items-start">
                        <span className="px-3 py-1 bg-clay-surface/50 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-clay">
                          Energy Level {evt.energyLevel}
                        </span>
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                          <ArrowUpRight size={18} weight="bold" />
                        </div>
                      </div>

                      <div className="space-y-2 md:space-y-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-left">
                        <h3 className="text-xl md:text-3xl lg:text-4xl font-display font-bold text-white drop-shadow-md leading-tight line-clamp-2">
                          {evt.title}
                        </h3>
                        <div className="flex items-center gap-3 md:gap-4 text-text-secondary font-medium flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={16} className="text-chill-blue" />
                            <span className="text-sm">{evt.venue?.name}</span>
                          </div>
                          <span className="w-1.5 h-1.5 rounded-full bg-energy-pink hidden sm:inline-block" />
                          <span className="text-xs font-display tracking-wide">{new Date(evt.dateTime).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </ClayCard>
                </Link>
              </div>
            ))}
            <div className="w-6 md:w-[20vw] flex-shrink-0 h-1" />
          </>
        ) : (
          <div className="w-full flex justify-center items-center py-32">
            <p className="text-chill-blue text-2xl font-display animate-pulse">Loading events...</p>
          </div>
        )}
      </div>
    </div>
  );
}
