import { motion } from "framer-motion";
import { cn } from "../utils/cn";
import useSound from "use-sound";

const CLICK_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3";

export default function ClayButton({
  children,
  className,
  variant = "primary",
  ...props
}) {
  const baseStyles = "relative inline-flex items-center justify-center rounded-full font-display font-medium tracking-wide transition-all focus:outline-none";
  
  // Custom clay shadow setup using classes defined in index.css or via Tailwind
  const variants = {
    primary: "bg-clay-surface text-text-primary shadow-clay hover:opacity-90 border border-white/5",
    secondary: "bg-transparent text-text-secondary border border-clay-surface hover:text-text-primary hover:bg-white/5",
    accent: "bg-chill-blue text-void font-bold shadow-clay hover:opacity-90",
    danger: "bg-energy-pink text-void font-bold shadow-clay hover:opacity-90",
    ghost: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 border-none",
    icon: "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5 border-none p-2 w-auto h-auto",
  };

  const [playClick] = useSound(CLICK_SOUND_URL, { volume: 0.2 });

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(baseStyles, variants[variant] || variants.primary, variant !== 'icon' && "px-6 py-3", className)}
      {...props}
      onClick={(e) => {
        playClick();
        if (props.onClick) props.onClick(e);
      }}
    >
      {children}
    </motion.button>
  );
}
