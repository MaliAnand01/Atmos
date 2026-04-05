import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUI } from "../../context/UIContext";
import { User, Mail, Lock, AlertTriangle, Trash2 } from "lucide-react";
import ClayCard from "../ClayCard";
import ClayButton from "../ClayButton";
import { api } from "../../services/api";
import { getUser, logout } from "../../services/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const settingsSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Invalid email address"),
    currentPassword: z.string().optional().or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
}).refine(data => !data.password || data.currentPassword, {
    message: "Current password is required to establish a new password",
    path: ["currentPassword"]
});

export default function SettingsView() {
    const { dispatch } = useUI();
    const navigate = useNavigate();
    const user = getUser();
    const [status, setStatus] = useState({ type: "", message: "" });
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isDirty },
    } = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            username: user?.username || "",
            email: user?.email || "",
            currentPassword: "",
            password: "",
        }
    });

    const onUpdateSubmit = async (data) => {
        setStatus({ type: "loading", message: "Updating profile..." });
        try {
            const updates = { 
                username: data.username, 
                email: data.email 
            };
            if (data.password) {
                updates.password = data.password;
                updates.currentPassword = data.currentPassword;
            }
            
            await api.put(`/users/${user.id}`, updates);
            
            // Update local storage
            const updatedUser = { ...user, username: data.username, email: data.email };
            localStorage.setItem('atmos_user', JSON.stringify(updatedUser));
            
            setStatus({ type: "success", message: "Profile updated successfully!" });
            reset({ ...data, currentPassword: "", password: "" });
        } catch (err) {
            setStatus({ type: "error", message: err.message || "Failed to update profile" });
        }
    };

    const handleDeleteAccount = async () => {
        setIsDeleting(true);
        try {
            await api.delete(`/users/${user.id}`);
            logout(); 
            dispatch({ type: 'LOGOUT' });
            navigate('/');
        } catch {
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
                        <form onSubmit={handleSubmit(onUpdateSubmit)} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Username</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                        <input 
                                            {...register("username")}
                                            className="w-full bg-void text-white p-3 pl-12 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all" 
                                        />
                                    </div>
                                    {errors.username && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.username.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                        <input 
                                            {...register("email")}
                                            type="email"
                                            className="w-full bg-void text-white p-3 pl-12 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all" 
                                        />
                                    </div>
                                    {errors.email && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.email.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">Current Password (Required for changing password)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                        <input 
                                            {...register("currentPassword")}
                                            type="password"
                                            placeholder="Current password"
                                            className="w-full bg-void text-white p-3 pl-12 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/10" 
                                        />
                                    </div>
                                    {errors.currentPassword && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.currentPassword.message}</p>}
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text-secondary mb-2 block">New Password (Optional)</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
                                        <input 
                                            {...register("password")}
                                            type="password"
                                            placeholder="Leave blank to keep current"
                                            className="w-full bg-void text-white p-3 pl-12 rounded-xl border border-white/5 focus:border-chill-blue/50 outline-none transition-all placeholder:text-white/10" 
                                        />
                                    </div>
                                    {errors.password && <p className="text-energy-pink text-[10px] mt-1 ml-1">{errors.password.message}</p>}
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
                                disabled={status.type === "loading" || !isDirty}
                                className="w-full md:w-auto px-8"
                            >
                                {status.type === "loading" ? "Saving..." : "Save Changes"}
                            </ClayButton>
                        </form>
                    </ClayCard>
                </div>

                {/* Account Actions / Danger Zone */}
                {user?.role !== "ROLE_ADMIN" && (
                    <div className="space-y-6">
                        <ClayCard className="p-6 border-energy-pink/20 bg-energy-pink/5">
                        <div className="flex items-center gap-3 mb-4 text-energy-pink">
                            <AlertTriangle size={24} />
                            <h3 className="font-bold">Danger Zone</h3>
                        </div>
                        <p className="text-sm text-text-secondary mb-6">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        
                        {!showDeleteConfirm ? (
                            <ClayButton 
                                variant="secondary"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full rounded-xl border-energy-pink/30 text-energy-pink hover:bg-energy-pink hover:text-white text-sm flex gap-2 border"
                            >
                                <Trash2 size={18} />
                                Delete Account
                            </ClayButton>
                        ) : (
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-center text-white mb-2">Type "DELETE" to confirm</p>
                                <input 
                                    type="text"
                                    value={deleteInput}
                                    onChange={(e) => setDeleteInput(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full p-2 rounded-xl bg-void border border-energy-pink/30 text-white text-center text-xs tracking-widest uppercase outline-none focus:border-energy-pink"
                                />
                                <ClayButton 
                                    className="w-full bg-energy-pink hover:bg-energy-pink/80 border-none"
                                    onClick={handleDeleteAccount}
                                    disabled={isDeleting || deleteInput !== "DELETE"}
                                >
                                    {isDeleting ? "Deleting..." : "Yes, Delete Everything"}
                                </ClayButton>
                                <ClayButton 
                                    variant="ghost"
                                    className="w-full text-xs"
                                    onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                                >
                                    Cancel
                                </ClayButton>
                            </div>
                        )}
                    </ClayCard>
                </div>
                )}
            </div>
        </div>
    );
}
