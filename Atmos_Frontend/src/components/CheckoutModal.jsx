import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Warning } from "@phosphor-icons/react";
import ClayButton from "./ClayButton";
import { useState } from "react";
import { api } from "../services/api";
import { getUser } from "../services/authStore";
import { useNavigate } from "react-router-dom";

export default function CheckoutModal({ isOpen, onClose, eventName, eventId, price = 499 }) {
  const [step, setStep] = useState(1); // 1 = confirm, 2 = success, 3 = error
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const user = getUser();

  const handleConfirm = async () => {
    if (!user) {
      // Redirect to auth if not logged in
      onClose();
      navigate("/?auth=true");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      await api.post(`/events/${eventId}/book/${user.id}`, {});
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || "Booking failed. Please try again.");
      setStep(3);
    } finally {
      setLoading(false);
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
            className="absolute inset-0 bg-void/80 backdrop-blur-md"
            onClick={handleClose}
          />
          
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="bg-clay-surface rounded-[2rem] shadow-clay w-full max-w-md relative overflow-hidden text-text-primary z-10"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary transition-colors z-20 bg-void/50 rounded-full"
            >
              <X size={24} />
            </button>

            <div className="p-8">
               {step === 1 ? (
                   <div className="flex flex-col gap-6">
                       <h2 className="text-3xl font-display font-bold">Checkout</h2>
                       <div className="bg-void p-6 rounded-2xl border border-white/5 shadow-[inset_2px_2px_6px_rgba(0,0,0,0.5)]">
                           <p className="text-text-secondary text-sm uppercase tracking-wider mb-1">Event</p>
                           <p className="text-xl font-display font-bold">{eventName}</p>
                           <div className="border-t border-white/10 my-4" />
                           <div className="flex justify-between items-center text-lg">
                               <span className="text-text-secondary">1x General Admission</span>
                               <span className="font-bold text-chill-blue">₹{price}</span>
                           </div>
                       </div>
                       
                       <p className="text-text-secondary text-sm text-center">
                           Your booking will be secured immediately upon confirmation.
                       </p>
                       
                       <ClayButton
                         disabled={loading}
                         className="w-full text-void bg-chill-blue hover:text-void disabled:opacity-50"
                         variant="primary"
                         onClick={handleConfirm}
                       >
                         {loading ? "Booking..." : "Confirm Booking"}
                       </ClayButton>
                   </div>
               ) : step === 2 ? (
                   <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-center gap-6 py-4"
                   >
                        <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                            className="w-20 h-20 bg-chill-blue/20 rounded-full flex items-center justify-center text-chill-blue mb-2"
                        >
                            <CheckCircle size={48} weight="fill" />
                        </motion.div>
                        <h2 className="text-3xl font-display font-bold text-white">You're In!</h2>
                        <p className="text-text-secondary">Your ticket for <span className="text-white font-medium">{eventName}</span> has been secured. See you in the void.</p>
                        <ClayButton className="w-full mt-4 bg-void text-text-primary border border-white/10 hover:bg-white/5" variant="secondary" onClick={handleClose}>
                           Back to Event
                        </ClayButton>
                   </motion.div>
               ) : (
                   <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center text-center gap-6 py-4"
                   >
                        <div className="w-20 h-20 bg-energy-pink/20 rounded-full flex items-center justify-center text-energy-pink mb-2">
                            <Warning size={48} weight="fill" />
                        </div>
                        <h2 className="text-3xl font-display font-bold text-white">Booking Failed</h2>
                        <p className="text-text-secondary">{errorMsg}</p>
                        <ClayButton className="w-full mt-4 bg-chill-blue text-void font-bold" variant="primary" onClick={() => setStep(1)}>
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
