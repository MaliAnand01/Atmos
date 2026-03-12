import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Draggable } from "gsap/all";

gsap.registerPlugin(Draggable);

export default function VibeSlider({ onVibeChange, initialLevel =  5}) {
  const trackRef = useRef(null);
  const knobRef = useRef(null);
  const [level, setLevel] = useState(initialLevel);
  const levelRef = useRef(level);

  useEffect(() => {
    levelRef.current = level;
  }, [level]);

  useEffect(() => {
    let debounceTimer;

    if (trackRef.current && knobRef.current) {
        const trackWidth = trackRef.current.clientWidth - knobRef.current.clientWidth;
        const initialX = ((level - 1) / 9) * trackWidth;
        gsap.set(knobRef.current, { x: initialX });
    }
    
    Draggable.create(knobRef.current, {
      type: "x",
      bounds: trackRef.current,
      inertia: true,
      onDrag: function() {
        const trackWidth = trackRef.current.clientWidth - knobRef.current.clientWidth;
        let p = this.x / trackWidth;
        p = Math.max(0, Math.min(1, p));
        
        const rawLevel = Math.round(p * 9) + 1;
        
        if (rawLevel !== levelRef.current) {
          setLevel(rawLevel);
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if(onVibeChange) onVibeChange(rawLevel);
          }, 300);
        }
      }
    });
    
    return () => {
      const draggables = Draggable.get(knobRef.current);
      if(draggables) draggables.kill();
      clearTimeout(debounceTimer);
    }
  }, [onVibeChange]);

  const getText = () => {
    if(level <= 3) return "Deep Chill / Acoustic";
    if(level <= 7) return "Balanced / Groove";
    return "High Energy / Club";
  };

  const getColor = () => {
    if(level <= 3) return '#00F0FF';
    if(level >= 8) return '#FF007F';
    return '#F8FAFC';
  };

  const getKnobBg = () => {
    if(level <= 3) return '#6366F1';
    if(level >= 8) return '#FF5E00';
    return '#1A1D24';
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 my-6 md:my-12 relative z-10">
      <div className="text-center">
        <h3 className="text-text-secondary font-display text-xl uppercase tracking-[0.2em] mb-2">Target Vibe</h3>
        <p className="text-4xl md:text-6xl font-display font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] transition-colors duration-500" style={{ color: getColor() }}>
          {level} <span className="text-3xl text-text-secondary">/ 10</span>
        </p>
        <p className="text-text-secondary mt-3 text-lg font-medium">{getText()}</p>
      </div>

      <div ref={trackRef} className="w-full h-16 md:h-24 bg-clay-surface rounded-full shadow-clay relative p-1.5 md:p-2 flex items-center box-border border border-white/5">
        <div 
          ref={knobRef} 
          className="w-12 h-12 md:w-20 md:h-20 rounded-full cursor-grab active:cursor-grabbing shadow-[inset_2px_2px_4px_rgba(255,255,255,0.1),_inset_-2px_-2px_4px_rgba(0,0,0,0.5),_0_0_16px_rgba(0,0,0,0.8)] relative z-20 transition-colors duration-500 flex items-center justify-center"
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
  );
}
