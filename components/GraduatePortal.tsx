
import React, { useState, useEffect } from 'react';
import { User, GraduateProfile } from '../types';
import { Briefcase, GraduationCap, Search, Plus, ExternalLink, ShieldCheck, Loader2, FileText, Send, Mail, User as UserIcon, X } from 'lucide-react';
import { api } from '../api';

interface GraduatePortalProps {
  currentUser: User | null;
}

const GraduatePortal: React.FC<GraduatePortalProps> = ({ currentUser }) => {
  const [graduates, setGraduates] = useState<GraduateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    degree: '',
    institution: '',
    year: new Date().getFullYear(),
    bio: '',
    skills: '',
    contactWhatsApp: '',
  });

  useEffect(() => {
    loadGraduates();
  }, []);

  const loadGraduates = async () => {
    setLoading(true);
    try {
      const data = await api.getGraduates();
      setGraduates(data);
    } catch (err) {
      console.error("Failed to load graduates");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // In a real app we'd upload this to S3/Cloudinary, 
        // here we'll just note that we've "received" the document
        console.log("Certificate processed");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setSubmitting(true);
    try {
      await api.createGraduateProfile({
        ...formData,
        userId: currentUser._id,
        userName: currentUser.name,
        contactEmail: currentUser.email,
        skills: formData.skills.split(',').map(s => s.trim()),
        approved: true, // Default to true for this demo, in real life Admin would verify
      });
      setShowProfileForm(false);
      loadGraduates();
      alert("Your professional profile has been published to the network!");
    } catch (err) {
      alert("Error saving profile: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-emerald-100 pb-8">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase italic">Agri-Experts Network</h1>
          <p className="text-lg text-slate-600 font-medium">
            Verified profiles for Zimbabwe's agricultural graduates.
          </p>
        </div>
        
        {currentUser?.role === 'graduate' && !showProfileForm && (
          <button 
            onClick={() => setShowProfileForm(true)}
            className="px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center space-x-3 transform hover:-translate-y-1 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span className="uppercase tracking-widest text-xs">Build My Profile</span>
          </button>
        )}
      </div>

      {showProfileForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-emerald-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden my-8 animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-emerald-900 p-8 text-white relative">
                <button 
                    onClick={() => setShowProfileForm(false)}
                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="flex items-center space-x-3 mb-2">
                    <Briefcase className="w-6 h-6 text-emerald-400" />
                    <h2 className="text-2xl font-black uppercase tracking-tight">Professional Profile</h2>
                </div>
                <p className="text-emerald-200/80 text-sm font-medium">Complete your profile to appear in the employer search results.</p>
            </div>
            
            <form onSubmit={handleSubmitProfile} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Degree / Diploma</label>
                  <input 
                    type="text" required placeholder="e.g. BSc in Crop Science"
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    value={formData.degree} onChange={e => setFormData({...formData, degree: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institution</label>
                  <input 
                    type="text" required placeholder="e.g. University of Zimbabwe"
                    className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Graduation Year</label>
                <input 
                  type="number" required
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Bio / Description</label>
                <textarea 
                  rows={4} required placeholder="Briefly describe your expertise, passions, and practical experience..."
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
                  value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})}
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skills (Comma separated)</label>
                <input 
                  type="text" required placeholder="e.g. Irrigation, Soil Analysis, Poultry Health"
                  className="w-full p-4 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})}
                />
              </div>

              <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                <div className="flex items-center space-x-3 text-emerald-900">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-black uppercase tracking-widest">Graduation Certificate</span>
                </div>
                <p className="text-[10px] text-emerald-700 font-medium">Please upload a clear scan or photo of your certificate for admin verification.</p>
                <input 
                    type="file" 
                    onChange={handleFileChange}
                    accept="image/*,.pdf"
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer" 
                />
              </div>

              <div className="pt-4">
                <button 
                  type="submit" disabled={submitting}
                  className="w-full py-4 bg-emerald-600 text-white font-black rounded-xl shadow-xl hover:bg-emerald-700 disabled:bg-slate-300 flex items-center justify-center space-x-3 transition-all"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span className="uppercase tracking-widest">Publish Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Graduates Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading Network...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {graduates.map(grad => (
            <div key={grad._id} className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-2xl transition-all flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                 <GraduationCap className="w-24 h-24" />
              </div>

              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 border-2 border-white shadow-inner">
                    <UserIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">{grad.userName}</h3>
                    <p className="text-emerald-600 font-bold text-sm tracking-tight">{grad.degree}</p>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{grad.institution} • {grad.year}</p>
                  </div>
                </div>
                {grad.approved && (
                  <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                )}
              </div>

              <div className="flex-grow space-y-4">
                <div className="relative">
                    <p className="text-slate-600 text-sm leading-relaxed font-medium italic pl-4 border-l-2 border-emerald-200">
                        "{grad.bio}"
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {grad.skills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-500 text-[9px] font-black rounded-lg border border-slate-200 uppercase tracking-wider">
                        {skill}
                    </span>
                    ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex space-x-2">
                    <a 
                        href={`mailto:${grad.contactEmail}`} 
                        className="p-2.5 bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white rounded-xl transition-all shadow-sm"
                        title="Contact via Email"
                    >
                        <Mail className="w-4 h-4" />
                    </a>
                </div>
                <button className="flex items-center space-x-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:text-emerald-800 transition-colors group/btn">
                  <span>View Full CV</span>
                  <ExternalLink className="w-3.5 h-3.5 transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
          {graduates.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-emerald-100 rounded-3xl bg-white">
               <Briefcase className="w-12 h-12 text-emerald-100 mx-auto mb-4" />
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Be the first to join the expert network</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraduatePortal;
