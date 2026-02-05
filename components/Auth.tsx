
import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../api';
import { Loader2, Mail, Lock, User as UserIcon, ShieldCheck, Briefcase, ShoppingCart, X } from 'lucide-react';

interface AuthProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
  defaultRole?: Role;
}

const Auth: React.FC<AuthProps> = ({ onSuccess, onCancel, defaultRole = 'buyer' }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Sync role when defaultRole changes (e.g. user clicked a specific button on landing)
  useEffect(() => {
    if (defaultRole) setRole(defaultRole);
  }, [defaultRole]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let response;
      if (isLogin) {
        response = await api.login({ email: formData.email, password: formData.password });
      } else {
        response = await api.signup({ ...formData, role });
      }
      onSuccess(response.user);
    } catch (err: any) {
      console.error("Auth Error:", err);
      setError(err.message || 'Authentication failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
        <div className="bg-emerald-900 p-8 text-white text-center relative">
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black uppercase italic tracking-tight">
            {isLogin ? 'Welcome Back' : 'Join the Network'}
          </h2>
          <p className="text-emerald-200 text-xs font-bold uppercase tracking-widest mt-2">
            {isLogin ? 'Verified Agri-Access' : 'Building Zimbabwe\'s Future'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl flex items-center space-x-2 animate-pulse">
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Register as...</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'buyer', icon: ShoppingCart, label: 'Buyer' },
                  { id: 'seller', icon: Briefcase, label: 'Seller' },
                  { id: 'graduate', icon: UserIcon, label: 'Graduate' },
                ].map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as Role)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      role === r.id ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-50 text-slate-300 grayscale hover:border-slate-200'
                    }`}
                  >
                    <r.icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px] font-black uppercase">{r.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="text"
                placeholder="FULL NAME"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm uppercase tracking-tight"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="email"
              placeholder="EMAIL ADDRESS"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm uppercase tracking-tight"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
            <input
              type="password"
              placeholder="PASSWORD"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm tracking-tight"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-lg hover:bg-emerald-700 disabled:bg-slate-300 transition-all flex items-center justify-center space-x-2 uppercase tracking-widest text-sm"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
          </button>

          <div className="flex flex-col space-y-3 pt-4 border-t border-slate-50">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-xs text-emerald-700 font-black uppercase tracking-widest hover:underline text-center"
            >
              {isLogin ? "New here? Create an account" : 'Already verified? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
