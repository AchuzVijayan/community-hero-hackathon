import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { BarChart, FileSpreadsheet, TrendingUp, Users, Calendar, AlertCircle } from "lucide-react";

export default function Analytics() {
  const { issues, wards } = useApp();
  const [exportSuccess, setExportSuccess] = useState(false);

  // Core metrics computations
  const totalIssues = issues.length;
  const resolvedIssues = issues.filter(i => i.status === "resolved").length;
  const inProgressIssues = issues.filter(i => i.status === "in_progress").length;
  const openIssues = totalIssues - resolvedIssues;
  
  const resolutionRate = totalIssues > 0 ? Math.round((resolvedIssues / totalIssues) * 100) : 0;

  // Category statistics computation
  const categoryCounts: Record<string, number> = {};
  issues.forEach(i => {
    categoryCounts[i.category] = (categoryCounts[i.category] || 0) + 1;
  });

  // Export CSV simulation
  const handleExportCSV = () => {
    try {
      // Create simple CSV content headers and rows
      const headers = ["Issue ID", "Title", "Category", "Severity", "Ward", "Status", "Created At", "Address"];
      const rows = issues.map(i => [
        i.id,
        `"${i.title.replace(/"/g, '""')}"`,
        i.category,
        i.severity,
        wards.find(w => w.id === i.ward_id)?.name || "Kochi",
        i.status,
        i.created_at,
        `"${i.address.replace(/"/g, '""')}"`
      ]);

      const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Kochi_Municipal_Civic_Reports_${new Date().toLocaleDateString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (e) {
      console.error("Export failure:", e);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header controls */}
      <div className="flex justify-between items-center bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
        <div className="space-y-0.5">
          <h2 className="text-base font-bold font-display text-slate-800">Analytical Insights & Reports</h2>
          <p className="text-xs text-slate-500">
            Real-time visual monitoring of ward health scores, category distributions, and SLA resolution performance.
          </p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
          {exportSuccess ? "CSV Exported!" : "Export Queue CSV"}
        </button>
      </div>

      {/* Grid Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Core totals */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Resolution Rate Overview</h3>
          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center shrink-0">
              <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center font-extrabold text-2xl font-display text-slate-800">
                {resolutionRate}%
              </div>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-slate-800 text-sm block">Resolved Complaints</span>
              <p className="text-xs text-slate-500">
                {resolvedIssues} out of {totalIssues} total reported civic issues settled within SLA mandates.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Status Breakdown visual bars */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Active Pipeline Distribution</h3>
          
          <div className="space-y-2 text-[11px] font-semibold text-slate-600">
            {/* Resolved */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span>Resolved Work</span>
                <span>{resolvedIssues}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalIssues > 0 ? (resolvedIssues / totalIssues) * 100 : 0}%` }} />
              </div>
            </div>

            {/* In Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span>Active Repairs (In Progress)</span>
                <span>{inProgressIssues}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${totalIssues > 0 ? (inProgressIssues / totalIssues) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Unassigned / Open */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span>Open / Unresolved</span>
                <span>{openIssues}</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: `${totalIssues > 0 ? (openIssues / totalIssues) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Ward comparative ranking scores */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Ward Health Ranks</h3>
          
          <div className="space-y-2 text-[11px] font-semibold">
            {wards.map((ward) => (
              <div key={ward.id} className="flex justify-between items-center p-1.5 hover:bg-slate-50 rounded-lg">
                <span className="text-slate-800 font-bold">{ward.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                  ward.health_score >= 85 ? "bg-emerald-100 text-emerald-800" : ward.health_score >= 60 ? "bg-yellow-100 text-yellow-850" : "bg-red-100 text-red-800 animate-pulse"
                }`}>
                  {ward.health_score}/100
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom wide bento: Issues by Category Breakdown chart */}
      <div className="bg-white border border-slate-150 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
          <BarChart className="w-4.5 h-4.5 text-blue-500" />
          Incidents volume by category
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2">
          {Object.entries(categoryCounts).map(([cat, count]) => {
            const percentage = Math.round((count / totalIssues) * 100);
            return (
              <div key={cat} className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-slate-400 text-[10px] font-bold uppercase block tracking-wider">
                    {cat}
                  </span>
                  <span className="font-extrabold text-2xl font-display text-slate-800 block mt-1">
                    {count}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 block text-right">
                    {percentage}% of total
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
