
import React, { useState, useEffect } from 'react';
import { User, Product, PlatformConfig, PaymentRecord } from '../types';
import { Search, Clock, CreditCard, CheckCircle, Loader2, AlertCircle, ShoppingBag, History, MessageSquare, Send } from 'lucide-react';
import { api } from '../api';

interface BuyerDashboardProps {
  currentUser: User | null;
}

const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ currentUser }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [myPayments, setMyPayments] = useState<PaymentRecord[]>([]);
  const [config, setConfig] = useState<PlatformConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'activity'>('browse');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [paymentStep, setPaymentStep] = useState<'browsing' | 'confirming' | 'pending'>('browsing');
  const [paymentMethod, setPaymentMethod] = useState<string>('EcoCash');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [showDisputeForm, setShowDisputeForm] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [p, c] = await Promise.all([api.getProducts(), api.getConfig()]);
      setProducts(p);
      setConfig(c);
      
      if (currentUser) {
        const payments = await api.getPayments();
        setMyPayments(payments.filter(pay => pay.buyerId === currentUser._id));
      }
    } catch (err) {
      console.error("Failed to load marketplace data");
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = (product: Product) => {
    setSelectedProduct(product);
    setPaymentStep('confirming');
  };

  const handleConfirmPayment = async () => {
    if (!selectedProduct || !currentUser) return;
    setSubmitting(true);
    try {
      await api.submitPayment({
        buyerId: currentUser._id,
        sellerId: selectedProduct.sellerId,
        productId: selectedProduct._id,
        amount: selectedProduct.price,
        paymentMethod,
        reference,
      });
      setPaymentStep('pending');
      loadData();
    } catch (err) {
      alert("Error submitting payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDisputeForm || !currentUser) return;
    setSubmitting(true);
    try {
      await api.createDispute({
        paymentId: showDisputeForm,
        creatorId: currentUser._id,
        reason: disputeReason,
        status: 'open'
      });
      alert("Dispute filed. Admin will review the transaction.");
      setShowDisputeForm(null);
      setDisputeReason('');
    } catch (err) {
      alert("Failed to file dispute.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Syncing Atlas Database...</p>
      </div>
    );
  }

  if (paymentStep === 'pending' && selectedProduct) {
    return (
      <div className="max-w-md mx-auto bg-white p-12 rounded-[40px] shadow-2xl border border-emerald-100 text-center space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500 border border-amber-100 shadow-inner">
          <Clock className="w-12 h-12 animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Payment Logged</h2>
          <p className="text-slate-500 font-medium">Verification in progress for <strong>{selectedProduct.name}</strong>.</p>
        </div>
        <div className="bg-amber-50 p-6 rounded-3xl text-amber-800 text-[10px] font-black uppercase tracking-widest leading-relaxed border border-amber-200">
          The Admin team will verify your transaction shortly. Once confirmed, the seller will be notified to release your produce.
        </div>
        <button 
          onClick={() => {
            setPaymentStep('browsing');
            setSelectedProduct(null);
            loadData();
          }}
          className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all uppercase tracking-widest text-xs"
        >
          Return to Marketplace
        </button>
      </div>
    );
  }

  if (paymentStep === 'confirming' && selectedProduct) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[40px] shadow-2xl border border-emerald-100 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="bg-emerald-900 p-8 text-white flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic tracking-tight">Checkout</h2>
          <button onClick={() => setPaymentStep('browsing')} className="text-emerald-400 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Abort Order</button>
        </div>
        <div className="p-10 space-y-8">
          <div className="flex space-x-6 pb-8 border-b border-slate-50 items-center">
            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-32 h-32 object-cover rounded-3xl shadow-lg" />
            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase italic tracking-tight text-slate-900">{selectedProduct.name}</h3>
              <p className="text-slate-400 font-medium text-sm mb-4 line-clamp-1">{selectedProduct.description}</p>
              <div className="inline-block px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black text-xl border border-emerald-100">
                ${selectedProduct.price.toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[32px] text-white space-y-4 shadow-xl relative overflow-hidden group">
               <CreditCard className="absolute -right-8 -top-8 w-40 h-40 text-white/5 group-hover:scale-110 transition-transform" />
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Global Payout Details</p>
               <p className="text-4xl font-mono font-black tracking-tighter text-white">{config?.paymentNumber || '0778606878'}</p>
               <div className="flex gap-4">
                 {config?.methods.map(m => (
                   <span key={m} className="px-3 py-1 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">{m}</span>
                 )) || <span className="text-[9px] opacity-50 font-black uppercase">EcoCash / InnBucks</span>}
               </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TX Reference / Sender ID</label>
              <input 
                type="text" value={reference} onChange={(e) => setReference(e.target.value)}
                placeholder="077XXXXXXX OR REF_CODE"
                className="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/20 font-black text-sm uppercase tracking-tight placeholder:text-slate-300 transition-all"
              />
            </div>
          </div>

          <button 
            onClick={handleConfirmPayment}
            disabled={submitting || !reference}
            className="w-full py-6 bg-emerald-600 text-white font-black rounded-[24px] shadow-2xl hover:bg-emerald-700 disabled:bg-slate-200 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-sm"
          >
            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle className="w-6 h-6" />}
            <span>Commit Payment to Ledger</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="max-w-lg">
          <h2 className="text-4xl font-black text-slate-900 uppercase italic tracking-tighter">Marketplace.</h2>
          <p className="text-slate-400 font-medium">Verified agricultural trade hub.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
           <button onClick={() => setActiveTab('browse')} className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all font-black uppercase tracking-widest text-[10px] ${activeTab === 'browse' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Products</span>
           </button>
           <button onClick={() => setActiveTab('activity')} className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-all font-black uppercase tracking-widest text-[10px] ${activeTab === 'activity' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
              <History className="w-4 h-4" />
              <span>My Activity</span>
           </button>
        </div>
      </div>

      {activeTab === 'browse' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
          {products.map(product => (
            <div key={product._id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all duration-500 group flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-lg text-slate-900 uppercase italic tracking-tight">{product.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium line-clamp-2 mt-1">{product.description}</p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <span className="text-2xl font-black text-emerald-600 italic tracking-tighter">${product.price.toFixed(2)}</span>
                  <button onClick={() => handleBuyNow(product)} className="px-5 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all">Buy Now</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
           {myPayments.map(pay => (
             <div key={pay._id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-emerald-200 transition-colors">
                <div className="flex items-center space-x-6">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${pay.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                      {pay.status === 'confirmed' ? <CheckCircle className="w-7 h-7" /> : <Clock className="w-7 h-7" />}
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ORDER #{pay._id.slice(-6)}</p>
                      <p className="text-lg font-black text-slate-900 italic uppercase">${pay.amount.toFixed(2)} • {pay.paymentMethod}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(pay.createdAt).toLocaleDateString()} • Ref: {pay.reference}</p>
                   </div>
                </div>
                <div className="flex items-center space-x-4">
                   <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${pay.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-amber-50 border-amber-100 text-amber-600'}`}>
                      {pay.status}
                   </span>
                   {pay.status === 'pending' && (
                     <button onClick={() => setShowDisputeForm(pay._id)} className="p-2.5 text-slate-400 hover:text-red-500 transition-colors" title="Report Issue">
                        <MessageSquare className="w-5 h-5" />
                     </button>
                   )}
                </div>
             </div>
           ))}
           {myPayments.length === 0 && (
             <div className="py-20 text-center border-2 border-dashed border-emerald-100 rounded-[40px] bg-white text-slate-400 font-black uppercase tracking-widest text-xs">No activity recorded yet.</div>
           )}
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-md">
           <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
                 <h2 className="text-xl font-black uppercase italic tracking-tight">Report Transaction Issue</h2>
                 <button onClick={() => setShowDisputeForm(null)} className="text-slate-400 hover:text-white"><AlertCircle className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmitDispute} className="p-10 space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Describe the problem</label>
                    <textarea 
                      required rows={4} value={disputeReason} onChange={(e) => setDisputeReason(e.target.value)}
                      placeholder="e.g. Sent payment but not reflecting, or seller not responding..."
                      className="w-full p-5 rounded-3xl bg-slate-50 border border-slate-100 outline-none focus:ring-4 focus:ring-emerald-500/10 font-medium text-sm leading-relaxed"
                    />
                 </div>
                 <button 
                   disabled={submitting}
                   className="w-full py-5 bg-red-600 text-white font-black rounded-2xl shadow-xl hover:bg-red-700 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-xs"
                 >
                   {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                   <span>File Official Dispute</span>
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
