import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Users, Settings2, Clock, Check, ShieldCheck } from "lucide-react";

export default function Departments() {
  const { departments } = useApp();
  const [slaSettings, setSlaSettings] = useState<Record<string, number>>({
    "Pothole": 7,
    "Water Leakage": 3,
    "Broken Streetlight": 2,
    "Garbage Dumping": 4,
    "Damaged Footpath": 5
  });

  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<number>(5);

  const handleSaveSla = (cat: string) => {
    setSlaSettings(prev => ({
      ...prev,
      [cat]: editingValue
    }));
    setEditingCat(null);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* SLA configuration panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 columns: List of departments */}
        <div className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
            <Users className="w-4.5 h-4.5 text-blue-500" />
            Active Municipality Departments
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-slate-200/50">
                      ID: {dept.id}
                    </span>
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-base leading-tight font-display">{dept.name}</h4>
                </div>

                <div className="pt-3 border-t border-slate-50 space-y-1 text-xs">
                  <span className="text-slate-400 font-semibold block">Team Head Officer:</span>
                  <strong className="text-slate-800 block">{dept.head}</strong>
                  <span className="text-slate-500 block truncate">{dept.email}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 column: Category SLA settings */}
        <div className="md:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
            <Settings2 className="w-4.5 h-4.5 text-blue-500" />
            Category SLA settings (Days)
          </h3>

          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm space-y-4">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Standard SLA timers represent maximum days allowed for resolution of reported complaints. Edit categories below:
            </p>

            <div className="space-y-3 font-semibold text-xs text-slate-700">
              {Object.entries(slaSettings).map(([cat, days]) => {
                const isEditing = editingCat === cat;

                return (
                  <div key={cat} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-3 rounded-lg">
                    <span className="text-slate-800 font-bold">{cat}</span>
                    
                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <input 
                            type="number" 
                            value={editingValue}
                            onChange={(e) => setEditingValue(Number(e.target.value))}
                            className="w-12 bg-white border border-slate-200 rounded p-1 text-center font-bold text-xs"
                          />
                          <button 
                            onClick={() => handleSaveSla(cat)}
                            className="bg-emerald-600 text-white p-1 rounded hover:bg-emerald-700 transition-all cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-500">{days} Days</span>
                          <button 
                            onClick={() => {
                              setEditingCat(cat);
                              setEditingValue(days);
                            }}
                            className="text-blue-600 hover:text-blue-700 font-bold text-[10px]"
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
