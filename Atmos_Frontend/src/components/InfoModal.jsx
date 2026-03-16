import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, FileText, MessageSquare, Twitter, MailOpen, ArrowRight, MessageCircle } from "lucide-react";
import ClayCard from "./ClayCard";
import { cn } from "../utils/cn";

const CONTENT = {
  privacy: {
    title: "Privacy Policy",
    subtitle: "Your Vibe, Your Privacy",
    icon: <ShieldCheck size={32} className="text-chill-blue" />,
    body: (
      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h4 className="text-text-primary font-bold mb-2 uppercase tracking-tighter">01. Data Collection</h4>
          <p>We only collect what’s necessary to deliver the Atmos experience. This includes your basic profile info and your event preferences to curate the perfect night out.</p>
        </section>
        <section>
          <h4 className="text-text-primary font-bold mb-2 uppercase tracking-tighter">02. Usage</h4>
          <p>Your data is used to improve our vibe-matching algorithms and ensure seat bookings are seamless. We never sell your data to third parties. Ever.</p>
        </section>
        <section>
          <h4 className="text-text-primary font-bold mb-2 uppercase tracking-tighter">03. Security</h4>
          <p>We use industry-standard encryption for all transactions and sensitive data. Your digital safety is our top priority.</p>
        </section>
      </div>
    )
  },
  terms: {
    title: "Terms of Service",
    subtitle: "The Atmos Code",
    icon: <FileText size={32} className="text-energy-pink" />,
    body: (
      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h4 className="text-text-primary font-bold mb-2 uppercase tracking-tighter">01. Membership</h4>
          <p>By using Atmos, you agree to respect the venues and fellow members. We maintain a high-standard community for nightlife lovers.</p>
        </section>
        <section>
          <h4 className="text-text-primary font-bold mb-2 uppercase tracking-tighter">02. Bookings</h4>
          <p>All bookings are final unless stated otherwise by the venue. Atmos facilitates the connection but venue-specific rules apply to each event.</p>
        </section>
        <section>
          <h4 className="text-text-primary font-bold mb-2 uppercase tracking-tighter">03. Conduct</h4>
          <p>Any misuse of the platform, including fraudulent bookings or harassment, will result in immediate termination of your membership.</p>
        </section>
      </div>
    )
  },
  contact: {
    title: "Get in Touch",
    subtitle: "Let's Talk Vibe",
    icon: <MessageSquare size={32} className="text-chill-blue" />,
    body: (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-void/40 border border-white/5 hover:border-chill-blue/30 transition-all group shadow-clay">
                <div className="p-3 rounded-xl bg-chill-blue/10 text-chill-blue group-hover:bg-chill-blue group-hover:text-white transition-all">
                    <MessageCircle size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">Community</p>
                    <p className="text-sm font-bold text-text-primary">Discord</p>
                </div>
            </a>
            <a href="#" className="flex items-center gap-4 p-4 rounded-2xl bg-void/40 border border-white/5 hover:border-energy-pink/30 transition-all group shadow-clay">
                <div className="p-3 rounded-xl bg-energy-pink/10 text-energy-pink group-hover:bg-energy-pink group-hover:text-white transition-all">
                    <MailOpen size={24} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-text-secondary uppercase">Email Us</p>
                    <p className="text-sm font-bold text-text-primary">support@atmos.io</p>
                </div>
            </a>
        </div>
        
        <form className="space-y-4 pt-4 border-t border-white/5" onSubmit={(e) => { e.preventDefault(); }}>
            <div className="space-y-2">
                <label className="text-[10px] font-bold text-text-secondary uppercase ml-1">Quick Message</label>
                <div className="relative group">
                    <textarea 
                        placeholder="What's on your mind?" 
                        rows={3}
                        className="w-full bg-void/50 rounded-2xl border border-white/5 p-4 text-sm text-text-primary focus:outline-none focus:border-chill-blue transition-all shadow-inner"
                    />
                </div>
            </div>
            <button className="w-full bg-chill-blue text-void font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-clay active:scale-[0.98]">
                Submit Query
                <ArrowRight size={18} />
            </button>
        </form>
      </div>
    )
  }
};

export default function InfoModal({ type, isOpen, onClose }) {
  if (!type || !CONTENT[type]) return null;

  const data = CONTENT[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-void/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl relative"
          >
            <ClayCard className="p-0 overflow-hidden border border-white/10 shadow-2xl relative">
                {/* Header Section */}
                <div className="p-8 sm:p-12 pb-6 border-b border-white/5 bg-white/[0.02] flex flex-col items-center text-center">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-text-secondary hover:text-white transition-all shadow-clay"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="mb-4 p-4 rounded-[2rem] bg-white/[0.03] shadow-inner border border-white/5">
                        {data.icon}
                    </div>
                    
                    <h2 className="text-3xl font-display font-bold text-text-primary mb-2 tracking-tight">
                        {data.title}
                    </h2>
                    <p className="text-chill-blue text-[10px] font-bold uppercase tracking-[0.2em]">
                        {data.subtitle}
                    </p>
                </div>

                {/* Body Content */}
                <div className="p-8 sm:p-12 pt-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {data.body}
                </div>

                {/* Footer Deco */}
                <div className="p-4 border-t border-white/5 bg-void/40 flex justify-center">
                    <p className="text-text-secondary/20 text-[10px] uppercase font-bold tracking-widest">Atmos Protocol</p>
                </div>
            </ClayCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
