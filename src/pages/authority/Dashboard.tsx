import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import Queue from "./Queue";
import SlaManagement from "./SlaManagement";
import Analytics from "./Analytics";
import Departments from "./Departments";
import AddAuthority from "./AddAuthority";
import AuthorityMobileBlock from "../../components/AuthorityMobileBlock";
import { 
  Building, LayoutDashboard, Database, Clock, BarChart2, Users, UserPlus,
  TrendingDown, TrendingUp, AlertCircle, MessageSquare, CheckCircle, ArrowRight,
  X, Search, MapPin, Calendar
} from "lucide-react";

export default function AuthorityDashboard() {
  const { currentUser, issues, wards, selectIssue, activeMunicipality } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'sla' | 'analytics' | 'departments' | 'add_authority'>('overview');
  const [isDesktop, setIsDesktop] = useState<boolean>(true);
  const [activeKpi, setActiveKpi] = useState<'breached' | 'unresolved' | 'resolved' | 'average' | null>(null);
  const [kpiSearchTerm, setKpiSearchTerm] = useState<string>("");

  // Monitor viewport dimensions dynamically to block mobile layout of authority console
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize(); // initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isDesktop) {
    return <AuthorityMobileBlock />;
  }

  // Calculate active statistics
  const total = issues.length;
  const unresolved = issues.filter(i => i.status !== "resolved").length;
  const resolved = issues.filter(i => i.status === "resolved").length;
  const breachedSla = issues.filter(i => i.status !== "resolved" && new Date(i.sla_deadline).getTime() < Date.now()).length;

  // Render sub-sections dynamically based on vertical sidebar tab
  const renderContent = () => {
    switch (activeTab) {
      case "queue":
        return <Queue />;
      case "sla":
        return <SlaManagement />;
      case "analytics":
        return <Analytics />;
      case "departments":
        return <Departments />;
      case "add_authority":
        return <AddAuthority />;
      default:
        return renderOverview();
    }
  };

  // Render overview homepage with KPI metrics and recent streams
  const renderOverview = () => {
    // Recent activity reports
    const recentIssues = [...issues]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 4);

    // List of alerts (Wards with critical scores)
    const criticalWards = wards.filter(w => w.health_score < 70);

    // Calculate issues list based on selected KPI
    let kpiIssuesList: any[] = [];
    let kpiTitle = "";
    if (activeKpi === "breached") {
      kpiIssuesList = issues.filter(i => i.status !== "resolved" && new Date(i.sla_deadline).getTime() < Date.now());
      kpiTitle = "SLA Breaches (Immediate Action Required)";
    } else if (activeKpi === "unresolved") {
      kpiIssuesList = issues.filter(i => i.status !== "resolved");
      kpiTitle = "Active Open Complaints Queue";
    } else if (activeKpi === "resolved") {
      kpiIssuesList = issues.filter(i => i.status === "resolved");
      kpiTitle = "Completed & Verified Resolutions";
    } else if (activeKpi === "average") {
      kpiIssuesList = issues.filter(i => i.status === "resolved");
      kpiTitle = "SLA Resolution Performance Logs";
    }

    const searchedKpiIssues = kpiIssuesList.filter(issue => {
      const wardName = wards.find(w => w.id === issue.ward_id)?.name || "";
      return issue.title.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
             issue.category.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
             wardName.toLowerCase().includes(kpiSearchTerm.toLowerCase()) ||
             issue.address.toLowerCase().includes(kpiSearchTerm.toLowerCase());
    });

    const toggleKpi = (kpi: 'breached' | 'unresolved' | 'resolved' | 'average') => {
      if (activeKpi === kpi) {
        setActiveKpi(null);
      } else {
        setActiveKpi(kpi);
        setKpiSearchTerm("");
      }
    };

    return (
      <div className="space-y-6 animate-slide-up">
        {/* KPI Scorecard block */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {/* KPI 1: Breached */}
          <button
            type="button"
            onClick={() => toggleKpi('breached')}
            className={`text-left bg-white border rounded-xl p-4.5 shadow-sm space-y-1 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500/20 ${
              activeKpi === 'breached' 
                ? "border-red-500 ring-2 ring-red-500/15 bg-gradient-to-b from-white to-red-50/5 shadow-inner" 
                : "border-red-100 hover:border-red-300"
            }`}
          >
            <span className="text-[10px] font-extrabold text-red-500 uppercase tracking-wider block">SLA Breaches</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-3xl font-display text-slate-850">{breachedSla}</span>
              <span className="bg-red-50 text-red-600 font-bold text-[10px] px-2 py-0.5 rounded-full">Immediate Action</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">Unresolved issues past regional SLA deadlines.</p>
          </button>

          {/* KPI 2: Unresolved */}
          <button
            type="button"
            onClick={() => toggleKpi('unresolved')}
            className={`text-left bg-white border rounded-xl p-4.5 shadow-sm space-y-1 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-500/20 ${
              activeKpi === 'unresolved' 
                ? "border-amber-500 ring-2 ring-amber-500/15 bg-gradient-to-b from-white to-amber-50/5 shadow-inner" 
                : "border-slate-100 hover:border-slate-300"
            }`}
          >
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Open Complaints</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-3xl font-display text-slate-850">{unresolved}</span>
              <span className="text-slate-400 text-xs font-bold">Active Queue</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">Currently assigned to inspector crews.</p>
          </button>

          {/* KPI 3: Resolved */}
          <button
            type="button"
            onClick={() => toggleKpi('resolved')}
            className={`text-left bg-white border rounded-xl p-4.5 shadow-sm space-y-1 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/20 ${
              activeKpi === 'resolved' 
                ? "border-emerald-500 ring-2 ring-emerald-500/15 bg-gradient-to-b from-white to-emerald-50/5 shadow-inner" 
                : "border-slate-100 hover:border-slate-300"
            }`}
          >
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Resolved This Month</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-3xl font-display text-slate-850">{resolved}</span>
              <span className="bg-emerald-50 text-emerald-600 font-bold text-[10px] px-2 py-0.5 rounded-full">+12% vs last</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">Work completed and verified by citizens.</p>
          </button>

          {/* KPI 4: Average Resolution Time */}
          <button
            type="button"
            onClick={() => toggleKpi('average')}
            className={`text-left bg-white border rounded-xl p-4.5 shadow-sm space-y-1 transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
              activeKpi === 'average' 
                ? "border-blue-500 ring-2 ring-blue-500/15 bg-gradient-to-b from-white to-blue-50/5 shadow-inner" 
                : "border-slate-100 hover:border-slate-300"
            }`}
          >
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Average SLA Resolution</span>
            <div className="flex items-baseline justify-between">
              <span className="font-extrabold text-3xl font-display text-slate-850">4.2 Days</span>
              <span className="bg-blue-50 text-blue-600 font-bold text-[10px] px-2 py-0.5 rounded-full">Within Limit</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 leading-normal">Average time from citizen posting to fix.</p>
          </button>
        </div>

        {/* Selected KPI Issues List Drawer section */}
        {activeKpi && (
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4 animate-slide-down">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  activeKpi === 'breached' ? 'bg-red-500' :
                  activeKpi === 'unresolved' ? 'bg-amber-500' :
                  activeKpi === 'resolved' ? 'bg-emerald-500' : 'bg-blue-500'
                }`} />
                <h3 className="font-extrabold text-slate-850 text-sm font-display uppercase tracking-tight">
                  {kpiTitle} <span className="text-slate-400">({searchedKpiIssues.length} matching)</span>
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setActiveKpi(null)}
                className="text-slate-400 hover:text-slate-650 font-bold text-xs flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-all border border-slate-150 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Close Category
              </button>
            </div>

            {/* Filter and Search inside list */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search issues by title, category, ward, or address..."
                  value={kpiSearchTerm}
                  onChange={(e) => setKpiSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* List wrapper scroll */}
            <div className="max-h-72 overflow-y-auto pr-1 space-y-2 no-scrollbar">
              {searchedKpiIssues.length > 0 ? (
                searchedKpiIssues.map((issue) => {
                  const ward = wards.find(w => w.id === issue.ward_id);
                  const isBreached = issue.status !== "resolved" && new Date(issue.sla_deadline).getTime() < Date.now();
                  
                  return (
                    <div 
                      key={issue.id}
                      className="border border-slate-100 rounded-xl p-3 hover:border-indigo-150 hover:bg-slate-50/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-slate-800 text-xs block break-words whitespace-normal">{issue.title}</span>
                          <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-650 border border-blue-100">
                            {issue.category}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            issue.status === 'in_progress' ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                            'bg-slate-50 text-slate-600 border border-slate-150'
                          }`}>
                            {issue.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold flex-wrap">
                          <span className="flex items-center gap-0.5">
                            <MapPin className="w-3 h-3" />
                            Ward: {ward?.name || "Kochi Ward"} ({issue.address})
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            Reported: {new Date(issue.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Right side items */}
                      <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                        <div className="text-right">
                          {issue.status === "resolved" ? (
                            <span className="text-[10px] font-extrabold text-emerald-600 block bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Resolved {issue.resolved_at ? `in ${Math.max(1, Math.ceil((new Date(issue.resolved_at).getTime() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24)))} days` : ""}
                            </span>
                          ) : isBreached ? (
                            <span className="text-[10px] font-extrabold text-red-600 block bg-red-50 px-2 py-0.5 rounded border border-red-150 animate-pulse">
                              SLA BREACHED
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold text-slate-500 block bg-slate-50 px-2 py-0.5 rounded border border-slate-150">
                              Deadline: {new Date(issue.sla_deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            selectIssue(issue.id);
                            setActiveTab("queue");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] py-1 px-2.5 rounded-lg flex items-center gap-0.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
                        >
                          Inspect <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  No issues found matching "{kpiSearchTerm}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Activity grid (Split view) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Columns: Recent issues streaming */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm font-display">Recent civic filings stream</h3>
              <button 
                onClick={() => setActiveTab("queue")}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
              >
                Manage Full Queue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="bg-white border border-slate-150 rounded-xl divide-y divide-slate-100 overflow-hidden shadow-sm">
              {recentIssues.map((issue) => {
                const ward = wards.find(w => w.id === issue.ward_id);
                return (
                  <div 
                    key={issue.id}
                    onClick={() => setActiveTab("queue")}
                    className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-all cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="font-bold text-slate-800 text-sm block">{issue.title}</span>
                      <div className="flex gap-2 text-[10px] text-slate-400 font-semibold uppercase">
                        <span className="text-blue-650">{issue.category}</span>
                        <span>•</span>
                        <span>Ward: {ward?.name || "Kochi"}</span>
                        <span>•</span>
                        <span>Severity: {issue.severity}/10</span>
                      </div>
                    </div>

                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        issue.status === "resolved" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                      }`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Columns: Critical ward alerts & notifications */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-bold text-slate-800 text-sm font-display">Regional Health score Alerts</h3>

            <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
              {criticalWards.length > 0 ? (
                <div className="space-y-3">
                  <div className="bg-red-50 border border-red-100 p-3.5 rounded-xl flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0 animate-bounce" />
                    <div>
                      <span className="font-bold text-red-950 text-xs block">Action Threshold Breached!</span>
                      <p className="text-[10px] text-red-750 leading-relaxed mt-0.5">
                        Multiple wards have dropped below 70 health ratings. Resolve critical potholes to restore performance levels immediately.
                      </p>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 pt-1">
                    {criticalWards.map(w => (
                      <div key={w.id} className="py-2 flex items-center justify-between text-xs">
                        <span className="text-slate-800 font-bold">{w.name}</span>
                        <div className="flex items-center gap-1">
                          <span className="font-extrabold text-red-600 font-mono">{w.health_score}</span>
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-xs leading-normal">
                  🟢 All neighborhood health indexes stable! No warnings currently active.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const menuItems = [
    { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
    { id: "queue" as const, label: "Issue queue", icon: Database },
    { id: "sla" as const, label: "SLA escalation", icon: Clock },
    { id: "analytics" as const, label: "Analytics", icon: BarChart2 },
    { id: "departments" as const, label: "Departments", icon: Users },
    { id: "add_authority" as const, label: "Add Officer", icon: UserPlus }
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6" id="authority-dashboard-root">
      
      {/* Side vertical Navigation bar */}
      <div className="w-60 bg-indigo-950 text-white rounded-3xl p-5 flex flex-col justify-between shrink-0 shadow-lg border border-indigo-900/30">
        <div className="space-y-6">
          {/* Admin profile brief */}
          <div className="flex items-center gap-3 pb-4 border-b border-indigo-900">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-black text-amber-400 text-base shadow-inner">
              VS
            </div>
            <div>
              <span className="font-black text-sm block leading-tight">{currentUser?.name || "Commissioner"}</span>
              <span className="text-[9px] text-indigo-300 block font-bold tracking-widest mt-0.5">ID: MUNICIPAL_CORP</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setActiveKpi(null);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    isActive 
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/50" 
                      : "text-indigo-200 hover:bg-indigo-900 hover:text-white"
                  }`}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer legal credits */}
        <div className="space-y-1.5 p-3.5 text-[10px] text-indigo-200 leading-normal">
          <div className="flex items-center gap-1.5 font-black text-white">
            <Building className="w-3.5 h-3.5 text-amber-400" />
            {activeMunicipality.toUpperCase()} PORTAL
          </div>
          <span className="font-medium opacity-80 block">Secure AES encryptions configured for all data transactions.</span>
        </div>
      </div>

      {/* Main Panel content display area */}
      <div className="flex-1 overflow-y-auto pr-2 no-scrollbar">
        {renderContent()}
      </div>

    </div>
  );
}
