import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Compass, Ticket, User, LogOut, Bell } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "../utils/cn";
import { logout, getUser, isLoggedIn } from "../services/authStore";
import { api } from "../services/api";
import AtmosLogo from "./AtmosLogo";
import ClayCard from "./ClayCard";
import toast from "react-hot-toast";
import { useUI } from "../context/UIContext";

gsap.registerPlugin(ScrollTrigger);

export default function FloatingNav() {
  const { state, dispatch } = useUI();
  const { isAuthenticated, unreadCount, notifications } = state;
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const pillRef = useRef(null);
  const notifRef = useRef(null);
  const user = getUser();

  // No GSAP positioning used here to avoid conflicts with CSS centering
  useEffect(() => {
    // ScrollTrigger only for any non-positioning animations if needed
  }, []);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const countRes = await api.get(`/notifications/${user.id}/unread-count`);
      const list = await api.get(`/notifications/${user.id}`);
      dispatch({ 
        type: 'SET_NOTIFICATIONS', 
        payload: { 
          count: countRes?.count ?? 0, 
          list: Array.isArray(list) ? list.slice(0, 5) : [] 
        } 
      });
    } catch (err) {}
  };

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
    // Sync auth state in Context on mount/location change
    const logged = isLoggedIn();
    if (logged !== isAuthenticated) {
        dispatch({ type: 'SET_AUTH', payload: { isAuthenticated: logged, user: getUser() } });
    }
    
    if (logged) {
      fetchNotifs();
      const interval = setInterval(fetchNotifs, 30000);
      return () => clearInterval(interval);
    }
  }, [location.pathname, isAuthenticated, dispatch]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      dispatch({ type: 'MARK_READ', payload: id });
    } catch (err) {}
  };

  const navItems = [
    { name: "Home", path: "/", icon: <Home size={22} /> },
    { name: "Discover", path: "/discover", icon: <Compass size={22} /> },
    { name: "Tickets", path: "/tickets", icon: <Ticket size={22} /> },
  ];

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center px-5 py-3 bg-void/80 backdrop-blur-md border-b border-white/5">
        <AtmosLogo size="sm" />
      </div>

      <div
        ref={pillRef}
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 md:bottom-auto md:top-6 z-50 will-change-transform"
      >
        <div className="flex items-center gap-3 bg-clay-surface rounded-full shadow-clay px-5 py-2.5 border border-white/5">
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
                  isActive ? "text-chill-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]" : "text-text-secondary hover:text-text-primary"
                )}
                title={item.name}
              >
                {item.icon}
                {isActive && <span className="hidden md:inline text-xs font-medium">{item.name}</span>}
              </Link>
            );
          })}

          <div className="w-px h-5 bg-white/10 mx-1" />

          {isAuthenticated && (
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className={cn("p-2 rounded-full transition-all duration-300 relative", showNotif ? "text-chill-blue" : "text-text-secondary hover:text-white")}
              >
                <Bell size={22} fill={unreadCount > 0 ? "currentColor" : "none"} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-energy-pink text-[10px] font-bold flex items-center justify-center rounded-full text-white ring-2 ring-clay-surface">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotif && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute bottom-full mb-4 right-0 md:bottom-auto md:top-full md:mt-4 w-72 z-50">
                    <ClayCard className="p-0 overflow-hidden border border-white/10 shadow-2xl bg-void/90 backdrop-blur-2xl">
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Notifications</span>
                            {unreadCount > 0 && <span className="text-[10px] text-chill-blue font-bold">{unreadCount} New</span>}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-text-secondary text-xs italic">No recent notifications.</div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id} className={cn("p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer relative group", !notif.isRead && "bg-chill-blue/5")}
                                        onClick={() => !notif.isRead && handleMarkRead(notif.id)}>
                                        <div className="flex gap-3">
                                            <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", notif.isRead ? "bg-white/10" : "bg-chill-blue animate-pulse")} />
                                            <div className="space-y-1">
                                                <p className="text-[11px] leading-relaxed text-text-primary">{notif.message}</p>
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

          <button
            onClick={() => isAuthenticated ? navigate('/dashboard') : dispatch({ type: 'SET_AUTH_MODAL', payload: true })}
            className={cn("p-2 rounded-full transition-all duration-300", location.pathname === "/dashboard" ? "text-energy-pink" : "text-text-secondary hover:text-energy-pink")}
          >
            <User size={22} />
          </button>

          {isAuthenticated && (
            <button
              onClick={() => { logout(); dispatch({ type: 'LOGOUT' }); navigate('/'); toast.success("Signed out successfully."); }}
              className="p-2 rounded-full text-text-secondary hover:text-energy-pink transition-all duration-300"
            >
              <LogOut size={22} />
            </button>
          )}
        </div>
      </div>
    </>
  );
}
