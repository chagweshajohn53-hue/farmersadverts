
import React, { useState, useEffect } from 'react';
import { 
  ShoppingBasket, 
  Users, 
  ShieldCheck, 
  Briefcase, 
  LayoutDashboard, 
  LogOut,
  Settings,
  AlertCircle,
  Database,
  Cloud
} from 'lucide-react';
import { User, Role } from './types';
import BuyerDashboard from './components/BuyerDashboard';
import SellerDashboard from './components/SellerDashboard';
import AdminDashboard from './components/AdminDashboard';
import GraduatePortal from './components/GraduatePortal';
import LandingPage from './components/LandingPage';
import Auth from './components/Auth';
import HiddenAdmin from './components/HiddenAdmin';
import { api } from './api';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fa_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<string>('home');
  const [showAuth, setShowAuth] = useState(false);
  const [initialRole, setInitialRole] = useState<Role>('buyer');
  const [isDbConnected, setIsDbConnected] = useState<boolean | null>(null);

  // Check Database Connection on startup
  useEffect(() => {
    const checkDb = async () => {
      const connected = await api.checkConnection();
      setIsDbConnected(connected);
    };
    checkDb();
    const interval = setInterval(checkDb, 15000); // Re-check every 15s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fa_user', JSON.stringify(currentUser));
      if (activeTab === 'home') {
        if (currentUser.role === 'admin') setActiveTab('admin');
        else if (currentUser.role === 'seller') setActiveTab('seller');
        else if (currentUser.role === 'graduate') setActiveTab('graduates');
        else setActiveTab('shop');
      }
    } else {
      localStorage.removeItem('fa_user');
    }
  }, [currentUser, activeTab]);

  const handleStart = (role: Role) => {
    setInitialRole(role);
    setShowAuth(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuth(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  const renderContent = () => {
    if (activeTab === 'home') return <LandingPage onStart={handleStart} />;
    
    switch (activeTab) {
      case 'shop':
        return <BuyerDashboard currentUser={currentUser} />;
      case 'seller':
        return <SellerDashboard currentUser={currentUser} />;
      case 'admin':
        return <AdminDashboard currentUser={currentUser} />;
      case 'graduates':
        return <GraduatePortal currentUser={currentUser} />;
      default:
        return <LandingPage onStart={handleStart} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {showAuth && (
        <Auth 
          onSuccess={handleAuthSuccess} 
          onCancel={() => setShowAuth(false)} 
          defaultRole={initialRole}
        />
      )}
      
      {/* Hidden Admin Entry */}
      <HiddenAdmin 
        onLoginSuccess={handleAuthSuccess} 
        isLoggedIn={currentUser?.role === 'admin'} 
      />
      
      {/* Navigation */}
      <nav className="bg-emerald-900 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center space-x-2 cursor-pointer group"
              onClick={() => setActiveTab('home')}
            >
              <img src="/farm.PNG" alt="Farm Logo" className="w-8 h-8 rounded-md" />
              <span className="text-xl font-black tracking-tight uppercase italic">Farmers Adverts-Market Place</span>
            </div>

            <div className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => setActiveTab('shop')}
                className={`text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'shop' ? 'text-emerald-400' : 'text-emerald-100/70 hover:text-white'}`}
              >
                Marketplace
              </button>
              <button 
                onClick={() => setActiveTab('graduates')}
                className={`text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'graduates' ? 'text-emerald-400' : 'text-emerald-100/70 hover:text-white'}`}
              >
                Network
              </button>
              
              {currentUser?.role === 'seller' && (
                <button 
                  onClick={() => setActiveTab('seller')}
                  className={`flex items-center space-x-2 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'seller' ? 'text-emerald-400' : 'text-emerald-100/70 hover:text-white'}`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Shop</span>
                </button>
              )}

              {currentUser?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center space-x-2 text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === 'admin' ? 'text-emerald-400' : 'text-emerald-100/70 hover:text-white'}`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Panel</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-6">
              {/* Database Indicator */}
              <div className="hidden sm:flex items-center space-x-2 bg-emerald-950/40 px-3 py-1.5 rounded-full border border-white/5">
                {isDbConnected === null ? (
                    <Database className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
                ) : isDbConnected ? (
                    <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                    <Database className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className={`text-[9px] font-black uppercase tracking-widest ${isDbConnected === null ? 'text-slate-500' : isDbConnected ? 'text-emerald-400' : 'text-amber-500'}`}>
                    {isDbConnected === null ? 'Syncing...' : isDbConnected ? 'Atlas Online' : 'Local Mode'}
                </span>
              </div>

              {currentUser ? (
                <div className="flex items-center space-x-3 bg-emerald-950/50 py-1.5 pl-4 pr-1.5 rounded-full border border-emerald-800">
                  <div className="text-right leading-none">
                    <p className="text-xs font-bold">{currentUser.name}</p>
                    <span className="text-[9px] text-emerald-400 uppercase tracking-widest">{currentUser.role}</span>
                  </div>
                  <button 
                    onClick={logout}
                    className="p-2 bg-emerald-800 hover:bg-red-500 rounded-full transition-all group"
                    title="Log Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => handleStart('buyer')}
                  className="px-6 py-2 bg-emerald-400 text-emerald-950 font-black rounded-full text-xs uppercase tracking-widest shadow-lg hover:bg-white transition-all transform hover:scale-105"
                >
                  Join
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>

      <footer className="bg-emerald-950 text-emerald-100/50 py-12 border-t border-emerald-900">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-2">
            <img src="/farm.PNG" alt="Farm Logo" className="w-5 h-5" />
            <span className="text-white font-black tracking-widest uppercase">Farmers Adverts-Market Place</span>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-100/30 text-center md:text-left">
            Empowering Zimbabwe's agricultural sector with secure data and trade.
          </p>
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${isDbConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-500'}`}></div>
             <span className={`text-[10px] font-black uppercase ${isDbConnected ? 'text-emerald-400/80' : 'text-amber-500/80'}`}>
                {isDbConnected ? 'Real-time Atlas Cloud Enabled' : 'Local Persistence Sync'}
             </span>
          </div>
        </div>
        <div className="text-center py-4 border-t border-emerald-900/50 mt-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400/70">
            Made by Dream Media - Call 0787838893 to get your website
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
