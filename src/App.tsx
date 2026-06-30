import React, { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import RoleSwitcher from "./components/RoleSwitcher";
import Feed from "./pages/citizen/Feed";
import Report from "./pages/citizen/Report";
import Leaderboard from "./pages/citizen/Leaderboard";
import Profile from "./pages/citizen/Profile";
import IssueDetail from "./pages/citizen/IssueDetail";
import CitizenMapPage from "./pages/citizen/Map";
import AuthPage from "./pages/AuthPage";
import LocationSetupPage from "./pages/citizen/LocationSetupPage";
import AuthorityDashboard from "./pages/authority/Dashboard";
import { Sparkles, Megaphone, Map, Award, User, PlusCircle, LayoutDashboard, Globe, LogOut, MapPin, ChevronDown, X, RefreshCw } from "lucide-react";
import { STATE_DISTRICTS } from "./data/indiaData";
import { getLocalBodiesForDistrict } from "./data/localBodies";

function MainApp() {
  const { 
    currentUser, 
    activeRole, 
    issues, 
    logout, 
    isLoading,
    activeState,
    setActiveState,
    activeMunicipality,
    setActiveMunicipality,
    activeLocalBody,
    setActiveLocalBody,
    updateProfile,
    fetchData,
    selectIssue
  } = useApp();
  
  const [citizenPage, setCitizenPage] = useState<'feed' | 'map' | 'leaderboard' | 'profile' | 'report' | 'detail'>('feed');
  const [detailBackTarget, setDetailBackTarget] = useState<'feed' | 'map' | 'profile'>('feed');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [tempState, setTempState] = useState(activeState);
  const [tempDistrict, setTempDistrict] = useState(activeMunicipality);
  const [tempLocalBody, setTempLocalBody] = useState(activeLocalBody);
  const [saveAsPreference, setSaveAsPreference] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const openLocationSwitcher = () => {
    setTempState(activeState);
    setTempDistrict(activeMunicipality);
    setTempLocalBody(activeLocalBody);
    setSaveAsPreference(false);
    setShowLocationModal(true);
  };

  // Count active unresolved issues
  const openIssuesCount = issues.filter(i => i.status !== "resolved").length;

  if (isLoading && !currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-50 text-slate-600 font-medium">
        <div className="animate-spin border-4 border-indigo-600 border-t-transparent w-8 h-8 rounded-full mb-2" />
        Synchronizing Municipal Databases...
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div className="space-y-0">
        
        {/* Floating Developer/Examiner Switch bar */}
        {activeRole !== "citizen" && <RoleSwitcher />}

        {/* CITIZEN INTERFACES NAV BAR */}
        {activeRole === "citizen" && (
          <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              
              {/* Logo / Branding */}
              <div className="flex items-center gap-3">
                <div 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setCitizenPage("feed")}
                >
                  <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-100 group-hover:scale-105 transition-all">
                    H
                  </div>
                  <div>
                    <h1 className="font-black text-lg tracking-tight text-indigo-900 underline decoration-indigo-400 decoration-4 underline-offset-4 leading-none">
                      COMMUNITY HERO
                    </h1>
                    <span className="text-[9px] font-black text-indigo-600 tracking-widest font-mono block mt-1">
                      {activeLocalBody ? activeLocalBody.split(" ")[0].toUpperCase() : "MUNICIPAL"} CO-SOLVER DESK
                    </span>
                  </div>
                </div>

                {/* Local Body Pill Selector */}
                <button
                  onClick={openLocationSwitcher}
                  className="hidden lg:flex items-center gap-1.5 bg-slate-50 border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 px-3 py-1.5 rounded-2xl transition-all text-[11px] font-black text-slate-700 cursor-pointer shadow-sm active:scale-95 ml-2"
                >
                  <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-slate-400 font-extrabold font-mono text-[9px] uppercase tracking-wider">Viewing:</span>
                  <span className="text-slate-900 font-extrabold truncate max-w-[150px]">{activeLocalBody}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>

              {/* Navigation Items links */}
              <nav className="hidden md:flex items-center gap-1.5">
                <button
                  onClick={() => setCitizenPage("feed")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    citizenPage === "feed" || citizenPage === "detail"
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Megaphone className="w-4 h-4" />
                  Civic Feed
                  <span className="bg-indigo-200/60 text-indigo-800 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold ml-1">
                    {openIssuesCount}
                  </span>
                </button>

                <button
                  onClick={() => setCitizenPage("map")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    citizenPage === "map" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Map className="w-4 h-4" />
                  GIS Live Map
                </button>

                <button
                  onClick={() => setCitizenPage("leaderboard")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    citizenPage === "leaderboard" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Award className="w-4 h-4" />
                  Leaderboards
                </button>

                <button
                  onClick={() => setCitizenPage("profile")}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    citizenPage === "profile" ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
              </nav>

              {/* Gamification Level & XP Badge */}
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">
                    Level {Math.floor((currentUser?.points || 0) / 150) + 1} Guardian
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/40">
                      <div 
                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.floor(((currentUser?.points || 0) % 150) / 150 * 100))}%` }}
                      ></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{currentUser?.points || 0} XP</span>
                  </div>
                </div>

                {/* Mobile/Tablet Location Switcher Trigger */}
                <button
                  type="button"
                  onClick={openLocationSwitcher}
                  className="lg:hidden flex items-center justify-center p-2.5 bg-slate-50 border-2 border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 rounded-xl text-indigo-600 cursor-pointer transition-all active:scale-95"
                  title="Change Location"
                >
                  <MapPin className="w-4 h-4" />
                </button>

                <div 
                  onClick={() => setCitizenPage("profile")}
                  className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-indigo-200/50 shadow-sm flex items-center justify-center font-black text-indigo-700 text-sm cursor-pointer hover:bg-indigo-100 transition-all"
                  title={currentUser?.name}
                >
                  {currentUser?.name ? currentUser.name.split(" ").map(n => n[0]).join("").toUpperCase() : "JS"}
                </div>

                {/* Quick file FAB trigger */}
                <button
                  onClick={() => setCitizenPage("report")}
                  className="fixed bottom-6 right-6 z-40 md:relative md:bottom-auto md:right-auto md:z-auto h-14 w-14 md:h-auto md:w-auto py-0 md:py-2.5 px-0 md:px-4 bg-indigo-600 text-white hover:bg-indigo-700 rounded-full md:rounded-3xl font-black text-xs shadow-2xl shadow-indigo-600/40 md:shadow-lg md:shadow-indigo-150 transform active:scale-105 md:active:scale-95 transition-all flex items-center justify-center md:gap-1.5 cursor-pointer group"
                  title="Report Civic Issue"
                >
                  <PlusCircle className="w-6 h-6 md:w-4 md:h-4 text-amber-300 group-hover:rotate-90 transition-transform duration-300 shrink-0" />
                  <span className="hidden md:inline">Report Issue</span>
                  {/* Subtle attention-grabbing ping for mobile view */}
                  <span className="absolute top-0 right-0 flex h-3 w-3 md:hidden">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                </button>

                {/* Logout button */}
                <button
                  onClick={logout}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-rose-600 rounded-xl transition-all cursor-pointer flex items-center justify-center"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>
          </header>
        )}

        {/* AUTHORITY NAV BAR HEADER */}
        {activeRole === "authority" && (
          <header className="bg-indigo-950 border-b border-indigo-900 text-white h-16 flex items-center px-6 shadow-md sticky top-0 z-40 justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-500 text-indigo-950 p-2.5 rounded-xl font-black shadow-md shadow-amber-500/10">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-black text-white text-base tracking-tight font-display flex items-center gap-1.5 leading-none">
                  MUNICIPAL OFFICER PORTAL
                </h1>
                <span className="text-[9px] font-black text-amber-400 tracking-widest font-mono block mt-1">DISTRICT DISPATCH & SLA COMMAND</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-indigo-900/60 border border-indigo-800 rounded-xl px-3 py-1.5 text-xs font-bold">
                <span className="text-emerald-400 font-mono animate-pulse">● COMMAND CORE ACTIVE</span>
              </div>
              <button
                onClick={logout}
                className="py-1.5 px-3 bg-indigo-900 hover:bg-indigo-800 text-indigo-200 hover:text-rose-400 rounded-xl border border-indigo-800 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-black"
                title="Log Out Officer Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </div>
          </header>
        )}

        {/* MAIN BODY AREA WITH DYNAMIC PAGE VIEWS */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {activeRole === "authority" ? (
            <AuthorityDashboard />
          ) : !currentUser?.local_body ? (
            <LocationSetupPage />
          ) : (
            <>
              {citizenPage === "feed" && (
                <Feed 
                  onSelectIssue={(id) => {
                    selectIssue(id);
                    setDetailBackTarget("feed");
                    setCitizenPage("detail");
                  }} 
                  onNavigateToReport={() => setCitizenPage("report")} 
                />
              )}
              {citizenPage === "map" && (
                <CitizenMapPage onSelectIssue={(id) => {
                  selectIssue(id);
                  setDetailBackTarget("map");
                  setCitizenPage("detail");
                }} />
              )}
              {citizenPage === "leaderboard" && <Leaderboard />}
              {citizenPage === "profile" && (
                <Profile 
                  onSelectIssue={(id) => {
                    selectIssue(id);
                    setDetailBackTarget("profile");
                    setCitizenPage("detail");
                  }}
                />
              )}
              {citizenPage === "report" && (
                <Report 
                  onNavigateToFeed={() => setCitizenPage("feed")} 
                  onSelectIssue={(id) => {
                    selectIssue(id);
                    setDetailBackTarget("feed");
                    setCitizenPage("detail");
                  }} 
                />
              )}
              {citizenPage === "detail" && (
                <IssueDetail onBack={() => setCitizenPage(detailBackTarget)} />
              )}
            </>
          )}
        </main>

      </div>
      
      {/* TEMPORARY LOCATION SWITCHER MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border-2 border-slate-100 shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-400 animate-pulse" />
                <div className="text-left">
                  <h3 className="font-black text-sm tracking-tight">Explore Other Municipalities</h3>
                  <p className="text-[10px] text-slate-300 font-medium">Temporarily check civic issues and communities</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLocationModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              
              {/* State Select */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono block">
                  1. Select State
                </label>
                <div className="relative">
                  <select
                    value={tempState}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setTempState(newState);
                      const districts = STATE_DISTRICTS[newState] || [];
                      const firstDist = districts[0] || "";
                      setTempDistrict(firstDist);
                      if (firstDist) {
                        const bodies = getLocalBodiesForDistrict(firstDist);
                        if (bodies.length > 0) {
                          setTempLocalBody(bodies[0].name);
                        }
                      }
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 pr-10 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {Object.keys(STATE_DISTRICTS).sort().map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District Select */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono block">
                  2. Select District / Municipality
                </label>
                <div className="relative">
                  <select
                    value={tempDistrict}
                    onChange={(e) => {
                      const newDist = e.target.value;
                      setTempDistrict(newDist);
                      const bodies = getLocalBodiesForDistrict(newDist);
                      if (bodies.length > 0) {
                        setTempLocalBody(bodies[0].name);
                      }
                    }}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 pr-10 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {(STATE_DISTRICTS[tempState] || []).map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Local Body Select */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-mono block">
                  3. Select Local Body Ward Desk
                </label>
                <div className="relative">
                  <select
                    value={tempLocalBody}
                    onChange={(e) => setTempLocalBody(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-3 pr-10 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                  >
                    {getLocalBodiesForDistrict(tempDistrict).map((lb) => (
                      <option key={lb.id} value={lb.name}>
                        [{lb.type}] {lb.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Save Preference Checkbox */}
              {currentUser?.role === "citizen" && (
                <div className="pt-3 border-t border-slate-100 flex items-start gap-2.5 text-left bg-indigo-50/20 p-3 rounded-2xl border border-indigo-100/30">
                  <input
                    type="checkbox"
                    id="save-as-preference-checkbox"
                    checked={saveAsPreference}
                    onChange={(e) => setSaveAsPreference(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer mt-0.5 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <label 
                      htmlFor="save-as-preference-checkbox" 
                      className="text-xs font-black text-slate-800 cursor-pointer select-none"
                    >
                      Save as default home preference
                    </label>
                    <p className="text-[10px] text-slate-500 font-medium leading-normal">
                      Permanently updates your profile to default to this local body.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* Footer Actions */}
            <div className="bg-slate-50 p-5 border-t border-slate-100 flex items-center justify-between gap-3">
              
              {/* Reset button to Home Ward */}
              {currentUser?.local_body && activeLocalBody !== currentUser.local_body && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveState("KERALA");
                    setActiveMunicipality("Ernakulam");
                    setActiveLocalBody(currentUser.local_body);
                    setShowLocationModal(false);
                  }}
                  className="text-[10px] font-black uppercase tracking-wider text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/60 border border-rose-100 px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to Home Ward
                </button>
              )}

              <div className="flex gap-2 ml-auto">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => setShowLocationModal(false)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      if (saveAsPreference && currentUser) {
                        await updateProfile(currentUser.id, {
                          local_body: tempLocalBody,
                          ward_number: "1",
                          ward_id: `ward_${tempLocalBody.trim().toLowerCase().replace(/\s+/g, "_")}_1`
                        });
                      }
                      setActiveState(tempState);
                      setActiveMunicipality(tempDistrict);
                      setActiveLocalBody(tempLocalBody);
                      setShowLocationModal(false);
                    } catch (err) {
                      console.error("Failed to update profile location", err);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-100 cursor-pointer transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    saveAsPreference ? "Save & Apply" : "Apply & Switch"
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* FOOTER */}
      {activeRole === "citizen" ? (
        <footer className="bg-indigo-900 text-white flex flex-col md:flex-row items-center px-8 py-3.5 text-xs font-bold justify-between gap-3 shrink-0">
          <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-start">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 
              5 Departments Active
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> 
              {issues.filter(i => i.severity >= 8 && i.status !== "resolved").length} Critical Issues Unresolved
            </span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 text-center">
            <span>
              NEXT MILESTONE: <span className="text-amber-400 underline underline-offset-2 uppercase tracking-wide">ELITE CITIZEN BADGE</span>
            </span>
            <div className="hidden md:block h-4 w-px bg-white/20"></div>
            <span className="opacity-70 italic font-medium">
              "Your effort changed {currentUser?.points ? Math.max(1, Math.floor(currentUser.points / 6)) : 4} lives today"
            </span>
          </div>
        </footer>
      ) : (
        <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 py-4 text-center text-[10px] font-medium">
          <div className="max-w-7xl mx-auto px-4 space-y-1">
            <p>© 2026 Kochi Municipal Corporation • Hyperlocal Dispatch Command Center.</p>
            <p>SLA Performance Tracker • Google Gemini Active Engine.</p>
          </div>
        </footer>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
