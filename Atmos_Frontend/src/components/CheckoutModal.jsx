import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import ClayButton from "./ClayButton";
import { useState, useEffect, useRef } from "react";
import { api } from "../services/api";
import { getUser } from "../services/authStore";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import toast from "react-hot-toast";

export default function CheckoutModal({ isOpen, onClose, eventName, eventId, price = 499 }) {
  const [step, setStep] = useState(1); 
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  const spinnerRef = useRef(null);
  const user = getUser();

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

  const handleRazorpayPayment = async () => {
    if (!user) {
      onClose();
      navigate("/?auth=true");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    try {
      // 1. Create Booking
      const booking = await api.post(`/events/${eventId}/book/${user.id}?quantity=${quantity}`, {});
      
      // 2. Create Razorpay Order
      const orderData = await api.post(`/payments/create-order/${booking.id}`);
      
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Atmos",
        description: `Ticket for ${eventName}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          setStep(3); 
          try {
            // 3. Verify Payment
            const verifyResp = await api.post("/payments/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyResp.status === "success") {
              setStep(4);
              toast.success("Payment successful! Your ticket is secured.");
            } else {
              throw new Error("Verification failed.");
            }
          } catch (err) {
            setErrorMsg("Payment verification failed. Please contact support.");
            setStep(5);
          }
        },
        prefill: {
          name: user.username,
          email: user.email || "",
        },
        theme: {
          color: "#00F0FF",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      
    } catch (err) {
      const msg = err.message || "Checkout failed.";
      setErrorMsg(msg);
      toast.error(msg);
      setStep(5);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setQuantity(1);
    setErrorMsg("");
    navigate("/tickets")
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
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-text-secondary text-sm">Tickets (Max 10)</span>
                                <div className="flex items-center gap-3">
                                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">-</button>
                                  <span className="font-bold text-white w-4 text-center">{quantity}</span>
                                  <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors">+</button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-text-secondary text-sm">Total Pass Value</span>
                                <span className="font-bold text-chill-blue text-2xl">₹{price * quantity}</span>
                            </div>
                        </div>
                        
                        <ClayButton
                          disabled={loading}
                          className="w-full text-void bg-chill-blue font-bold py-4 rounded-xl shadow-[0_0_30px_rgba(0,240,255,0.2)]"
                          variant="primary"
                          onClick={handleRazorpayPayment}
                        >
                          {loading ? "Initializing..." : "Secure with Razorpay"}
                        </ClayButton>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center gap-8 py-10">
                        <div className="relative w-24 h-24">
                            <div className="absolute inset-0 rounded-full border-4 border-chill-blue/10" />
                            <div ref={spinnerRef} className="absolute inset-0 rounded-full border-4 border-chill-blue border-t-transparent shadow-[0_0_30px_rgba(0,240,255,0.3)] flex items-center justify-center">
                                <Loader2 size={40} className="text-chill-blue animate-spin" />
                            </div>
                        </div>
                        <div className="text-center">
                            <h2 className="text-2xl font-display font-bold text-white mb-2 tracking-wide">Finalizing Booking</h2>
                            <p className="text-text-secondary text-sm animate-pulse">Verifying your transaction with Atmos...</p>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-center gap-6 py-4">
                        <div className="w-20 h-20 bg-chill-blue/20 rounded-full flex items-center justify-center text-chill-blue mb-2 shadow-[0_0_40px_rgba(0,240,255,0.4)]">
                            <CheckCircle2 size={48} className="text-chill-blue" />
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
                            <AlertTriangle size={48} className="text-energy-pink" />
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
