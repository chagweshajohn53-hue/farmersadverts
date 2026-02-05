
import React, { useState, useEffect } from 'react';
import { User, PaymentRecord, Product, PlatformConfig, AuditLog, Dispute } from '../types';
import { ShieldCheck, CreditCard, AlertCircle, Users, CheckCircle, XCircle, Settings, Loader2, Trash2, Save, ShoppingBag, ListChecks, History } from 'lucide-react';
import { api } from '../api';

interface AdminDashboardProps {
  currentUser: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ currentUser }) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'disputes' | 'users' | 'products' | 'config' | 'logs'>('payments');
  const [verifying, setVerifying] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [p, u, pr, d, c, l] = await Promise.all([
        api.getPayments(),
        api.getUsers(),
        api.getProducts(),
        api.getDisputes(),
        api.getConfig(),
        api.getAuditLogs()
      ]);
      setPayments(p);
      setUsers(u);
      setProducts(pr);
      setDisputes(d);
      setConfig(c);
      setAuditLogs(l);
    } catch (err) {
      console.error("Admin Load Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string, status: 'confirmed' | 'rejected') => {
    if (!currentUser) return;
    setVerifying(id);
    try {
      await api.verifyPayment(id, status, currentUser._id);
      loadAll();
    } catch (e) { alert("Verification action failed."); }
    setVerifying(null);
  };

  const handleDeleteUser = async (id: string) => {
    if (!currentUser || !confirm("CRITICAL: Delete this user and all associated data?")) return;
    try {
      await api.deleteUser(id, currentUser._id);
      loadAll();
    } catch (e) { alert("Delete failed"); }
  };

  const handleRemoveProduct = async (id: string) => {
    if (!currentUser || !confirm("Forcibly remove this marketplace listing?")) return;
    try {
      await api.deleteProduct(id, currentUser._id, 'admin');
      loadAll();
    } catch (e) { alert("Remove failed"); }
  };

  const handleUpdateConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !config) return;
    try {
      await api.updateConfig(config, currentUser._id);
      alert("Platform settings synced with Atlas.");
      loadAll();
    } catch (e) { alert("Config update failed."); }
  };

  const handleResolveDispute = async (id: string, status: 'resolved' | 'rejected') => {
    if (!currentUser) return;
    try {
      await api.updateDispute(id, { status, adminId: currentUser._id });
      loadAll();
    } catch (e) { alert("Resolution failed."); }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 space-y-2">
        <button onClick={() => setActiveTab('payments')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>
          <CreditCard className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Payments</span>
          {payments.filter(p => p.status === 'pending').length > 0 && <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{payments.filter(p => p.status === 'pending').length}</span>}
        </button>
        <button onClick={() => setActiveTab('disputes')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'disputes' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>
          <AlertCircle className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Disputes</span>
          {disputes.filter(d => d.status === 'open').length > 0 && <span className="ml-auto bg-amber-500 text-white text-[10px] px-2 py-0.5 rounded-full">{disputes.filter(d => d.status === 'open').length}</span>}
        </button>
        <button onClick={() => setActiveTab('users')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>
          <Users className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Users</span>
        </button>
        <button onClick={() => setActiveTab('products')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'products' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>
          <ShoppingBag className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Inventory</span>
        </button>
        <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'logs' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>
          <History className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Audit Logs</span>
        </button>
        <button onClick={() => setActiveTab('config')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-emerald-50'}`}>
          <Settings className="w-5 h-5" />
          <span className="font-bold text-xs uppercase tracking-widest">Settings</span>
        </button>
      </aside>

      <div className="flex-grow space-y-6">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-emerald-600 animate-spin" /></div>
        ) : activeTab === 'payments' ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center space-x-3"><ShieldCheck className="w-7 h-7 text-emerald-600" /><span>Verification Queue</span></h2>
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr><th className="px-6 py-4 text-left">TXID</th><th className="px-6 py-4 text-left">Amount</th><th className="px-6 py-4 text-left">Ref</th><th className="px-6 py-4 text-left">Status</th><th className="px-6 py-4 text-right">Action</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.map(p => (
                    <tr key={p._id} className="text-xs">
                      <td className="px-6 py-4 font-mono font-bold">{p._id.slice(-8)}</td>
                      <td className="px-6 py-4 font-black text-emerald-700">${p.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">{p.reference}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded font-black uppercase text-[8px] ${p.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{p.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        {p.status === 'pending' && <div className="flex justify-end space-x-2">
                          <button disabled={verifying === p._id} onClick={() => handleVerify(p._id, 'confirmed')} className="p-2 hover:bg-emerald-50 text-emerald-600"><CheckCircle className="w-4 h-4" /></button>
                          <button disabled={verifying === p._id} onClick={() => handleVerify(p._id, 'rejected')} className="p-2 hover:bg-red-50 text-red-600"><XCircle className="w-4 h-4" /></button>
                        </div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : activeTab === 'disputes' ? (
          <div className="space-y-6">
             <h2 className="text-2xl font-black italic uppercase tracking-tight">Resolution Center</h2>
             <div className="space-y-4">
                {disputes.map(d => (
                  <div key={d._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DISPUTE #{d._id.slice(-6)}</p>
                           <p className="text-sm font-bold mt-1">"{d.reason}"</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${d.status === 'open' ? 'bg-amber-50 border-amber-100 text-amber-700' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>{d.status}</span>
                     </div>
                     {d.status === 'open' && (
                       <div className="flex space-x-3 pt-4 border-t border-slate-50">
                          <button onClick={() => handleResolveDispute(d._id, 'resolved')} className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Resolve</button>
                          <button onClick={() => handleResolveDispute(d._id, 'rejected')} className="px-4 py-2 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg uppercase tracking-widest">Reject</button>
                       </div>
                     )}
                  </div>
                ))}
                {disputes.length === 0 && <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No active disputes.</div>}
             </div>
          </div>
        ) : activeTab === 'logs' ? (
          <div className="space-y-6">
             <h2 className="text-2xl font-black italic uppercase tracking-tight">Audit Trail</h2>
             <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <table className="w-full">
                  <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                    <tr><th className="px-6 py-4 text-left">Time</th><th className="px-6 py-4 text-left">Action</th><th className="px-6 py-4 text-left">Details</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {auditLogs.map(log => (
                      <tr key={log._id} className="text-[10px]">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-bold">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 font-black uppercase text-slate-700">{log.action}</td>
                        <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>
        ) : activeTab === 'config' ? (
          <div className="max-w-xl space-y-6">
             <h2 className="text-2xl font-black italic uppercase tracking-tight">Platform Settings</h2>
             <form onSubmit={handleUpdateConfig} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Payout Number</label>
                  <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={config?.paymentNumber} onChange={e => setConfig({...config!, paymentNumber: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Support WhatsApp</label>
                  <input type="text" className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-sm" value={config?.contactWhatsApp} onChange={e => setConfig({...config!, contactWhatsApp: e.target.value})} />
                </div>
                <button className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl uppercase tracking-widest text-[10px] flex items-center justify-center space-x-2"><Save className="w-4 h-4" /><span>Sync with Atlas</span></button>
             </form>
          </div>
        ) : activeTab === 'products' ? (
           <div className="space-y-6">
             <h2 className="text-2xl font-black italic uppercase tracking-tight">Global Inventory</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group">
                    <img src={p.image} className="h-32 w-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="p-4 flex-grow flex justify-between items-center">
                      <p className="font-black text-[10px] uppercase italic">{p.name}</p>
                      <button onClick={() => handleRemoveProduct(p._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
             </div>
           </div>
        ) : (
          <div className="space-y-6">
             <h2 className="text-2xl font-black italic uppercase tracking-tight">Accounts</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map(u => (
                  <div key={u._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-black text-slate-900 uppercase italic tracking-tight">{u.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{u.role} • {u.email}</p>
                    </div>
                    {u.role !== 'admin' && (
                      <button onClick={() => handleDeleteUser(u._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
