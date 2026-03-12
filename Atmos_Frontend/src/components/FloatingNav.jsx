import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { House, Compass, Ticket, User, SignOut, Bell, CheckCircle } from "@phosphor-icons/react";
import { cn } from "../utils/cn";
import { logout, getUser } from "../services/authStore";
import { api } from "../services/api";
import { AnimatePresence } from "framer-motion";
import AtmosLogo from "./AtmosLogo";
import ClayCard from "./ClayCard";
import toast from "react-hot-toast";

export default function FloatingNav({ onAuthClick, isAuthenticated }) {
  const { scrollY } = useScroll();
  const scale = useTransform(scrollY, [0, 100], [1, 0.95]);
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const user = getUser();

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const { count } = await api.get(`/notifications/${user.id}/unread-count`);
      setUnreadCount(count);
      const list = await api.get(`/notifications/${user.id}`);
      setNotifications(list.slice(0, 5)); // show recent 5
    } catch (err) {}
  };

  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {}
  };

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

          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className={cn(
                  "p-2 rounded-full transition-all duration-300 relative",
                  showNotif ? "text-chill-blue" : "text-text-secondary hover:text-white"
                )}
                title="Notifications"
              >
                <Bell size={22} weight={unreadCount > 0 ? "fill" : "regular"} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-energy-pink text-[10px] font-bold flex items-center justify-center rounded-full text-white ring-2 ring-clay-surface">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotif && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-4 right-0 md:bottom-auto md:top-full md:mt-4 w-72 z-50"
                  >
                    <ClayCard className="p-0 overflow-hidden border border-white/10 shadow-2xl bg-void/90 backdrop-blur-2xl">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Notifications</span>
                            {unreadCount > 0 && <span className="text-[10px] text-chill-blue font-bold">{unreadCount} New</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary text-xs italic">
                                    No recent notifications.
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={cn(
                                            "p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer relative group",
                                            !notif.isRead && "bg-chill-blue/5"
                                        )}
                                        onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full mt-1.5 shrink-0",
                                                notif.isRead ? "bg-white/10" : "bg-chill-blue animate-pulse"
                                            )} />
                                            <div className="space-y-1">
                                                <p className="text-[11px] leading-relaxed text-text-primary">
                                                    {notif.message}
                                                </p>
                                                <span className="text-[9px] text-text-secondary font-medium uppercase tracking-tighter">
                                                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ClayCard>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

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
              onClick={() => { logout(); navigate('/'); toast.success("Signed out successfully."); }}
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
