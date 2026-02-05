
import React, { useState } from 'react';
import { ShieldAlert, X, Lock, User as UserIcon, LogIn, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface HiddenAdminProps {
  onLoginSuccess: (user: User) => void;
  isLoggedIn: boolean;
}

const HiddenAdmin: React.FC<HiddenAdminProps> = ({ onLoginSuccess, isLoggedIn }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Hardcoded credentials as requested
    if (username === 'admin123' && password === 'passcode12345') {
      const adminUser: User = {
        _id: 'admin_root',
        name: 'System Administrator',
        email: 'admin@farmersmarketplace.co.zw',
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      onLoginSuccess(adminUser);
      setIsOpen(false);
      setUsername('');
      setPassword('');
    } else {
      setError('Access denied: Invalid administrative credentials.');
    }
  };

  if (isLoggedIn && !isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 bg-slate-200 border border-slate-300 text-slate-400 flex items-center justify-center text-[10px] font-bold uppercase rounded shadow-sm hover:bg-slate-300 transition-colors opacity-40 hover:opacity-100"
          title="Advertisement"
        >
          AD
        </button>
      ) : (
        <div className="bg-white w-80 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black uppercase tracking-widest">Restricted Access</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-lg flex items-center space-x-2 animate-shake">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Admin ID</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  required
                  placeholder="USERNAME"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-xs uppercase tracking-tight"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Code</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-xs tracking-tight"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 text-white font-black rounded-lg shadow-lg hover:bg-black transition-all flex items-center justify-center space-x-2 uppercase tracking-widest text-[10px]"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Initialize Override</span>
            </button>
          </form>
          
          <div className="px-6 pb-4">
            <p className="text-[8px] text-slate-400 font-medium uppercase text-center leading-tight">
              Unauthorized access attempts are logged.<br/>Farmers Marketplace Security Protocol v2.5
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiddenAdmin;
