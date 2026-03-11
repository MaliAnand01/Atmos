import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { House, Compass, Ticket, User, SignOut } from "@phosphor-icons/react";
import { cn } from "../utils/cn";
import { logout } from "../services/authStore";

export default function FloatingNav({ onAuthClick, isAuthenticated }) {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/", icon: <House size={24} weight="fill" /> },
    { name: "Discover", path: "/discover", icon: <Compass size={24} weight="fill" /> },
    { name: "Tickets", path: "/tickets", icon: <Ticket size={24} weight="fill" /> },
  ];

  return (
    <motion.div
      style={{ scale }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 z-50 transition-all duration-300"
    >
      <div className="flex items-center gap-4 bg-clay-surface rounded-full shadow-clay px-6 py-3 border border-white/5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={cn(
                "p-2 rounded-full transition-all duration-300 relative",
                isActive 
                  ? "text-chill-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" 
                  : "text-text-secondary hover:text-text-primary"
              )}
            >
              {item.icon}
            </Link>
          );
        })}
        
        {/* Separator */}
        <div className="w-px h-6 bg-white/10 mx-2" />

        {/* User Auth Button */}
        <button
          onClick={() => isAuthenticated ? navigate('/dashboard') : onAuthClick()}
          className={cn(
            "p-2 rounded-full transition-all duration-300",
            location.pathname === "/dashboard" 
               ? "text-energy-pink drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]" 
               : "text-text-secondary hover:text-energy-pink hover:drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]"
          )}
        >
          <User size={24} weight="fill" />
        </button>

        {isAuthenticated && (
          <button
            onClick={logout}
            className="p-2 rounded-full text-text-secondary hover:text-energy-pink transition-all duration-300"
            title="Sign Out"
          >
            <SignOut size={24} weight="fill" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
