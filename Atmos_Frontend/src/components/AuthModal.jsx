import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle, IdentificationBadge, Eye, EyeSlash } from "@phosphor-icons/react";
import ClayButton from "./ClayButton";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { saveAuth } from "../services/authStore";

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("ROLE_USER"); // ROLE_USER or ROLE_ORGANIZER
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  if (!isOpen) return null;

  /** Authenticate user */
  const handleAuthAction = async () => {
    setError("");
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
          role 
        });
      }

      const token = btoa(`${userData.email}:${password}`);
      localStorage.setItem("atmos_token", token);
      saveAuth(userData);
      
      onClose();
      if(onSuccess) onSuccess();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Authentication failed. Check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const variants = {
    initial: (direction) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      position: "absolute",
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: (direction) => ({
      x: direction > 0 ? -50 : 50,
      opacity: 0,
      position: "absolute",
      transition: { duration: 0.2 }
    })
  };

  const direction = mode === "login" ? -1 : 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-void/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#14161E] rounded-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.5)] border border-white/5 overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-text-secondary hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <AnimatePresence custom={direction} mode="popLayout" initial={false}>
                {mode === "login" ? (
                  <motion.div
                    key="login"
                    custom={direction}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <h2 className="text-3xl font-display font-bold">Welcome Back</h2>
                      <p className="text-text-secondary mt-1 tracking-wide">Enter your frequency.</p>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {error && <p className="text-energy-pink text-sm text-center bg-energy-pink/10 py-2 rounded-lg">{error}</p>}
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-[#0D0F14] text-text-primary px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-chill-blue focus:ring-1 focus:ring-chill-blue transition-all"
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAuthAction()}
                          className="w-full bg-[#0D0F14] text-text-primary px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-chill-blue focus:ring-1 focus:ring-chill-blue transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                        <ClayButton disabled={loading} className="w-full text-void bg-white hover:bg-white/90 disabled:opacity-50" variant="primary" onClick={handleAuthAction}>
                        {loading ? "Verifying..." : "Login"}
                        </ClayButton>
                    </div>
                    
                    <p className="text-center text-text-secondary text-sm">
                      Don't have an account?{" "}
                      <button onClick={() => setMode("register")} className="text-chill-blue hover:underline font-medium">
                        Create one
                      </button>
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="register"
                    custom={direction}
                    variants={variants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex flex-col gap-6"
                  >
                    <div>
                      <h2 className="text-3xl font-display font-bold">Join Atmos</h2>
                      <p className="text-text-secondary mt-1 tracking-wide">Find your frequency.</p>
                    </div>

                    {/* Role Selection */}
                    <div className="flex gap-2 p-1 bg-void rounded-xl border border-white/5">
                      <button 
                        onClick={() => setRole("ROLE_USER")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${role === "ROLE_USER" ? 'bg-energy-pink text-white' : 'text-text-secondary hover:text-white'}`}
                      >
                        <UserCircle size={18} />
                        Attendee
                      </button>
                      <button 
                        onClick={() => setRole("ROLE_ORGANIZER")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${role === "ROLE_ORGANIZER" ? 'bg-purple text-white' : 'text-text-secondary hover:text-white'}`}
                      >
                        <IdentificationBadge size={18} />
                        Organizer
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-4">
                      {error && <p className="text-energy-pink text-sm text-center bg-energy-pink/10 py-2 rounded-lg">{error}</p>}
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="bg-[#0D0F14] text-text-primary px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-energy-pink focus:ring-1 focus:ring-energy-pink transition-all"
                      />
                      <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-[#0D0F14] text-text-primary px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-energy-pink focus:ring-1 focus:ring-energy-pink transition-all"
                      />
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleAuthAction()}
                          className="w-full bg-[#0D0F14] text-text-primary px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-energy-pink focus:ring-1 focus:ring-energy-pink transition-all"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                        <ClayButton disabled={loading} className="w-full text-white bg-energy-pink hover:bg-energy-pink/90 disabled:opacity-50" variant="danger" onClick={handleAuthAction}>
                        {loading ? "Creating..." : "Register"}
                        </ClayButton>
                    </div>
                    
                    <p className="text-center text-text-secondary text-sm">
                      Already have an account?{" "}
                      <button onClick={() => setMode("login")} className="text-energy-pink hover:underline font-medium">
                        Login
                      </button>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
