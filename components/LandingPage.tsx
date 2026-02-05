
import React from 'react';
import { Sprout, ShoppingCart, Users, Search, ArrowRight } from 'lucide-react';
import { Role } from '../types';

interface LandingPageProps {
  onStart: (role: Role) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] rounded-[40px] overflow-hidden shadow-2xl">
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1600" 
          alt="Farmland" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/80 to-transparent flex items-center">
          <div className="max-w-2xl px-12 md:px-20 space-y-8">
            <div className="inline-flex items-center space-x-2 bg-emerald-400/20 backdrop-blur px-4 py-2 rounded-full border border-emerald-400/30">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
               <span className="text-xs font-black uppercase tracking-widest text-emerald-400">Live Across Zimbabwe</span>
            </div>
            <h1 className="text-6xl font-black text-white leading-[1.1] uppercase italic tracking-tight">
              Farmers Adverts-<br/><span className="text-emerald-400">Market Place.</span>
            </h1>
            <p className="text-emerald-100 text-xl font-medium leading-relaxed max-w-lg">
              Promoting Agribusiness through Advertising is our Mandate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onStart('buyer')}
                className="px-10 py-5 bg-white text-emerald-950 font-black rounded-2xl shadow-xl hover:bg-emerald-50 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-xs"
              >
                <span>Enter Marketplace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onStart('seller')}
                className="px-10 py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all border border-emerald-500/50 uppercase tracking-widest text-xs"
              >
                Become a Seller
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
             <ShoppingCart className="w-32 h-32 text-emerald-900" />
          </div>
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ShoppingCart className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">Secured Trade</h3>
          <p className="text-slate-600 font-medium leading-relaxed">
            Admin-verified escrow payments ensure your funds are protected. Buyers only pay when admins confirm receipt.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
             <Users className="w-32 h-32 text-emerald-900" />
          </div>
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">Expert Talent</h3>
          <p className="text-slate-600 font-medium leading-relaxed">
            Connecting agricultural graduates with employers and farmers. Build your professional CV and get hired today.
          </p>
        </div>

        <div className="bg-white p-10 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group relative overflow-hidden">
          <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform">
             <Search className="w-32 h-32 text-emerald-900" />
          </div>
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black uppercase italic tracking-tight mb-4">Real-time Data</h3>
          <p className="text-slate-600 font-medium leading-relaxed">
            Powered by MongoDB Atlas, enjoy real-time updates on your orders, payments, and profile verification status.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-emerald-900 rounded-[40px] p-16 text-center text-white space-y-8 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <Sprout className="w-full h-full p-20" />
        </div>
        <Sprout className="w-20 h-20 mx-auto text-emerald-400 animate-bounce" />
        <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tight">Ready to join the revolution?</h2>
        <p className="text-emerald-100/70 max-w-2xl mx-auto text-lg font-medium">
          Whether you're a farmer with premium produce, a graduate starting your career, or a buyer seeking quality, we have a place for you.
        </p>
        <button 
          onClick={() => onStart('graduate')}
          className="px-12 py-5 bg-emerald-400 text-emerald-950 font-black rounded-full hover:bg-white transition-all inline-flex items-center space-x-3 uppercase tracking-widest text-xs shadow-xl"
        >
          <span>Register as Graduate</span>
          <Users className="w-4 h-4" />
        </button>
      </section>
    </div>
  );
};

export default LandingPage;
