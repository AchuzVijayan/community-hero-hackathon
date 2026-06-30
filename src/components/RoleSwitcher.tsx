import React from "react";
import { useApp } from "../context/AppContext";
import { Building2, MapPin, Globe } from "lucide-react";
import { STATE_DISTRICTS } from "../data/indiaData";
import { getLocalBodiesForDistrict } from "../data/localBodies";

export default function RoleSwitcher() {
  const { 
    currentUser, 
    activeState, 
    setActiveState, 
    activeMunicipality, 
    setActiveMunicipality, 
    activeLocalBody, 
    setActiveLocalBody 
  } = useApp();

  if (!currentUser) return null;

  const states = Object.keys(STATE_DISTRICTS).sort();
  const districts = STATE_DISTRICTS[activeState] || [];
  const localBodies = getLocalBodiesForDistrict(activeMunicipality);

  return (
    <div className="bg-slate-900 text-white px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold shadow-md border-b border-slate-800 z-50 relative">
      <div className="flex flex-wrap items-center gap-4">
        {/* State section */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wider font-mono shrink-0 font-bold">State:</span>
          <div className="relative">
            <select
              value={activeState}
              onChange={(e) => {
                const newState = e.target.value;
                setActiveState(newState);
                const firstDist = STATE_DISTRICTS[newState]?.[0] || "";
                if (firstDist) {
                  setActiveMunicipality(firstDist);
                }
              }}
              className="appearance-none bg-slate-850 hover:bg-slate-800 text-amber-400 px-3 py-1 pr-8 rounded-lg border border-slate-750 font-black tracking-tight cursor-pointer focus:outline-none focus:border-amber-400 transition-all shadow-inner"
            >
              {states.map((st) => (
                <option key={st} value={st} className="bg-slate-900 text-white font-bold">
                  {st}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-amber-400">
              <Globe className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Environment (District) section */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wider font-mono shrink-0 font-bold">District:</span>
          <div className="relative">
            <select
              value={activeMunicipality}
              onChange={(e) => setActiveMunicipality(e.target.value)}
              className="appearance-none bg-slate-850 hover:bg-slate-800 text-emerald-400 px-3 py-1 pr-8 rounded-lg border border-slate-750 font-black tracking-tight cursor-pointer focus:outline-none focus:border-emerald-400 transition-all shadow-inner"
              id="environment-selector-btn"
            >
              {districts.map((dist) => (
                <option key={dist} value={dist} className="bg-slate-900 text-white font-bold">
                  {dist}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-400">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Local Bodies section */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase tracking-wider font-mono shrink-0 font-bold">Local Body:</span>
          <div className="relative">
            <select
              value={activeLocalBody}
              onChange={(e) => setActiveLocalBody(e.target.value)}
              className="appearance-none bg-slate-850 hover:bg-slate-800 text-indigo-300 px-3 py-1 pr-8 rounded-lg border border-slate-750 font-black tracking-tight cursor-pointer focus:outline-none focus:border-indigo-400 transition-all shadow-inner"
            >
              {localBodies.map((lb) => (
                <option key={lb.id} value={lb.name} className="bg-slate-900 text-white font-bold">
                  [{lb.type}] {lb.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-400">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
