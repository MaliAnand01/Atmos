import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Warning, CreditCard, SpinnerGap, IdentificationCard, Calendar, Lock } from "@phosphor-icons/react";
import ClayButton from "./ClayButton";
import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { getUser } from "../services/authStore";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import gsap from "gsap";
import toast from "react-hot-toast";

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Invalid card number").max(19),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Invalid expiration date"),
  cvv: z.string().min(3, "CVV required").max(4),
  cardHolder: z.string().min(3, "Cardholder name required"),
});

export default function CheckoutModal({ isOpen, onClose, eventName, eventId, price = 499 }) {
  const [step, setStep] = useState(1); // 1 = confirm, 2 = card details, 3 = processing, 4 = success, 5 = error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookingId, setBookingId] = useState(null);
  const navigate = useNavigate();
  const spinnerRef = useRef(null);
  const user = getUser();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
        cardNumber: "4242 4242 4242 4242",
        expiry: "12/28",
        cvv: "123",
        cardHolder: user?.username || ""
    }
  });

  useEffect(() => {
    if (step === 3) {
      const ctx = gsap.context(() => {
        gsap.to(spinnerRef.current, {
           rotate: 360,
           duration: 1,
           repeat: -1,
           ease: "power2.inOut"
        });
      });
      return () => ctx.revert();
    }
  }, [step]);

  if (!isOpen) return null;

  const handleInitialConfirm = async () => {
    if (!user) {
      onClose();
      navigate("/?auth=true");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const booking = await api.post(`/events/${eventId}/book/${user.id}`, {});
      setBookingId(booking.id);
      setStep(2); // Move to Atmos Pay card entry
    } catch (err) {
      const msg = err.message || "Booking failed.";
      setErrorMsg(msg);
      toast.error(msg);
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const onPaymentSubmit = async (data) => {
    setStep(3); // Start processing pulse
    
    // Artificial latency for effect
    await new Promise(r => setTimeout(r, 2500));
    
    try {
      const resp = await api.post(`/payments/atmos-pay`, {
        bookingId: bookingId,
        cardNumber: data.cardNumber
      });
      
      if (resp.status === "success") {
        setStep(4); // Pulse Secured
        toast.success("Payment successful! Your ticket is secured.");
      } else {
        setErrorMsg(resp.message || "Frequency mismatch.");
        setStep(5);
      }
    } catch (err) {
      setErrorMsg("Void interference detected. Payment failed.");
      setStep(5);
    }
  };

  const handleClose = () => {
    setStep(1);
    setErrorMsg("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void/90 backdrop-blur-2xl"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl bg-clay-surface border border-white/5 rounded-[2.5rem] shadow-clay overflow-hidden"
          >
            {/* Top Branding Bar */}
            <div className="bg-white/5 p-4 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chill-blue animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary">Atmos Secure Platform</span>
                </div>
                <button onClick={handleClose} className="p-2 text-text-secondary hover:text-white transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="p-8">
                {step === 1 && (
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-6 text-left">
                        <div>
                            <h2 className="text-3xl font-display font-bold">Secure Ticket</h2>
                            <p className="text-text-secondary text-sm">Join the Atmos experience.</p>
                        </div>
                        
                        <div className="bg-void p-6 rounded-2xl border border-white/5 shadow-inner">
                            <p className="text-text-secondary text-[10px] uppercase tracking-[0.3em] mb-2">Selected Event</p>
                            <p className="text-xl font-display font-bold text-white">{eventName}</p>
                            <div className="border-t border-white/10 my-4 border-dashed" />
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary text-sm">Entry Pass</span>
                                <span className="font-bold text-chill-blue text-xl">₹{price}</span>
                            </div>
                        </div>
                        
                        <ClayButton
                          disabled={loading}
                          className="w-full text-void bg-chill-blue font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                          variant="primary"
                          onClick={handleInitialConfirm}
                        >
                          {loading ? "Processing..." : "Continue to Payment"}
                        </ClayButton>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex flex-col gap-6 text-left">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-display font-bold">Atmos Pay</h2>
                            <div className="flex gap-1">
                                <span className="w-8 h-5 bg-white/10 rounded border border-white/5" />
                                <span className="w-8 h-5 bg-chill-blue/20 rounded border border-chill-blue/10" />
                            </div>
                        </div>

                        <form onSubmit={handleSubmit(onPaymentSubmit)} className="space-y-4">
                            <div className="relative">
                                <IdentificationCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                                <input
                                    {...register("cardNumber")}
                                    placeholder="4242 4242 4242 4242"
                                    className="w-full bg-void border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-chill-blue/50 transition-colors"
                                />
                                {errors.cardNumber && <p className="text-[10px] text-energy-pink mt-1 ml-4 uppercase tracking-wider">{errors.cardNumber.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                                    <input
                                        {...register("expiry")}
                                        placeholder="MM/YY"
                                        className="w-full bg-void border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-chill-blue/50 transition-colors"
                                    />
                                    {errors.expiry && <p className="text-[10px] text-energy-pink mt-1 ml-4 uppercase tracking-wider">{errors.expiry.message}</p>}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                                    <input
                                        {...register("cvv")}
                                        placeholder="CVV"
                                        type="password"
                                        className="w-full bg-void border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-chill-blue/50 transition-colors"
                                    />
                                    {errors.cvv && <p className="text-[10px] text-energy-pink mt-1 ml-4 uppercase tracking-wider">{errors.cvv.message}</p>}
                                </div>
                            </div>

                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                                <input
                                    {...register("cardHolder")}
                                    placeholder="CARDHOLDER NAME"
                                    className="w-full bg-void border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-chill-blue/50 transition-colors uppercase"
                                />
                                {errors.cardHolder && <p className="text-[10px] text-energy-pink mt-1 ml-4 uppercase tracking-wider">{errors.cardHolder.message}</p>}
                            </div>

                            <ClayButton
                                type="submit"
                                className="w-full text-void bg-chill-blue font-bold py-4 rounded-xl mt-4"
                                variant="primary"
                            >
                                Pay ₹{price}
                            </ClayButton>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center gap-8 py-10">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-chill-blue/10" />
                            <div ref={spinnerRef} className="absolute inset-0 rounded-full border-4 border-chill-blue border-t-transparent shadow-[0_0_30px_rgba(0,240,255,0.3)]" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-wide">Processing Payment</h2>
                            <p className="text-text-secondary text-sm animate-pulse">Verifying your transaction...</p>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center gap-6 py-4">
                        <div className="w-20 h-20 bg-chill-blue/20 rounded-full flex items-center justify-center text-chill-blue mb-2 shadow-[0_0_40px_rgba(0,240,255,0.4)]">
                            <CheckCircle size={48} weight="fill" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-display font-bold text-white mb-2 uppercase tracking-tight">Booking Confirmed</h2>
                            <p className="text-text-secondary text-sm px-4">Your ticket for <span className="text-white font-medium">{eventName}</span> is ready. View it in your dashboard.</p>
                        </div>
                        <ClayButton className="w-full mt-4 bg-void text-white border border-white/10 hover:bg-white/5 py-4 rounded-xl font-bold" variant="secondary" onClick={handleClose}>
                            Go to Dashboard
                        </ClayButton>
                    </motion.div>
                )}

                {step === 5 && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center gap-6 py-4">
                        <div className="w-20 h-20 bg-energy-pink/20 rounded-full flex items-center justify-center text-energy-pink mb-2 shadow-[0_0_30px_rgba(255,0,127,0.3)]">
                            <Warning size={48} weight="fill" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white uppercase tracking-tight">Payment Failed</h2>
                        <p className="text-text-secondary text-sm">{errorMsg}</p>
                        <ClayButton className="w-full mt-4 bg-chill-blue font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(0,240,255,0.2)]" variant="primary" onClick={() => setStep(1)}>
                            Try Again
                        </ClayButton>
                    </motion.div>
                )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
