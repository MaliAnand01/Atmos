import AtmosLogo from "./AtmosLogo";

export default function Footer() {
  return (
    <footer className="w-full pt-16 px-4 pb-24 md:pb-8 relative z-10 bg-void overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#14161E] rounded-[2rem] md:rounded-[3rem] p-6 sm:p-12 md:p-20 text-center flex flex-col items-center border border-white/5 shadow-clay">

          {/* Brand Logo */}
          <div className="mb-4">
            <AtmosLogo size="lg" />
          </div>

          <p className="text-text-secondary max-w-md mb-10 text-base sm:text-lg px-2">
            The new standard for tactile nightlife. Find the perfect energy for your next event, curated just for you.
          </p>

          {/* Newsletter */}
          <div className="w-full max-w-md flex flex-col gap-2">
            <div className="w-full bg-void rounded-2xl sm:rounded-full shadow-[inset_4px_4px_10px_rgba(0,0,0,0.5),_inset_-4px_-4px_10px_rgba(255,255,255,0.05)] border border-white/5 flex flex-col sm:flex-row gap-2 p-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-transparent px-5 py-3 text-text-primary focus:outline-none placeholder:text-text-secondary/50 min-w-0"
              />
              <button className="bg-clay-surface hover:bg-white/10 hover:text-white px-6 py-3 rounded-xl sm:rounded-full text-text-secondary font-medium transition-colors shadow-clay whitespace-nowrap text-sm">
                Subscribe
              </button>
            </div>
            <p className="text-text-secondary/40 text-xs text-center">No spam. Unsubscribe anytime.</p>
          </div>

          {/* Footer links */}
          <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-text-secondary/60">
            <a href="#" className="hover:text-text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-text-primary transition-colors">Contact</a>
            <p>© {new Date().getFullYear()} Atmos. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
