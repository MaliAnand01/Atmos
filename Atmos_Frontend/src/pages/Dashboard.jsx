import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, Users, Compass, Calendar, ClipboardList, Activity, Ticket, Package } from "lucide-react";
import AttendeeView from "../components/dashboards/AttendeeView";
import OrganizerView from "../components/dashboards/OrganizerView";
import AdminView from "../components/dashboards/AdminView";
import SettingsView from "../components/dashboards/SettingsView";
import DashboardLayout from "../components/dashboards/DashboardLayout";
import { getRole } from "../services/authStore";

export default function Dashboard() {
    const [role] = useState(getRole() || "ROLE_USER");
    const [activeTab, setActiveTab] = useState("overview");

    const viewKey = role === "ROLE_ADMIN" ? "admin" : 
                   role === "ROLE_ORGANIZER" ? "organizer" : "attendee";

    const adminTabs = [
        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'directory', label: 'User Directory', icon: Users },
        { id: 'pending', label: 'Requests', icon: Users, badge: 'New' },
        { id: 'events', label: 'All Events', icon: Calendar },
        { id: 'venues', label: 'Manage Venues', icon: Compass },
    ];

    const organizerTabs = [
        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
        { id: 'analytics', label: 'Analytics', icon: Activity },
        { id: 'events', label: 'My Events', icon: Calendar },
        { id: 'bookings', label: 'Orders', icon: ClipboardList },
    ];

    const attendeeTabs = [
        { id: 'overview', label: 'Dashboard', icon: BarChart3 },
        { id: 'bookings', label: 'My Tickets', icon: Ticket },
        { id: 'wishlist', label: 'Wishlist', icon: Package },
    ];

    const tabs = viewKey === 'admin' ? adminTabs : viewKey === 'organizer' ? organizerTabs : attendeeTabs;

    return (
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs}>
            <AnimatePresence mode="popLayout">
                {activeTab === "settings" ? (
                    <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                        <SettingsView />
                    </motion.div>
                ) : (
                    <motion.div key="overview" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                        {viewKey === "attendee" && <AttendeeView activeTab={activeTab} />}
                        {viewKey === "organizer" && <OrganizerView activeTab={activeTab} setActiveTab={setActiveTab} />}
                        {viewKey === "admin" && <AdminView activeTab={activeTab} setActiveTab={setActiveTab} />}
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
