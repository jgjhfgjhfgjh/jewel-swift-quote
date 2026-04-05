import { Search, MapPin, Star, User } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-lg tracking-wider uppercase">FollowTheMove</span>
        </div>

        {/* Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {['Experiences', 'Pilots', 'Map', 'How It Works'].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm text-gray-300 hover:text-white transition-colors tracking-wide"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <button className="hidden md:block border border-white/40 text-white text-xs font-semibold tracking-[0.15em] uppercase px-5 py-2.5 hover:bg-white/10 transition-colors">
            Become a Pilot
          </button>
          <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors">
            <User className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-12">
        {/* Live badge */}
        <div className="mb-8 px-5 py-2 rounded-full bg-white/10 border border-white/20 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/90">12 Pilots Live Now</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight leading-none mb-4">
          Hit The <span className="text-[#ff6600]">Algorithm.</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-2xl sm:text-3xl md:text-4xl text-gray-300 mb-4 font-light">
          Own your movie.
        </p>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mb-12 leading-relaxed">
          Book extreme experiences with professional FPV drone pilots. Get cinematic footage of your adventure, delivered in 24h.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-2xl mb-6">
          <div className="flex items-center bg-[#2a2a3e] rounded-xl overflow-hidden border border-white/10">
            <div className="flex items-center gap-3 flex-1 px-5 py-4">
              <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Where is your next move?"
                className="bg-transparent text-white placeholder-gray-500 text-base outline-none w-full"
              />
            </div>
            <button className="bg-[#ff6600] hover:bg-[#e65c00] transition-colors text-white font-bold text-sm tracking-[0.15em] uppercase px-8 py-4 flex items-center gap-2 m-1.5 rounded-lg">
              <Search className="w-4 h-4" />
              Search
            </button>
          </div>
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-16">
          <span className="text-sm text-gray-400">Popular:</span>
          {['Iceland', 'Norway', 'Swiss Alps', 'Patagonia'].map((tag) => (
            <button
              key={tag}
              className="px-4 py-1.5 rounded-full border border-white/20 text-xs font-semibold tracking-[0.1em] uppercase text-gray-300 hover:bg-white/10 hover:border-white/40 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-16">
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-extrabold text-[#ff6600]">240+</p>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">FPV Pilots</p>
          </div>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-extrabold text-white">18</p>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Countries</p>
          </div>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-extrabold text-white flex items-center gap-1">
              4.9<Star className="w-7 h-7 fill-[#ff6600] text-[#ff6600]" />
            </p>
            <p className="text-sm text-gray-400 mt-1 tracking-wide">Avg Rating</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
