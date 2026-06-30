import React from "react";
import { useApp } from "../../context/AppContext";
import { Trophy, TrendingUp, TrendingDown, RefreshCw, AlertTriangle } from "lucide-react";

export default function Leaderboard() {
  const { wards, issues } = useApp();

  // Rank wards by health score descending
  const rankedWards = [...wards].sort((a, b) => b.health_score - a.health_score);

  const getWardBand = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "text-emerald-600 bg-emerald-50 border-emerald-100", labelColor: "text-emerald-700", icon: TrendingUp };
    if (score >= 70) return { label: "Moderate", color: "text-yellow-600 bg-yellow-50 border-yellow-100", labelColor: "text-yellow-700", icon: TrendingUp };
    if (score >= 50) return { label: "Poor", color: "text-orange-600 bg-orange-50 border-orange-100", labelColor: "text-orange-700", icon: TrendingDown };
    return { label: "Crisis Zone", color: "text-red-600 bg-red-50 border-red-100 animate-pulse", labelColor: "text-red-700", icon: TrendingDown };
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Intro box */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:border-indigo-100 transition-colors">
        <div className="bg-amber-50 text-amber-600 p-3 rounded-2xl border border-amber-100 shadow-sm shrink-0">
          <Trophy className="w-8 h-8 fill-amber-50" />
        </div>
        <div>
          <h2 className="text-xl font-black font-display text-slate-900 tracking-tight">Kochi Municipal Ward Leaderboard</h2>
          <p className="text-xs text-slate-500 max-w-lg mt-1 font-medium leading-relaxed">
            Compare infrastructure health scores across Kochi neighborhoods. High community verification and rapid authority resolutions boost scores, while SLA delays trigger automatic point deductions!
          </p>
        </div>
      </div>

      {/* Leaderboard Rankings List */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden shadow-sm divide-y divide-slate-100 hover:border-indigo-100 transition-colors">
        {rankedWards.map((ward, index) => {
          const band = getWardBand(ward.health_score);
          const BandIcon = band.icon;

          // Compute active open issues for this ward
          const openIssuesCount = issues.filter(i => i.ward_id === ward.id && i.status !== "resolved").length;
          const resolvedIssuesCount = issues.filter(i => i.ward_id === ward.id && i.status === "resolved").length;

          return (
            <div 
              key={ward.id}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Ranking rank badge */}
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-display font-black text-sm shadow-sm ${
                  index === 0 ? "bg-amber-100 text-amber-700" : index === 1 ? "bg-slate-250 text-slate-700" : "bg-slate-100 text-slate-500"
                }`}>
                  #{index + 1}
                </span>

                {/* Ward Name info */}
                <div className="space-y-0.5">
                  <span className="font-black text-slate-900 text-base block">{ward.name}</span>
                  <div className="flex gap-2 text-xs text-slate-400 font-bold">
                    <span>{ward.city}, {ward.state}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-600 font-semibold">{openIssuesCount} Open Issues</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-emerald-650 font-semibold">{resolvedIssuesCount} Resolved</span>
                  </div>
                </div>
              </div>

              {/* Health score badge */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">Health score</span>
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="font-black text-xl font-display text-slate-900">
                      {ward.health_score}
                    </span>
                    <BandIcon className={`w-4 h-4 ${ward.health_score >= 70 ? "text-emerald-500" : "text-rose-500"}`} />
                  </div>
                </div>

                <div className={`px-3 py-1.5 rounded-xl border text-xs font-black uppercase tracking-wider ${band.color} shadow-sm`}>
                  {band.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
