import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { House, Compass, Ticket, User, SignOut } from "@phosphor-icons/react";
import { cn } from "../utils/cn";
import { logout } from "../services/authStore";
import AtmosLogo from "./AtmosLogo";

export default function FloatingNav({ onAuthClick, isAuthenticated }) {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Home", path: "/", icon: <House size={22} weight="fill" /> },
    { name: "Discover", path: "/discover", icon: <Compass size={22} weight="fill" /> },
    { name: "Tickets", path: "/tickets", icon: <Ticket size={22} weight="fill" /> },
  ];

  return (
    <>
      {/* Mobile-only top logo bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center px-5 py-3 bg-void/80 backdrop-blur-md border-b border-white/5">
        <AtmosLogo size="sm" />
      </div>

      {/* Main floating nav pill */}
      <motion.div
        style={{ scale }}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 z-50 transition-all duration-300"
      >
        <div className="flex items-center gap-3 bg-clay-surface rounded-full shadow-clay px-5 py-2.5 border border-white/5">
          {/* Brand logo — desktop only in pill */}
          <div className="hidden md:flex items-center pr-3 border-r border-white/10">
            <AtmosLogo size="sm" />
          </div>

          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "p-2 rounded-full transition-all duration-300 flex items-center gap-1.5",
                  isActive
                    ? "text-chill-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]"
                    : "text-text-secondary hover:text-text-primary"
                )}
                title={item.name}
              >
                {item.icon}
                {/* Active label on desktop */}
                {isActive && (
                  <span className="hidden md:inline text-xs font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}

          {/* Separator */}
          <div className="w-px h-5 bg-white/10 mx-1" />

          {/* User Auth Button */}
          <button
            onClick={() => isAuthenticated ? navigate('/dashboard') : onAuthClick()}
            className={cn(
              "p-2 rounded-full transition-all duration-300",
              location.pathname === "/dashboard"
                ? "text-energy-pink drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]"
                : "text-text-secondary hover:text-energy-pink hover:drop-shadow-[0_0_8px_rgba(255,0,127,0.8)]"
            )}
            title="Profile"
          >
            <User size={22} weight="fill" />
          </button>

          {isAuthenticated && (
            <button
              onClick={logout}
              className="p-2 rounded-full text-text-secondary hover:text-energy-pink transition-all duration-300"
              title="Sign Out"
            >
              <SignOut size={22} weight="fill" />
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
