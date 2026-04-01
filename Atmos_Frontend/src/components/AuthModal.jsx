import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, UserCircle, BadgeCheck, Eye, EyeOff, Building, Phone, IdCard, User, Contact2 } from "lucide-react";
import ClayButton from "./ClayButton";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { saveAuth } from "../services/authStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";

// schemas

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ROLE_USER", "ROLE_ORGANIZER"]),
  // for organizers
  organizationName: z.string().optional(),
  phone: z.string().optional(),
  panOrGstin: z.string().optional(),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
}).superRefine((data, ctx) => {
  if (data.role === "ROLE_ORGANIZER") {
    if (!data.organizationName || data.organizationName.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Organization name is required",
        path: ["organizationName"],
      });
    }
    if (!data.phone || !/^[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid 10-digit Indian mobile number",
        path: ["phone"],
      });
    }
    if (!data.panOrGstin || data.panOrGstin.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PAN or GSTIN is required",
        path: ["panOrGstin"],
      });
    }
  }
});

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [tempUser, setTempUser] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const navigate = useNavigate();

  const currentSchema = mode === "login" ? loginSchema : registerSchema;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      role: "ROLE_USER",
    }
  });

  const role = watch("role");
  const isOrganizer = role === "ROLE_ORGANIZER";

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

  const resetFields = () => {
    reset();
    setApiError("");
    setMode("login");
  };

  const onAuthSubmit = async (data) => {
    setApiError("");
    setLoading(true);

    try {
      let userData;
      if (mode === "login") {
        userData = await api.post("/auth/login", { 
            email: data.email, 
            password: data.password 
        });

        if (userData.verified === false) {
          setTempUser({ id: userData.id, email: userData.email, password: data.password });
          setMode("otp");
          toast("Please verify your email to continue", { icon: "📧" });
          return;
        }
      } else {
        const payload = {
          username: data.username,
          email: data.email,
          password: data.password,
          role: data.role,
          ...(isOrganizer && {
            organizationName: data.organizationName,
            phone: data.phone.replace(/\s/g, ""),
            panOrGstin: data.panOrGstin,
            website: data.website || null,
          }),
        };
        userData = await api.post("/auth/register", payload);
        
        // go to otp screen
        setTempUser({ id: userData.id, email: userData.email, password: data.password });
        setMode("otp");
        toast.success("Registration successful! Check your email for OTP.");
        return;
      }

      localStorage.setItem("atmos_token", userData.token);
      saveAuth(userData);

      onClose();
      resetFields();
      if (onSuccess) onSuccess();
      toast.success(mode === "login" ? "Welcome back to Atmos!" : "Welcome to the Atmos protocol!");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.message || "Authentication failed. Check your credentials.";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpValue.length !== 6) return toast.error("Please enter 6-digit OTP");
    
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { 
        userId: tempUser.id, 
        otp: otpValue 
      });
      
      toast.success("Email verified! Logging you in...");
      
      // login after otp
      const userData = await api.post("/auth/login", { 
        email: tempUser.email, 
        password: tempUser.password 
      });
      
      localStorage.setItem("atmos_token", userData.token);
      saveAuth(userData);

      onClose();
      resetFields();
      if (onSuccess) onSuccess();
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const onResendOtp = async () => {
    setLoading(true);
    try {
      await api.post("/auth/resend-otp", { userId: tempUser.id });
      toast.success("New OTP sent!");
    } catch (err) {
      toast.error(err.message);
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
  const inputClass = "bg-[#0D0F14] text-text-primary px-4 py-3 rounded-xl border border-white/5 focus:outline-none focus:border-energy-pink focus:ring-1 focus:ring-energy-pink transition-all text-sm w-full";

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
                {/* login */}
                {mode === "login" ? (
                  <motion.div key="login" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-6">
                    <div>
                      <h2 className="text-3xl font-display font-bold">Welcome Back</h2>
                      <p className="text-text-secondary mt-1 tracking-wide">Login to your account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onAuthSubmit)} className="flex flex-col gap-4">
                      {apiError && <p className="text-energy-pink text-sm text-center bg-energy-pink/10 py-2 rounded-lg">{apiError}</p>}
                      
                      <div>
                        <input 
                          {...register("email")}
                          type="email" 
                          placeholder="Email" 
                          className={inputClass} 
                        />
                        {errors.email && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.email.message}</p>}
                      </div>

                      <div className="relative">
                        <input
                          {...register("password")}
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          className={inputClass}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[14px] text-text-secondary hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                        {errors.password && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.password.message}</p>}
                      </div>

                      <ClayButton disabled={loading} type="submit" className="w-full text-void bg-white hover:bg-white/90 disabled:opacity-50 mt-2" variant="primary">
                        {loading ? "Verifying..." : "Login"}
                      </ClayButton>
                    </form>

                    <p className="text-center text-text-secondary text-sm">
                      Don't have an account?{" "}
                      <button onClick={() => { setMode("register"); setApiError(""); }} className="text-chill-blue hover:underline font-medium">Create one</button>
                    </p>
                  </motion.div>

                ) : mode === "register" ? (
                  /* register */
                  <motion.div key="register" custom={direction} variants={variants} initial="initial" animate="animate" exit="exit" className="flex flex-col gap-5">
                    <div>
                      <h2 className="text-3xl font-display font-bold">Join Atmos</h2>
                      <p className="text-text-secondary mt-1 tracking-wide">Ready to explore?</p>
                    </div>

                    {/* tab switch */}
                    <div className="flex gap-2 p-1 bg-void rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setValue("role", "ROLE_USER")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          role === "ROLE_USER"
                            ? "bg-energy-pink text-white shadow-md shadow-energy-pink/30"
                            : "text-text-secondary hover:text-white"
                        }`}
                      >
                        <User size={18} />
                        Attendee
                      </button>
                      <button
                        type="button"
                        onClick={() => setValue("role", "ROLE_ORGANIZER")}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                          role === "ROLE_ORGANIZER"
                            ? "bg-purple-500 text-white shadow-md shadow-purple-500/30"
                            : "text-text-secondary hover:text-white"
                        }`}
                      >
                        <Contact2 size={18} />
                        Organizer
                      </button>
                    </div>

                    <form onSubmit={handleSubmit(onAuthSubmit)} className="flex flex-col gap-4">
                      {apiError && <p className="text-energy-pink text-sm text-center bg-energy-pink/10 py-2 rounded-lg">{apiError}</p>}


                      <div className="flex flex-col gap-3">
                        <div>
                          <input {...register("username")} type="text" placeholder="Full Name" className={inputClass} />
                          {errors.username && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.username.message}</p>}
                        </div>
                        
                        <div>
                          <input {...register("email")} type="email" placeholder="Email" className={inputClass} />
                          {errors.email && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.email.message}</p>}
                        </div>

                        <div className="relative">
                          <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className={inputClass}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-[14px] text-text-secondary hover:text-white transition-colors">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                          {errors.password && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.password.message}</p>}
                        </div>
                      </div>

                      {/* extra fields */}
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
                              {/* div */}
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-purple-500/30" />
                                <span className="text-xs text-purple-400 uppercase tracking-widest font-medium">Organization Details</span>
                                <div className="flex-1 h-px bg-purple-500/30" />
                              </div>

                              <div className="relative">
                                <Building size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                  {...register("organizationName")}
                                  type="text"
                                  placeholder="Organization / Company Name *"
                                  className={`${inputClass} pl-10`}
                                />
                                {errors.organizationName && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.organizationName.message}</p>}
                              </div>

                              <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                  {...register("phone")}
                                  type="tel"
                                  placeholder="Contact Number (10-digit) *"
                                  maxLength={10}
                                  className={`${inputClass} pl-10`}
                                />
                                {errors.phone && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.phone.message}</p>}
                              </div>

                              <div className="relative">
                                <IdCard size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                                <input
                                  {...register("panOrGstin")}
                                  type="text"
                                  placeholder="PAN / GSTIN (for verification) *"
                                  onInput={(e) => e.target.value = e.target.value.toUpperCase()}
                                  maxLength={15}
                                  className={`${inputClass} pl-10 uppercase tracking-wider`}
                                />
                                {errors.panOrGstin && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.panOrGstin.message}</p>}
                              </div>

                              <div>
                                <input
                                  {...register("website")}
                                  type="text"
                                  placeholder="Website / Instagram link (optional)"
                                  className={inputClass}
                                />
                                {errors.website && <p className="text-energy-pink text-xs mt-1 ml-1">{errors.website.message}</p>}
                              </div>

                              <p className="text-[11px] text-text-secondary/60 leading-relaxed px-1">
                                Your organization details are used for identity verification. You'll be able to create and manage events after approval.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <ClayButton
                        disabled={loading}
                        type="submit"
                        className={`w-full disabled:opacity-50 mt-2 ${isOrganizer ? "bg-purple-500 text-white hover:bg-purple-400" : "bg-energy-pink text-white hover:bg-energy-pink/90"}`}
                        variant="danger"
                      >
                        {loading ? "Creating Account..." : isOrganizer ? "Apply as Organizer" : "Create Account"}
                      </ClayButton>
                    </form>

                    <p className="text-center text-text-secondary text-sm">
                      Already have an account?{" "}
                      <button onClick={() => { setMode("login"); setApiError(""); }} className="text-energy-pink hover:underline font-medium">Login</button>
                    </p>
                  </motion.div>
                ) : (
                  /* otp screen */
                  <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-chill-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 text-chill-blue border border-chill-blue/20">
                        <IdCard size={32} />
                      </div>
                      <h2 className="text-3xl font-display font-bold">Verify Identity</h2>
                      <p className="text-text-secondary mt-1 text-sm">We've sent a code to <span className="text-white font-medium">{tempUser?.email}</span></p>
                    </div>

                    <form onSubmit={onVerifyOtp} className="flex flex-col gap-6">
                       <div className="flex flex-col gap-2">
                          <input 
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            type="text"
                            placeholder="000000"
                            className="bg-void text-center text-3xl font-bold tracking-[0.5em] text-chill-blue px-4 py-6 rounded-2xl border border-white/5 focus:border-chill-blue outline-none transition-all placeholder:text-white/5"
                          />
                          <p className="text-[10px] text-center text-text-secondary uppercase tracking-[0.2em]">6-Digit Security Code</p>
                       </div>

                       <ClayButton disabled={loading || otpValue.length !== 6} type="submit" className="w-full bg-chill-blue text-void font-bold py-4" variant="primary">
                         {loading ? "Verifying..." : "Verify & Continue"}
                       </ClayButton>
                    </form>

                    <div className="text-center space-y-4">
                      <p className="text-text-secondary text-sm">
                        Didn't receive the email?{" "}
                        <button onClick={onResendOtp} disabled={loading} className="text-chill-blue hover:underline font-medium disabled:opacity-50">Resend Code</button>
                      </p>
                      <button onClick={() => { setMode("register"); setTempUser(null); }} className="text-text-secondary text-xs hover:text-white transition-colors">Change Email / Back</button>
                    </div>
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
