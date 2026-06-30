import React from "react";
import { Monitor, ShieldAlert } from "lucide-react";

export default function AuthorityMobileBlock() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] bg-slate-50 p-6 text-center">
      <div className="bg-red-50 text-red-600 p-4 rounded-full border border-red-100 mb-4 animate-bounce">
        <Monitor className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold font-display text-slate-800">Municipal Console: Desktop Required</h1>
      <p className="text-slate-500 text-xs mt-2 max-w-sm leading-relaxed">
        The Authority Dashboard is optimized for municipal officers and department heads. It requires a desktop screen size (≥ 1024px) for detailed data queues, GIS clusters, and SLA timeline management.
      </p>
      <div className="bg-slate-100 border border-slate-200/50 p-3 rounded-lg text-[10px] font-mono text-slate-500 mt-4 flex items-center gap-1">
        <ShieldAlert className="w-4 h-4 text-slate-500" />
        Min width parameter: 1024px viewport constraint
      </div>
    </div>
  );
}
