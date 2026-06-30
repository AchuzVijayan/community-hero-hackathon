import React from "react";
import { useApp } from "../../context/AppContext";
import { Clock, ShieldAlert, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

export default function SlaManagement() {
  const { issues, wards } = useApp();

  // Filter unresolved issues
  const unresolvedIssues = issues.filter(i => i.status !== "resolved");

  // Determine SLA status and detailed time remaining details
  const getSlaMetrics = (deadlineIso: string) => {
    const deadline = new Date(deadlineIso).getTime();
    const now = Date.now();
    const difference = deadline - now;
    
    if (difference < 0) {
      return { 
        status: "breached", 
        color: "bg-red-50 border-red-100 text-red-700", 
        badge: "bg-red-600 text-white animate-pulse",
        text: "SLA Breached (Action Required)",
        isBreached: true
      };
    }
    
    const hrsLeft = Math.ceil(difference / (1000 * 60 * 60));
    if (hrsLeft <= 24) {
      return { 
        status: "at_risk", 
        color: "bg-amber-50 border-amber-100 text-amber-700", 
        badge: "bg-amber-500 text-white font-bold",
        text: `${hrsLeft} hours remaining`,
        isBreached: false
      };
    }

    const daysLeft = Math.ceil(hrsLeft / 24);
    return { 
      status: "on_track", 
      color: "bg-emerald-50 border-emerald-100 text-emerald-700", 
      badge: "bg-emerald-500 text-white",
      text: `${daysLeft} days remaining`,
      isBreached: false
    };
  };

  // Sort unresolved issues by urgency: breached first, then at risk, then on track
  const sortedUnresolved = [...unresolvedIssues].sort((a, b) => {
    return new Date(a.sla_deadline).getTime() - new Date(b.sla_deadline).getTime();
  });

  return (
    <div className="space-y-6 animate-slide-up">
      {/* SLA intro box */}
      <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-base font-bold font-display text-slate-800">SLA & Escalation Control center</h2>
          <p className="text-xs text-slate-500 max-w-xl">
            SLA (Service Level Agreement) deadlines are strict guarantees. Breached deadlines trigger automatic Neighborhood Health score deductions and auto-escalate the complaint to Senior Municipality Boards.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg border border-red-100 text-[10px] font-bold uppercase tracking-wider">
            Critical Threshold: 24 hrs
          </div>
        </div>
      </div>

      {/* SLA list */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Unresolved / Urgent Issue list (Left 2 columns) */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-blue-500" />
            Active SLA Countdown Timers
          </h3>

          <div className="space-y-3">
            {sortedUnresolved.length > 0 ? (
              sortedUnresolved.map((issue) => {
                const ward = wards.find(w => w.id === issue.ward_id);
                const sla = getSlaMetrics(issue.sla_deadline);

                return (
                  <div 
                    key={issue.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-sm ${sla.color}`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${sla.badge}`}>
                          {sla.status === "breached" ? "BREACHED" : "ACTIVE TIMER"}
                        </span>
                        <span className="font-bold text-slate-800 text-sm">{issue.title}</span>
                      </div>
                      <div className="flex gap-2 text-[11px] text-slate-500 font-medium">
                        <span>Category: {issue.category}</span>
                        <span>•</span>
                        <span>Ward: {ward?.name || "Kochi Ward"}</span>
                        <span>•</span>
                        <span>Department: {issue.assigned_to || "Unassigned"}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Time status</span>
                      <span className="font-extrabold text-sm block mt-0.5">{sla.text}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-xl p-8 text-center text-slate-550 border border-slate-100 shadow-sm">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-sm">All complaints settled!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  There are no unresolved complaints under active timers.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Escalation log rules (Right 1 column) */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500" />
            Auto-Escalation Protocol
          </h3>

          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs">Rule-Based Workflows:</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If an issue SLA reaches breached status, our system automatically runs these protocols:
              </p>
            </div>

            <div className="space-y-3 font-medium text-[11px] text-slate-600">
              <div className="flex gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-850">Health score Deduct:</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">Deducts an additional -5 points directly from the ward's score daily.</p>
                </div>
              </div>

              <div className="flex gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <ShieldAlert className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-850">District Board Alert:</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">Flags the complaint to the Senior Municipal Council Dashboard for administrative audit.</p>
                </div>
              </div>

              <div className="flex gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <ArrowRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-slate-850">RTI Clause Open:</strong>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enables citizens to instantly generate RTI legal complaint petitions against the responsible engineers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
