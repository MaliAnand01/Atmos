import { cn } from "../utils/cn";
import { motion } from "framer-motion";

export default function ClayCard({ children, className, animate = false, ...props }) {
  const Component = animate ? motion.div : "div";
  
  return (
    <Component
      className={cn(
        "bg-clay-surface rounded-3xl shadow-clay p-6 overflow-hidden relative",
        className
      )}
      {...props}
    >
      {/* Decorative inner glow highlighting top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5" />
      
      {children}
    </Component>
  );
}
