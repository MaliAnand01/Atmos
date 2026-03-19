import { useEffect, useRef, useState, useCallback, memo } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/all";
import { motion, AnimatePresence } from "framer-motion";
import { MousePointer2 } from "lucide-react";

gsap.registerPlugin(Draggable);

const VibeSlider = memo(({ onVibeChange, initialLevel = 5, showHint = false }) => {
  const trackRef = useRef(null);
  const knobRef = useRef(null);
  
  // Local state for immediate UI feedback without re-rendering parent
  const [localLevel, setLocalLevel] = useState(initialLevel);
  const localLevelRef = useRef(initialLevel);

  useEffect(() => {
    let debounceTimer;

    if (trackRef.current && knobRef.current) {
        const trackWidth = trackRef.current.clientWidth - knobRef.current.clientWidth;
        const initialX = ((initialLevel - 1) / 9) * trackWidth;
        gsap.set(knobRef.current, { x: initialX });
    }
    
    Draggable.create(knobRef.current, {
      type: "x",
      bounds: trackRef.current,
      edgeResistance: 0.65,
      inertia: true,
      onDrag: function() {
        const trackWidth = trackRef.current.clientWidth - knobRef.current.clientWidth;
        let p = this.x / trackWidth;
        p = Math.max(0, Math.min(1, p));
        
        const rawLevel = Math.round(p * 9) + 1;
        
        // Update local state only if changed to avoid unnecessary re-renders
        if (rawLevel !== localLevelRef.current) {
          localLevelRef.current = rawLevel;
          setLocalLevel(rawLevel);
          
          // Debounce the heavy parent state update / API fetch
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if(onVibeChange) onVibeChange(rawLevel);
          }, 150);
        }
      }
    });
    
    return () => {
      const draggables = Draggable.get(knobRef.current);
      if(draggables) draggables.kill();
      clearTimeout(debounceTimer);
    }
  }, [onVibeChange]); // initialLevel intentionally omitted to avoid reset on parent sync

  const getText = () => {
    if(localLevel <= 3) return "Chill / Relaxed";
    if(localLevel <= 7) return "Balanced / Groove";
    return "High Energy / Intense";
  };

  const getColor = () => {
    if(localLevel <= 3) return '#00F0FF';
    if(localLevel >= 8) return '#FF007F';
    return '#F8FAFC';
  };

  const getKnobBg = () => {
    if(localLevel <= 3) return '#6366F1';
    if(localLevel >= 8) return '#FF5E00';
    return '#1A1D24';
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 my-6 md:my-12 relative z-10 will-change-contents">
      <div className="text-center pointer-events-none select-none">
        <h3 className="text-text-secondary font-display text-xl uppercase tracking-[0.2em] mb-2">Energy Level</h3>
        <p className="text-4xl md:text-6xl font-display font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] transition-colors duration-500" style={{ color: getColor() }}>
          {localLevel} <span className="text-3xl text-text-secondary">/ 10</span>
        </p>
        <p className="text-text-secondary mt-3 text-lg font-medium">{getText()}</p>
      </div>

      <div className="w-full relative">
        {/* Tooltip Discovery Hint */}
        <AnimatePresence>
          {showHint && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute -top-16 left-1/2 -translate-x-1/2 bg-white text-void px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-3 z-50 whitespace-nowrap border border-white/20"
            >
              <MousePointer2 size={14} className="animate-bounce" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Discover Your Vibe</span>
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={trackRef} className="w-full h-16 md:h-24 bg-clay-surface rounded-full shadow-clay relative p-1.5 md:p-2 flex items-center box-border border border-white/5">
          <div 
            ref={knobRef} 
            className="w-12 h-12 md:w-20 md:h-20 rounded-full cursor-grab active:cursor-grabbing shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),_inset_-2px_-2px_4px_rgba(0,0,0,0.5),_0_0_16px_rgba(0,0,0,0.8)] relative z-20 transition-colors duration-500 flex items-center justify-center will-change-transform"
            style={{
              backgroundColor: getKnobBg(),
              border: `2px solid ${getColor()}`
            }}
          >
            <div className="w-8 h-8 rounded-full bg-white opacity-20 blur-[4px]" />
            <div className="absolute w-2 h-8 flex gap-1 items-center justify-center">
               <div className="w-0.5 h-4 bg-white/50 rounded-full" />
               <div className="w-0.5 h-4 bg-white/50 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default VibeSlider;
