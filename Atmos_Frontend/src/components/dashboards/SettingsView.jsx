import { useState } from "react";
import { motion } from "framer-motion";
import { User, Envelope, Lock, Warning, Trash } from "@phosphor-icons/react";
import ClayCard from "../ClayCard";
import ClayButton from "../ClayButton";
import { api } from "../../services/api";
import { getUser, logout } from "../../services/authStore";

export default function SettingsView() {
    const user = getUser();
    const [username, setUsername] = useState(user?.username || "");
    const [email, setEmail] = useState(user?.email || "");
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Updating profile..." });
        try {
            const updates = { username, email };
            if (password) updates.password = password;
            
            await api.put(`/users/${user.id}`, updates);
            
            // Update local storage
            const updatedUser = { ...user, username, email };
            localStorage.setItem('atmos_user', JSON.stringify(updatedUser));
            
            setStatus({ type: "success", message: "Profile updated successfully!" });
            setPassword("");
        } catch (err) {
            setStatus({ type: "error", message: err.message || "Failed to update profile" });
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/users/${user.id}`);
            logout(); // Redirects to home
        } catch (err) {
            setStatus({ type: "error", message: "Failed to delete account. Please try again." });
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div>
                <h2 className="text-3xl font-display font-bold mb-2">Account Settings</h2>
                <p className="text-text-secondary">Manage your profile information and account preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Form */}
                <div className="md:col-span-2">
                    <ClayCard className="p-8">
                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                        <input 
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            className="w-full bg-void text-white p-3 pl-12 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Email Address</label>
                                    <div className="relative">
                                        <Envelope className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                        <input 
                                            value={email}
                                            type="email"
                                            onChange={e => setEmail(e.target.value)}
                                            className="w-full bg-void text-white p-3 pl-12 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all" 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">New Password (Optional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                        <input 
                                            value={password}
                                            type="password"
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Leave blank to keep current"
                                            className="w-full bg-void text-white p-3 pl-12 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/10" 
                                        />
                                    </div>
                                </div>
                            </div>

                            {status.message && (
                                <p className={`text-sm ${status.type === "error" ? "text-energy-pink" : status.type === "success" ? "text-chill-blue" : "text-text-secondary"}`}>
                                    {status.message}
                                </p>
                            )}

                            <ClayButton 
                                type="submit" 
                                variant="primary" 
                                disabled={status.type === "loading"}
                                className="w-full md:w-auto px-8"
                            >
                                {status.type === "loading" ? "Saving..." : "Save Changes"}
                            </ClayButton>
                        </form>
                    </ClayCard>
                </div>

                {/* Account Actions / Danger Zone */}
                <div className="space-y-6">
                    <ClayCard className="p-6 border-energy-pink/20 bg-energy-pink/5">
                        <div className="flex items-center gap-3 mb-4 text-energy-pink">
                            <Warning size={24} weight="fill" />
                            <h3 className="font-bold">Danger Zone</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-6">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        
                        {!showDeleteConfirm ? (
                            <button 
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full py-3 rounded-xl border border-energy-pink/30 text-energy-pink hover:bg-energy-pink hover:text-white transition-all text-sm font-bold flex items-center justify-center gap-2"
                            >
                                <Trash size={18} />
                                Delete Account
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-center text-white mb-2">Are you absolutely sure?</p>
                                <ClayButton 
                                    className="w-full bg-energy-pink hover:bg-energy-pink/80 border-none"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                                </ClayButton>
                                <button 
                                    className="w-full text-xs text-text-secondary hover:text-white"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </ClayCard>
                </div>
            </div>
        </div>
    );
}
