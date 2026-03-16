import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCcw } from "lucide-react";
import ClayButton from './ClayButton';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-void flex items-center justify-center p-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full p-8 bg-clay-surface rounded-[2.5rem] border border-white/5 shadow-clay relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-energy-pink/10 rounded-bl-full -z-10" />
            
            <div className="w-20 h-20 bg-energy-pink/20 rounded-full flex items-center justify-center text-energy-pink mx-auto mb-6 shadow-[0_0_30px_rgba(255,0,127,0.2)]">
                <AlertTriangle size={48} />
            </div>
            
            <h1 className="text-3xl font-display font-bold text-white mb-2">Resonance Disrupted</h1>
            <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                An unexpected interference has occurred in the void. We've captured the signal and our technicians are investigating.
            </p>

            <div className="bg-void/50 p-4 rounded-xl border border-white/5 mb-8 text-left">
                <p className="text-[10px] uppercase tracking-widest text-text-secondary mb-1">Error Signal</p>
                <code className="text-[11px] text-energy-pink font-mono break-all opacity-80">
                    {this.state.error?.message || "Unknown interference detected"}
                </code>
            </div>

            <ClayButton 
                onClick={this.handleReset}
                className="w-full bg-chill-blue text-void font-bold flex items-center justify-center gap-2 py-4 rounded-xl"
            >
                <RefreshCcw size={20} />
                Return to Singularity
            </ClayButton>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
