import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, UserCircle, IdentificationBadge, Eye, EyeSlash, BuildingOffice, Phone, IdentificationCard } from "@phosphor-icons/react";
import ClayButton from "./ClayButton";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { saveAuth } from "../services/authStore";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");

  // Common fields
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ROLE_USER");

  // Organizer-specific fields
  const [orgName, setOrgName] = useState("");
  const [phone, setPhone] = useState("");
  const [panGst, setPanGst] = useState("");
  const [website, setWebsite] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // MUST be above early return — hooks cannot be called conditionally
  // Scroll lock — freeze body so background never scrolls behind the modal
  useEffect(() => {
    if (!isOpen) return;
    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isOrganizer = role === "ROLE_ORGANIZER";

  const resetFields = () => {
    setEmail(""); setUsername(""); setPassword(""); setShowPassword(false);
    setRole("ROLE_USER"); setOrgName(""); setPhone(""); setPanGst(""); setWebsite("");
    setError("");
  };

  const handleAuthAction = async () => {
    setError("");

    // Organizer validation
    if (mode === "register" && isOrganizer) {
      if (!orgName.trim()) return setError("Organization name is required.");
      if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) return setError("Enter a valid 10-digit Indian mobile number.");
      if (!panGst.trim()) return setError("PAN or GSTIN is required for organizer verification.");
    }

    setLoading(true);
    try {
      let userData;
      if (mode === "login") {
        userData = await api.post("/auth/login", { email, password });
      } else {
        userData = await api.post("/auth/register", {
          username,
          email,
          password,
          role,
          // Extra organizer fields sent to backend
          ...(isOrganizer && {
            organizationName: orgName,
            phone: phone.replace(/\s/g, ""),
            panOrGstin: panGst,
            website: website || null,
          }),
        });
      }

      const token = btoa(`${userData.email}:${password}`);
      localStorage.setItem("atmos_token", token);
      saveAuth(userData);

      onClose();
      if (onSuccess) onSuccess();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };


  const variants = {
    initial: (dir) => ({ x: dir > 0 ? 50 : -50, opacity: 0, position: "absolute" }),
    animate: { x: 0, opacity: 1, position: "relative", transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: (dir) => ({ x: dir > 0 ? -50 : 50, opacity: 0, position: "absolute", transition: { duration: 0.2 } }),
  };

  const direction = mode === "login" ? -1 : 1;

  // Shared input class
  const input = "bg-[#0D0F14] text-text-primary px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-energy-pink focus:ring-1 focus:ring-energy-pink transition-all text-sm";

  // Portal renders modal directly into document.body, bypassing framer-motion
  // transform ancestors that would break position:fixed viewport centering
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-void/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#14161E] rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden flex flex-col max-h-[90vh]"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { onClose(); resetFields(); }}
              className="absolute top-4 right-4 z-10 p-2 text-text-secondary hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-6 sm:p-8 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                {/* ─── LOGIN ─── */}
                {mode === "login" ? (
                  <motion.div key="login" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-3xl font-display font-bold">Welcome Back</h2>
                      <p className="text-text-secondary mt-1 tracking-wide">Enter your frequency.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                      {error && <p className="text-energy-pink text-sm text-center bg-energy-pink/10 py-2 rounded-lg">{error}</p>}
                      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={input} />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleAuthAction()}
                          className={`w-full ${input}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors">
                          {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    <ClayButton disabled={loading} className="w-full text-void bg-white hover:bg-white/90 disabled:opacity-50" variant="primary" onClick={handleAuthAction}>
                      {loading ? "Verifying..." : "Login"}
                    </ClayButton>

                    <p className="text-center text-text-secondary text-sm">
                      Don't have an account?{" "}
                      <button onClick={() => { setMode("register"); setError(""); }} className="text-chill-blue hover:underline font-medium">Create one</button>
                    </p>
                  </motion.div>

                ) : (
                  /* ─── REGISTER ─── */
                  <motion.div key="register" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-3xl font-display font-bold">Join Atmos</h2>
                      <p className="text-text-secondary mt-1 tracking-wide">Find your frequency.</p>
                    </div>

                    {/* Role toggle */}
                    <div className="flex gap-2 p-1 bg-void rounded-xl border border-white/5">
                      <button
                        onClick={() => setRole("ROLE_USER")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          role === "ROLE_USER"
                            ? "bg-energy-pink text-white shadow-md shadow-energy-pink/30"
                            : "text-text-secondary hover:text-white"
                        }`}
                      >
                        <UserCircle size={18} />
                        Attendee
                      </button>
                      <button
                        onClick={() => setRole("ROLE_ORGANIZER")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          role === "ROLE_ORGANIZER"
                            ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                            : "text-text-secondary hover:text-white"
                        }`}
                      >
                        <IdentificationBadge size={18} />
                        Organizer
                      </button>
                    </div>

                    {error && <p className="text-energy-pink text-sm text-center bg-energy-pink/10 py-2 rounded-lg">{error}</p>}

                    {/* Common fields */}
                    <div className="flex flex-col gap-3">
                      <input type="text" placeholder="Full Name" value={username} onChange={e => setUsername(e.target.value)} className={input} />
                      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={input} />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !isOrganizer && handleAuthAction()}
                          className={`w-full ${input}`}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors">
                          {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>

                    {/* Organizer extra fields — animated */}
                    <AnimatePresence>
                      {isOrganizer && (
                        <motion.div
                          key="org-fields"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-col gap-3 pt-1">
                            {/* Divider */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-px bg-purple-500/30" />
                              <span className="text-xs text-purple-400 uppercase tracking-widest font-medium">Organization Details</span>
                              <div className="flex-1 h-px bg-purple-500/30" />
                            </div>

                            <div className="relative">
                              <BuildingOffice size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                              <input
                                type="text"
                                placeholder="Organization / Company Name *"
                                value={orgName}
                                onChange={e => setOrgName(e.target.value)}
                                className={`${input} pl-10`}
                              />
                            </div>

                            <div className="relative">
                              <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                              <input
                                type="tel"
                                placeholder="Contact Number (10-digit) *"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                maxLength={10}
                                className={`${input} pl-10`}
                              />
                            </div>

                            <div className="relative">
                              <IdentificationCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                              <input
                                type="text"
                                placeholder="PAN / GSTIN (for verification) *"
                                value={panGst}
                                onChange={e => setPanGst(e.target.value.toUpperCase())}
                                maxLength={15}
                                className={`${input} pl-10 uppercase tracking-wider`}
                              />
                            </div>

                            <input
                              type="url"
                              placeholder="Website / Instagram link (optional)"
                              value={website}
                              onChange={e => setWebsite(e.target.value)}
                              className={input}
                            />

                            <p className="text-[11px] text-text-secondary/60 leading-relaxed px-1">
                              Your organization details are used for identity verification. You'll be able to create and manage events after approval.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <ClayButton
                      disabled={loading}
                      className={`w-full disabled:opacity-50 ${isOrganizer ? "bg-purple-500 text-white hover:bg-purple-400" : "bg-energy-pink text-white hover:bg-energy-pink/90"}`}
                      variant="danger"
                      onClick={handleAuthAction}
                    >
                      {loading ? "Creating Account..." : isOrganizer ? "Apply as Organizer" : "Create Account"}
                    </ClayButton>

                    <p className="text-center text-text-secondary text-sm">
                      Already have an account?{" "}
                      <button onClick={() => { setMode("login"); setError(""); }} className="text-energy-pink hover:underline font-medium">Login</button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
