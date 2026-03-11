import ClayCard from "./ClayCard";

export default function Footer() {
  return (
    <footer className="w-full pt-20 px-4 pb-24 md:pb-6 relative z-10 bg-void overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <ClayCard className="bg-[#14161E] rounded-[3rem] p-12 md:p-20 text-center flex flex-col items-center">
            <h2 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-energy-pink to-energy-orange mb-6">
                ATMOS
            </h2>
            <p className="text-text-secondary max-w-lg mb-12 text-lg">
                The new standard for tactile nightlife. Find the perfect energy for your next event, curated just for you.
            </p>
            
            <div className="w-full max-w-md bg-void p-2 rounded-full shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.05)] border border-white/5 flex gap-2">
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="flex-1 bg-transparent px-6 py-3 text-text-primary focus:outline-none placeholder:text-text-secondary/50"
                />
                <button className="bg-clay-surface hover:text-white px-8 py-3 rounded-full text-text-secondary font-medium transition-colors shadow-clay">
                    Subscribe
                </button>
            </div>
            
            <div className="mt-20 flex flex-wrap justify-center gap-8 text-sm text-text-secondary/60">
                <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
                <p>&copy; {new Date().getFullYear()} Atmos. All rights reserved.</p>
            </div>
        </ClayCard>
      </div>
    </footer>
  );
}
