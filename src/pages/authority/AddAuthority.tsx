import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Shield, UserPlus, Mail, Phone, Lock, User, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function AddAuthority() {
  const { currentUser, createAuthority, wards } = useApp();
  
  // Fields for new officer
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [wardId, setWardId] = useState("");
  
  // States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Success list for the current session to show feedback of added officers!
  const [newlyAddedOfficers, setNewlyAddedOfficers] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) return setErrorMsg("Officer Name is required");
    if (!username.trim()) return setErrorMsg("Username is required");
    if (!email.trim() || !email.includes("@")) return setErrorMsg("Valid email address is required");
    if (!phone.trim()) return setErrorMsg("Mobile number is required");
    if (!password || password.length < 6) return setErrorMsg("Password must be at least 6 characters");
    if (!wardId) return setErrorMsg("Please assign a primary monitoring ward");

    setIsSubmitting(true);
    try {
      const officerData = {
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        ward_id: wardId
      };

      const result = await createAuthority(officerData);
      
      setSuccessMsg(`Municipal officer account successfully created for ${name}!`);
      setNewlyAddedOfficers([result, ...newlyAddedOfficers]);
      
      // Reset form fields
      setName("");
      setUsername("");
      setEmail("");
      setPhone("");
      setPassword("");
      setWardId("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create authority person. Please verify permissions.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up" id="add-authority-root">
      
      {/* Title block */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-2xl p-6 text-white border border-indigo-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center justify-center text-amber-400">
            <UserPlus className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black font-display tracking-tight text-white">Create Municipal Officer Account</h2>
            <p className="text-xs text-indigo-200 mt-0.5 font-medium">Add trusted department personnel to coordinate dispatcher queues and SLA timelines.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Registration form block */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Officer Credentials Form</h3>
              <p className="text-[10px] text-slate-400 font-medium">All officer details must correspond to authentic department registers.</p>
            </div>
            
            {/* Authenticator badge indicating ONLY admins can do this */}
            <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl border border-amber-200 text-[10px] font-black flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>AUTHORIZED ADMIN: {currentUser?.name?.split(" ")[0] || "Admin"}</span>
            </div>
          </div>

          {/* Feedback message display */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Officer Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. Sajid Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Username */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Officer Username</label>
                <div className="relative">
                  <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="e.g. sajid_eng"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Official Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="e.g. sajid.khan@kochi.gov.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="e.g. 9944332211"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Assinged Ward Monitor */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Primary Monitoring Ward</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  <select
                    value={wardId}
                    onChange={(e) => setWardId(e.target.value)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors cursor-pointer appearance-none"
                  >
                    <option value="">Select Monitoring Ward</option>
                    {wards.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Security Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Portal Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-150 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-4"
            >
              {isSubmitting ? "Creating Officer Record..." : "Register Officer Account"}
            </button>
          </form>
        </div>

        {/* Info panel / Added list block */}
        <div className="space-y-6">
          
          {/* Security policy reminder */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Municipal Security Policy</span>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Only authorized commissioners or administrators of the Kochi Municipal Corporation possess account generation grants.
            </p>
            <div className="text-[10px] bg-amber-500/10 text-amber-800 p-3 rounded-xl border border-amber-500/20 leading-relaxed font-bold">
              ⚠️ Accountability notice: Any account generated will inherit authorized clearance levels automatically. Logged transaction metadata points to admin ID: <span className="font-mono">{currentUser?.id}</span>.
            </div>
          </div>

          {/* Newly added officers list */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Officers Added This Session ({newlyAddedOfficers.length})</span>
            {newlyAddedOfficers.length > 0 ? (
              <div className="space-y-3">
                {newlyAddedOfficers.map((o) => (
                  <div key={o.id} className="p-3 bg-slate-50 rounded-xl border border-slate-150/50 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-800 block leading-none">{o.name}</span>
                      <span className="text-[9px] font-mono text-slate-400 block mt-1">User: {o.username}</span>
                    </div>
                    <span className="text-[9px] bg-indigo-100 text-indigo-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                      ACTIVE
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 leading-normal text-center py-4 italic font-medium">
                No new officers registered during this session.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
