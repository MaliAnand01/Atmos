import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignOut, ChartBar, Gear } from "@phosphor-icons/react";
import AttendeeView from "../components/dashboards/AttendeeView";
import OrganizerView from "../components/dashboards/OrganizerView";
import AdminView from "../components/dashboards/AdminView";
import SettingsView from "../components/dashboards/SettingsView";
import { getRole, getUser, logout } from "../services/authStore";

export default function Dashboard() {
    const [role, setRole] = useState(getRole() || "ROLE_USER");
    const [activeTab, setActiveTab] = useState("overview");
    const user = getUser();

    const viewKey = role === "ROLE_ADMIN" ? "admin" : 
                   role === "ROLE_ORGANIZER" ? "organizer" : "attendee";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-void min-h-screen font-body text-text-primary pb-32 pt-24"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-2">Dashboard</h1>
                        <p className="text-text-secondary">
                            Welcome back, <span className="text-white font-medium">{user?.username || 'Guest'}</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-clay-surface p-1 rounded-full border border-white/5 flex mr-4">
                            <button 
                                onClick={() => setActiveTab("overview")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                                    activeTab === "overview" ? "bg-white text-void shadow-clay" : "text-text-secondary hover:text-white"
                                }`}
                            >
                                <ChartBar size={16} />
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab("settings")}
                                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                                    activeTab === "settings" ? "bg-white text-void shadow-clay" : "text-text-secondary hover:text-white"
                                }`}
                            >
                                <Gear size={16} />
                                Settings
                            </button>
                        </div>

                        <button 
                            onClick={logout}
                            className="flex items-center gap-2 px-6 py-3 rounded-full bg-clay-surface border border-white/5 text-text-secondary hover:text-energy-pink hover:border-energy-pink/30 hover:shadow-[0_0_20px_rgba(255,0,127,0.1)] transition-all group"
                        >
                            <SignOut size={20} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-sm font-bold uppercase tracking-widest">Logout</span>
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {activeTab === "settings" ? (
                        <motion.div 
                            key="settings"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <SettingsView />
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="overview"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {viewKey === "attendee" && <AttendeeView />}
                            {viewKey === "organizer" && <OrganizerView />}
                            {viewKey === "admin" && <AdminView />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
