import { motion } from "framer-motion";
import { Sparkles, Zap, ShieldCheck } from "lucide-react";
import ClayCard from "./ClayCard";

const PILLARS = [
  {
    title: "Curated Experiences",
    description: "Not every venue makes the cut. We hand-pick only the most exceptional spaces with proven vibes.",
    icon: <Sparkles className="text-chill-blue" size={32} />,
    color: "from-chill-blue/20 to-transparent"
  },
  {
    title: "Vibe-First Logic",
    description: "Search by energy level, not just category. Find exactly where you belong tonight, instantly.",
    icon: <Zap className="text-purple-400" size={32} />,
    color: "from-purple-400/20 to-transparent"
  },
  {
    title: "Instant Access",
    description: "Seamless bookings and digital guestlist entry. Your night starts the moment you tap 'Book'.",
    icon: <ShieldCheck className="text-energy-pink" size={32} />,
    color: "from-energy-pink/20 to-transparent"
  }
];

export default function VibePillars() {
  return (
    <section className="py-10 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        {PILLARS.map((pillar, index) => (
          <motion.div
            key={pillar.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
          >
            <ClayCard className="h-full group hover:border-white/20 transition-all duration-500 overflow-hidden">
              {/* Subtle background glow */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full bg-gradient-to-br ${pillar.color} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
              
              <div className="relative z-10 space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                  {pillar.icon}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-display font-bold text-white tracking-tight">
                    {pillar.title}
                  </h3>
                  <p className="text-text-secondary text-sm leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
                
                <div className="pt-2">
                    <div className="h-px w-12 bg-white/10 group-hover:w-full transition-all duration-700" />
                </div>
              </div>
            </ClayCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
