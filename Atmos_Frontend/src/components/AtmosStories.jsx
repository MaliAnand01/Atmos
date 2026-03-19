import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import ClayCard from "./ClayCard";

const STORIES = [
  {
    name: "Aarav Sharma",
    role: "Techno Enthusiast",
    quote: "Atmos completely changed how I plan my weekends. The vibe-slider is a game changer—no more guessing the energy levels before reaching the club.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    vibe: "9.8"
  },
  {
    name: "Ishita Kapoor",
    role: "Lifestyle Blogger",
    quote: "I found the most incredible hidden speakeasy through Atmos. The curation is spot on—it's like having a local insider in your pocket.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
    vibe: "9.5"
  },
  {
    name: "Rohan Verma",
    role: "Event Organizer",
    quote: "As an organizer, the platform's reach and the seamless booking flow for my guests is unmatched. Highly recommend for pure nightlife vibes.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    vibe: "9.9"
  }
];

export default function AtmosStories() {
  return (
    <section className="py-12 px-6 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16 space-y-4">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="flex items-center justify-center gap-3"
        >
            <div className="w-12 h-[1px] bg-chill-blue/30" />
            <span className="text-chill-blue text-[10px] font-bold uppercase tracking-[0.4em]">Community Voice</span>
            <div className="w-12 h-[1px] bg-chill-blue/30" />
        </motion.div>
        <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight"
        >
            Atmos <span className="text-chill-blue">Stories.</span>
        </motion.h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STORIES.map((story, index) => (
          <motion.div
            key={story.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <ClayCard className="p-8 h-full flex flex-col gap-6 border border-white/5 hover:border-chill-blue/20 transition-all duration-500 shadow-clay">
              <div className="flex justify-between items-start">
                <div className="text-chill-blue/20">
                  <Quote size={40} fill="currentColor" />
                </div>
                <div className="px-3 py-1 rounded-full bg-void/40 border border-white/10 flex items-center gap-1.5 shadow-inner">
                    <Star size={10} className="fill-chill-blue text-chill-blue" />
                    <span className="text-[10px] font-bold text-white uppercase tracking-widest">{story.vibe} Vibe</span>
                </div>
              </div>

              <p className="text-text-secondary italic leading-relaxed text-sm">
                "{story.quote}"
              </p>

              <div className="mt-auto flex items-center gap-4 pt-6 border-t border-white/5">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-chill-blue/20 shadow-lg">
                  <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{story.name}</h4>
                  <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold font-display">{story.role}</p>
                </div>
              </div>
            </ClayCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
