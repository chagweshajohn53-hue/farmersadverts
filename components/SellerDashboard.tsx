
import React, { useState, useEffect } from 'react';
import { User, Product, PaymentRecord } from '../types';
import { LayoutDashboard, Plus, Package, Clock, DollarSign, CheckCircle, Loader2, X, Tag, FileText, Image as ImageIcon, Upload, Trash2, ShoppingBasket } from 'lucide-react';
import { api } from '../api';

interface SellerDashboardProps {
  currentUser: User | null;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ currentUser }) => {
  const [sales, setSales] = useState<PaymentRecord[]>([]);
  const [myProducts, setMyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'sales'>('listings');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'Grains',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [paymentsData, productsData] = await Promise.all([
        api.getPayments(),
        api.getProducts()
      ]);
      
      const mySales = paymentsData.filter(p => p.sellerId === currentUser?._id);
      const myProds = productsData.filter(p => p.sellerId === currentUser?._id);
      
      setSales(mySales);
      setMyProducts(myProds);
    } catch (err) {
      console.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      await api.createProduct({
        ...formData,
        sellerId: currentUser._id,
        status: 'active'
      });
      setShowAddForm(false);
      setFormData({ 
        name: '', 
        description: '', 
        price: 0, 
        category: 'Grains', 
        image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=400' 
      });
      loadData();
      alert("Product added successfully to marketplace!");
    } catch (err) {
      alert("Error adding product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!currentUser || !window.confirm("Are you sure you want to remove this listing? This action cannot be undone.")) return;
    
    try {
      await api.deleteProduct(productId, currentUser._id);
      setMyProducts(prev => prev.filter(p => p._id !== productId));
      alert("Listing removed successfully.");
    } catch (err) {
      alert("Failed to delete product: " + (err as Error).message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 uppercase italic">Seller Dashboard</h2>
          <p className="text-slate-500 font-medium">Manage your Farmers Marketplace listings and revenue.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:bg-emerald-700 transition-all transform hover:-translate-y-1"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Product</span>
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in duration-300">
             <div className="p-6 bg-emerald-900 border-b border-white/10 flex justify-between items-center text-white">
                <h3 className="text-xl font-black uppercase italic tracking-tight flex items-center space-x-3">
                    <Tag className="w-6 h-6 text-emerald-400" />
                    <span>List New Product</span>
                </h3>
                <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6" />
                </button>
             </div>
             <form onSubmit={handleAddProduct} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Photo</label>
                    <div className="flex items-center space-x-6">
                        <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center group relative">
                            {formData.image ? (
                                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <ImageIcon className="w-8 h-8 text-slate-300" />
                            )}
                            <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold uppercase cursor-pointer transition-opacity">
                                <Upload className="w-5 h-5 mb-1" />
                                <span>Change</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                        <div className="flex-grow space-y-2">
                            <p className="text-xs text-slate-500">Upload a clear photo of your produce. Good lighting helps it sell faster.</p>
                            <label className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-slate-200 transition-colors">
                                Select Image
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Name</label>
                    <input 
                        type="text" required placeholder="e.g. Grade A Yellow Maize"
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold uppercase tracking-tight text-sm"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (USD)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                            <input 
                                type="number" required placeholder="0.00" step="0.01"
                                className="w-full pl-8 pr-4 py-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                                value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select 
                            className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option>Grains</option>
                            <option>Poultry</option>
                            <option>Vegetables</option>
                            <option>Livestock</option>
                            <option>Machinery</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                    <textarea 
                        rows={4} required placeholder="Detail the quality, quantity, and location..."
                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm leading-relaxed"
                        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                <button 
                    disabled={submitting}
                    className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 disabled:bg-slate-300 transition-all flex items-center justify-center space-x-3 uppercase tracking-widest text-sm"
                >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                    <span>Publish to Marketplace</span>
                </button>
             </form>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <DollarSign className="w-24 h-24" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Confirmed Revenue</p>
          <p className="text-4xl font-black text-slate-900 mt-2 italic">
            ${sales.filter(s => s.status === 'confirmed').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Clock className="w-24 h-24 text-amber-500" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Pending Payouts</p>
          <p className="text-4xl font-black text-amber-500 mt-2 italic">
            ${sales.filter(s => s.status === 'pending').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
            <Package className="w-24 h-24 text-emerald-600" />
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Inventory Count</p>
          <p className="text-4xl font-black text-emerald-600 mt-2 italic">{myProducts.length}</p>
        </div>
      </div>

      {/* Tabbed Interface */}
      <div className="space-y-6">
        <div className="flex space-x-4 border-b border-slate-100">
           <button 
             onClick={() => setActiveTab('listings')}
             className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'listings' ? 'text-emerald-600 border-b-4 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Manage My Listings
           </button>
           <button 
             onClick={() => setActiveTab('sales')}
             className={`pb-4 px-2 text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'sales' ? 'text-emerald-600 border-b-4 border-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
           >
             Sales Activity
           </button>
        </div>

        {loading ? (
            <div className="p-32 flex flex-col items-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing with Marketplace...</p>
            </div>
        ) : activeTab === 'listings' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myProducts.map(product => (
                  <div key={product._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                       <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                       <div className="absolute top-2 right-2 flex space-x-2">
                           <button 
                             onClick={() => handleDeleteProduct(product._id)}
                             className="p-2 bg-white/90 text-red-600 rounded-lg shadow-sm hover:bg-red-600 hover:text-white transition-all"
                             title="Delete Listing"
                           >
                               <Trash2 className="w-4 h-4" />
                           </button>
                       </div>
                    </div>
                    <div className="p-5 space-y-2">
                       <h4 className="font-black text-slate-900 uppercase italic tracking-tight">{product.name}</h4>
                       <div className="flex justify-between items-center">
                          <span className="text-emerald-600 font-black text-xl">${product.price.toFixed(2)}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${product.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                             {product.status}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
                {myProducts.length === 0 && (
                  <div className="col-span-full p-20 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                     <ShoppingBasket className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                     <p className="text-slate-400 font-black uppercase tracking-widest text-xs">You have no active listings in the shop</p>
                  </div>
                )}
            </div>
        ) : (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-100">
                    {sales.map(sale => (
                    <div key={sale._id} className="p-8 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-emerald-50/20 transition-all gap-6">
                        <div className="flex items-center space-x-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner ${
                            sale.status === 'confirmed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                            sale.status === 'rejected' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                        }`}>
                            {sale.status === 'confirmed' ? <CheckCircle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase">TXID: {sale._id.slice(-8).toUpperCase()}</p>
                            <h4 className="font-black text-xl text-slate-900 uppercase italic tracking-tight">${sale.amount.toFixed(2)}</h4>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{new Date(sale.createdAt).toLocaleDateString()} • {sale.paymentMethod}</p>
                        </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                            <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                sale.status === 'confirmed' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 
                                sale.status === 'rejected' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-amber-100 border-amber-200 text-amber-700'
                            }`}>
                                {sale.status}
                            </div>
                        </div>
                    </div>
                    ))}
                    {sales.length === 0 && (
                        <div className="p-32 text-center flex flex-col items-center space-y-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                                <Package className="w-10 h-10 text-slate-200" />
                            </div>
                            <p className="text-slate-400 font-black uppercase tracking-widest text-xs">No active sales recorded in the marketplace</p>
                        </div>
                    )}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
