import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { useLenis } from "lenis/react";
import { cn } from "../utils/cn";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.5 });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          whileHover={{ scale: 1.1, translateY: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className={cn(
            "fixed bottom-24 right-6 md:bottom-8 md:right-8 z-[60]",
            "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center",
            "bg-clay-surface/80 backdrop-blur-xl border border-white/10 text-white",
            "shadow-clay hover:shadow-chill-blue/20 transition-all duration-300",
            "group overflow-hidden"
          )}
          aria-label="Scroll to top"
        >
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-chill-blue/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <ArrowUp 
            size={24} 
            className="relative z-10 group-hover:animate-bounce" 
            strokeWidth={2.5} 
          />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
