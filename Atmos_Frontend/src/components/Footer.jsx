import AtmosLogo from "./AtmosLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { getUser } from "../services/authStore";
import { Instagram, Twitter, MessageCircle, ArrowRight } from "lucide-react";
import ClayButton from "./ClayButton";
import InfoModal from "./InfoModal";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);
  const [infoModal, setInfoModal] = useState({ isOpen: false, type: null });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newsletterSchema),
  });

  const user = getUser();

  const onSubscribe = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSubscribed(true);
    reset();
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="w-full pt-16 px-4 pb-24 md:pb-8 relative z-10 bg-void overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#14161E] rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center flex flex-col items-center border border-white/5 shadow-clay relative overflow-hidden group">
          
          {/* Subtle Glow Background */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1/2 bg-chill-blue/5 blur-[120px] pointer-events-none group-hover:bg-energy-pink/5 transition-colors duration-1000" />

          {/* Brand Logo */}
          <div className="mb-6 relative">
            <AtmosLogo size="lg" />
            <div className="absolute -inset-4 bg-white/5 blur-xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <p className="text-text-secondary max-w-md mb-12 text-base sm:text-lg px-2 leading-relaxed">
            {user 
              ? `Welcome back, ${user.username || 'Atmos Member'}. You're already ahead of the curve. Join our community for exclusive early access.`
              : "The new standard for nightlife. Find the perfect venue for your next event, curated just for you."
            }
          </p>

          {/* Dynamic Newsletter/CTA Section */}
          <div className="w-full max-w-lg flex flex-col items-center gap-6">
            {!user ? (
              <div className="w-full flex flex-col gap-3">
                <form 
                  onSubmit={handleSubmit(onSubscribe)}
                  className="w-full bg-void/50 backdrop-blur-md rounded-2xl sm:rounded-full shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.02)] border border-white/5 flex flex-col sm:flex-row gap-2 p-2 group/input focus-within:border-chill-blue/30 transition-all"
                >
                  <input
                    {...register("email")}
                    type="text"
                    placeholder={subscribed ? "Check your inbox!" : "Enter your email for early access"}
                    className={`flex-1 bg-transparent px-6 py-3 text-text-primary focus:outline-none placeholder:text-text-secondary/40 min-w-0 ${subscribed ? "text-chill-blue font-bold" : ""}`}
                  />
                  <button 
                    disabled={isSubmitting}
                    className="bg-clay-surface hover:bg-white/10 hover:text-white px-8 py-3 rounded-xl sm:rounded-full text-text-secondary font-bold transition-all shadow-clay whitespace-nowrap text-sm disabled:opacity-50 active:scale-95"
                  >
                    {isSubmitting ? "Sending..." : subscribed ? "Subscribed!" : "Subscribe"}
                  </button>
                </form>
                {errors.email && <p className="text-energy-pink text-[10px] font-bold tracking-tight">{errors.email.message}</p>}
                {!errors.email && !subscribed && <p className="text-text-secondary/30 text-[10px] uppercase tracking-widest">No spam. Only the best vibes.</p>}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
                 <a href="https://discord.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                    <button className="w-full bg-void/40 hover:bg-void/60 text-text-secondary hover:text-white px-8 py-4 rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all shadow-clay group/btn">
                        <MessageCircle size={24} className="group-hover:text-[#5865F2] transition-colors" />
                        <span className="font-bold text-sm">Join Discord</span>
                    </button>
                 </a>
                 <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                    <button className="w-full bg-void/40 hover:bg-void/60 text-text-secondary hover:text-white px-8 py-4 rounded-2xl border border-white/5 flex items-center justify-center gap-3 transition-all shadow-clay group/btn">
                        <Twitter size={24} className="group-hover:text-[#1DA1F2] transition-colors" />
                        <span className="font-bold text-sm">Follow Atmos</span>
                    </button>
                 </a>
              </div>
            )}
          </div>

          {/* Footer links */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-text-secondary/60 relative z-10">
            <button 
                onClick={() => setInfoModal({ isOpen: true, type: 'privacy' })}
                className="hover:text-text-primary transition-colors"
            >
                Privacy Policy
            </button>
            <button 
                onClick={() => setInfoModal({ isOpen: true, type: 'terms' })}
                className="hover:text-text-primary transition-colors"
            >
                Terms of Service
            </button>
            <button 
                onClick={() => setInfoModal({ isOpen: true, type: 'contact' })}
                className="hover:text-text-primary transition-colors"
            >
                Contact
            </button>
            <p>© {new Date().getFullYear()} Atmos. All rights reserved.</p>
          </div>
        </div>
      </div>

      <InfoModal 
        isOpen={infoModal.isOpen} 
        type={infoModal.type} 
        onClose={() => setInfoModal(prev => ({ ...prev, isOpen: false }))} 
      />
    </footer>
  );
}
