import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Sparkles, Eye, EyeOff, User, Phone, Mail, Lock, Shield, MapPin, Check, Globe } from "lucide-react";
import { motion } from "motion/react";
import { STATE_DISTRICTS } from "../data/indiaData";

export default function AuthPage() {
  const { login, signup, wards, isLoading, activeState, setActiveState, activeMunicipality, setActiveMunicipality } = useApp();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Login fields
  const [identifier, setIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Signup fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [wardNumber, setWardNumber] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Status handlers
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Preset quick fill
  const fillPreset = (role: "citizen" | "officer") => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === "citizen") {
      setIdentifier("citizen");
      setLoginPassword("password123");
    } else {
      setIdentifier("officer");
      setLoginPassword("password123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setErrorMsg("Please enter your Email, Username, or Mobile number");
      return;
    }
    if (!loginPassword) {
      setErrorMsg("Please enter your password");
      return;
    }

    try {
      await login(identifier.trim(), loginPassword);
      setSuccessMsg("Logged in successfully! Loading dashboard...");
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please try again.");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) return setErrorMsg("Full Name is required");
    if (!username.trim()) return setErrorMsg("Username is required");
    if (!email.trim() || !email.includes("@")) return setErrorMsg("Valid email address is required");
    if (!phone.trim()) return setErrorMsg("Mobile number is required");
    if (!signupPassword || signupPassword.length < 6) return setErrorMsg("Password must be at least 6 characters");
    const activeCityName = activeMunicipality;
    if (!wardNumber.trim()) return setErrorMsg(`Please enter your resident ward number`);

    const dynamicWardId = `ward_${activeCityName.toLowerCase().replace(/\s+/g, "_")}_${wardNumber.trim()}`;

    const signupData = {
      name: name.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: signupPassword,
      ward_id: dynamicWardId,
      ward_number: wardNumber.trim(),
      city: activeCityName,
      state: activeState
    };

    try {
      await signup(signupData);
      setSuccessMsg("Citizen account created! Welcome to Community Hero!");
    } catch (err: any) {
      setErrorMsg(err.message || "Registration failed. Please check inputs.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border-2 border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px] hover:border-indigo-100/50 transition-colors duration-500">
        
        {/* Left column: Visuals & Brand statement */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 text-white p-8 md:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient light effects */}
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-indigo-500 opacity-20 rounded-full blur-3xl" />
          <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-amber-400 opacity-10 rounded-full blur-2xl" />
          
          <div className="space-y-6 relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white text-indigo-950 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg animate-bounce-slow">
                H
              </div>
              <div>
                <h1 className="font-black text-lg tracking-tight leading-none text-white">
                  COMMUNITY HERO
                </h1>
                <span className="text-[9px] font-black text-amber-400 tracking-widest font-mono block mt-1">
                  {activeMunicipality.toUpperCase()} SOLVER DESK
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-3xl font-black font-display tracking-tight leading-tight">
                Empowering {activeMunicipality} Citizens.
              </h2>
              <p className="text-xs text-indigo-200 font-medium leading-relaxed">
                A high-performance municipal dashboard where citizens report hyperlocal issues, automatically routed and classified by Google Gemini AI.
              </p>
            </div>

            {/* State and District Jurisdiction Selectors */}
            <div className="bg-indigo-950/40 border border-indigo-800/60 p-4 rounded-2xl space-y-3 relative z-20 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-black text-white tracking-widest uppercase font-mono">
                  Environment Jurisdiction
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* State Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-indigo-300 uppercase tracking-wider block">
                    Select State
                  </label>
                  <select
                    value={activeState}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setActiveState(newState);
                      const districts = STATE_DISTRICTS[newState];
                      if (districts && districts.length > 0) {
                        setActiveMunicipality(districts[0]);
                      }
                    }}
                    className="w-full bg-indigo-900/40 border border-indigo-800 text-xs font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer appearance-none"
                  >
                    {Object.keys(STATE_DISTRICTS).map((state) => (
                      <option key={state} value={state} className="bg-slate-950 text-white font-bold">
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Dropdown */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-indigo-300 uppercase tracking-wider block">
                    Select District
                  </label>
                  <select
                    value={activeMunicipality}
                    onChange={(e) => {
                      setActiveMunicipality(e.target.value);
                    }}
                    className="w-full bg-indigo-900/40 border border-indigo-800 text-xs font-bold text-white rounded-xl py-2 px-3 focus:outline-none focus:border-amber-400 transition-colors cursor-pointer appearance-none"
                  >
                    {STATE_DISTRICTS[activeState]?.map((muni) => (
                      <option key={muni} value={muni} className="bg-slate-950 text-white font-bold">
                        {muni}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-indigo-900 relative z-10">
            <div className="flex items-center gap-3 text-xs font-semibold text-indigo-200">
              <div className="w-6 h-6 rounded-lg bg-indigo-800/50 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </div>
              <span>Gemini AI Auto-Classification & Routing</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-indigo-200">
              <div className="w-6 h-6 rounded-lg bg-indigo-800/50 flex items-center justify-center shrink-0">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span>SLA Performance Tracking & Live Scores</span>
            </div>
          </div>
        </div>

        {/* Right column: Auth forms */}
        <div className="lg:col-span-7 p-6 md:p-12 flex flex-col justify-center">
          
          {/* Tab switch control */}
          <div className="flex bg-slate-50 p-1 rounded-2xl border-2 border-slate-100 max-w-md mb-8">
            <button
              onClick={() => {
                setActiveTab("signin");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === "signin"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab("signup");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === "signup"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                  : "text-slate-500 hover:text-indigo-600"
              }`}
            >
              Citizen Sign Up
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <span>{errorMsg}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2.5 shadow-sm"
            >
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          {/* Render Active Tab */}
          {activeTab === "signin" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-black font-display text-slate-900 tracking-tight">Welcome Back</h3>
                <p className="text-xs text-slate-500 font-medium">Access your Kochi resolver account instantly.</p>
              </div>

              <div className="space-y-4">
                {/* Identifier Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Email, Username, or Mobile</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. citizen or citizen@communityhero.in"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Password</label>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter security password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-11 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-150 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? "Authenticating Account..." : "Log In Securely"}
              </button>

              {/* Demo Helper Presets */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quick Demo Logins:</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => fillPreset("citizen")}
                    className="bg-indigo-50/30 border border-indigo-100/50 hover:bg-indigo-50 hover:border-indigo-200 p-3 rounded-2xl text-left text-xs font-bold text-indigo-900 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Citizen Demo</span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full uppercase font-mono">citizen</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillPreset("officer")}
                    className="bg-amber-50/30 border border-amber-100/50 hover:bg-amber-50 hover:border-amber-200 p-3 rounded-2xl text-left text-xs font-bold text-amber-900 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <span>Officer Demo</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase font-mono">officer</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black font-display text-slate-900 tracking-tight">Join as Community Hero</h3>
                <p className="text-xs text-slate-500 font-medium">Earn XP points, unlock civic badges, and improve your neighborhood.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. Aravind Nair"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Username</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. aravind_nair"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      placeholder="e.g. aravind@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Resident Ward Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Resident Ward Number</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. 5"
                      value={wardNumber}
                      onChange={(e) => setWardNumber(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-4 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-indigo-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl py-3 pl-11 pr-11 text-xs font-semibold focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                    >
                      {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-150 transform active:scale-95 transition-all cursor-pointer disabled:opacity-50 mt-4"
              >
                {isLoading ? "Creating Account..." : "Register & Start Resolving"}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
