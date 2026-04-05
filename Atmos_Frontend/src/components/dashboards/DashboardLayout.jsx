import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Home, BarChart3, Settings, Users, Calendar, HelpCircle, Map, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getUser, logout } from "../../services/authStore";
import { useUI } from "../../context/UIContext";
import ClayButton from "../ClayButton";
import toast from "react-hot-toast";

export default function DashboardLayout({ children, activeTab, setActiveTab, tabs }) {
    const { dispatch } = useUI();
    const navigate = useNavigate();
    const user = getUser();

    const handleLogout = () => {
        logout();
        dispatch({ type: 'LOGOUT' });
        navigate('/');
        toast.success("Logged out");
    };

    return (
        <div className="flex min-h-screen bg-void text-text-primary font-body">
            {/* Sidebar */}
            <div className="w-64 fixed top-0 left-0 h-screen bg-clay-surface border-r border-white/5 flex flex-col pt-8 z-50 rounded-r-3xl hidden md:flex shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
                <div className="px-8 flex items-center gap-3 mb-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-chill-blue to-energy-pink flex items-center justify-center font-bold shadow-clay text-void text-lg">
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div className="overflow-hidden">
                        <h3 className="font-bold text-sm tracking-wide leading-tight truncate">{user?.username}</h3>
                        <p className="text-[10px] text-text-secondary uppercase tracking-widest mt-0.5">{user?.role?.replace('ROLE_', '')}</p>
                    </div>
                </div>

                <div className="flex-1 px-4 space-y-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${
                                activeTab === tab.id 
                                ? 'bg-white/10 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),_inset_-2px_-2px_4px_rgba(0,0,0,0.5)]' 
                                : 'text-text-secondary hover:text-white hover:bg-white/5'
                            }`}
                        >
                            <tab.icon size={18} className={activeTab === tab.id ? 'text-chill-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'text-text-secondary group-hover:text-chill-blue'} />
                            {tab.label}
                            {tab.badge && (
                                <span className="ml-auto bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">{tab.badge}</span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="px-4 pb-8 space-y-2 mt-auto border-t border-white/5 pt-4">
                    <button 
                        onClick={() => setActiveTab("settings")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-white/10 text-white shadow-[inset_2px_2px_4px_rgba(255,255,255,0.05),_inset_-2px_-2px_4px_rgba(0,0,0,0.5)]' : 'text-text-secondary hover:text-white hover:bg-white/5'}`}
                    >
                        <Settings size={18} className={activeTab === 'settings' ? 'text-chill-blue drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'text-text-secondary'} /> Settings
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-text-secondary hover:text-energy-pink hover:bg-energy-pink/10 transition-all"
                    >
                        <LogOut size={18} /> Log out
                    </button>
                </div>
            </div>

            {/* Mobile Nav Top */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-clay-surface border-b border-white/5 z-50 px-6 flex items-center justify-between">
                 <div className="font-display font-bold tracking-wide text-lg text-white">Atmos</div>
                 <button onClick={handleLogout} className="text-text-secondary"><LogOut size={18}/></button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 pt-28 md:pt-32 px-4 sm:px-8 md:px-12 pb-24 overflow-x-hidden mt-6 md:mt-0">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-display font-bold drop-shadow-lg">Good morning, {user?.username}</h1>
                        <p className="text-text-secondary text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <div className="flex gap-3 hidden sm:flex">
                        <ClayButton variant="secondary" className="px-4 py-2 text-xs rounded-xl flex items-center gap-2 bg-clay-surface">
                            <BarChart3 size={14} /> Download
                        </ClayButton>
                        <ClayButton variant="accent" className="px-4 py-2 text-xs rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                            + Invite
                        </ClayButton>
                    </div>
                </div>

                {/* Mobile Tab Switcher */}
                <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 scrollbar-none max-w-7xl mx-auto">
                     {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${activeTab === tab.id ? 'bg-white/10 text-white border border-white/10' : 'text-text-secondary border border-transparent'}`}>
                            {tab.label}
                        </button>
                     ))}
                     <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${activeTab === 'settings' ? 'bg-white/10 text-white border border-white/10' : 'text-text-secondary border border-transparent'}`}>Settings</button>
                </div>

                {/* Sub-view Content Wrapper */}
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div 
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
