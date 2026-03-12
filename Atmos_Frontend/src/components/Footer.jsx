import AtmosLogo from "./AtmosLogo";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export default function Footer() {
  const [subscribed, setSubscribed] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(newsletterSchema),
  });

  const onSubscribe = async (data) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Subscribed:", data.email);
    setSubscribed(true);
    reset();
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="w-full pt-16 px-4 pb-24 md:pb-8 relative z-10 bg-void overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#14161E] rounded-[2rem] md:rounded-[3rem] p-6 sm:p-12 md:p-20 text-center flex flex-col items-center border border-white/5 shadow-clay">

          {/* Brand Logo */}
          <div className="mb-4">
            <AtmosLogo size="lg" />
          </div>

          <p className="text-text-secondary max-w-md mb-10 text-base sm:text-lg px-2">
            The new standard for nightlife. Find the perfect venue for your next event, curated just for you.
          </p>

          {/* Newsletter */}
          <div className="w-full max-w-md flex flex-col gap-2">
            <form 
              onSubmit={handleSubmit(onSubscribe)}
              className="w-full bg-void rounded-2xl sm:rounded-full shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.05)] border border-white/5 flex flex-col sm:flex-row gap-2 p-2"
            >
              <input
                {...register("email")}
                type="text"
                placeholder={subscribed ? "Check your inbox!" : "Enter your email"}
                className={`flex-1 bg-transparent px-5 py-3 text-text-primary focus:outline-none placeholder:text-text-secondary/50 min-w-0 ${subscribed ? "text-chill-blue font-bold" : ""}`}
              />
              <button 
                disabled={isSubmitting}
                className="bg-clay-surface hover:bg-white/10 hover:text-white px-6 py-3 rounded-xl sm:rounded-full text-text-secondary font-medium transition-colors shadow-clay whitespace-nowrap text-sm disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : subscribed ? "Subscribed!" : "Subscribe"}
              </button>
            </form>
            {errors.email && <p className="text-energy-pink text-[10px] mt-1">{errors.email.message}</p>}
            {!errors.email && <p className="text-text-secondary/40 text-xs text-center">No spam. Unsubscribe anytime.</p>}
          </div>

          {/* Footer links */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-text-secondary/60">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
            <p>© {new Date().getFullYear()} Atmos. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
