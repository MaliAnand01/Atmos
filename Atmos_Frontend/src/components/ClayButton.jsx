import { motion } from "framer-motion";
import { cn } from "../utils/cn";

export default function ClayButton({
  children,
  className,
  variant = "primary",
  ...props
}) {
  const baseStyles = "relative inline-flex items-center justify-center rounded-full font-display font-medium tracking-wide transition-all focus:outline-none";
  
  // Custom clay shadow setup using classes defined in index.css or via Tailwind
  const variants = {
    primary: "bg-clay-surface text-text-primary shadow-clay hover:opacity-90",
    secondary: "bg-transparent text-text-secondary border border-clay-surface hover:text-text-primary",
    accent: "bg-chill-blue text-void font-bold shadow-clay hover:opacity-90",
    danger: "bg-energy-pink text-void font-bold shadow-clay hover:opacity-90",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={cn(baseStyles, variants[variant] || variants.primary, "px-6 py-3", className)}
      {...props}
    >
      {children}
    </motion.button>
  );
}
