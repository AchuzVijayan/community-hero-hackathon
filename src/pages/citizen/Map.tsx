import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import MapView from "../../components/MapView";
import { Sparkles, MapPin, Eye, ThumbsUp, ThumbsDown, AlertCircle, Crosshair } from "lucide-react";

interface CitizenMapPageProps {
  onSelectIssue: (id: string) => void;
}

export default function CitizenMapPage({ onSelectIssue }: CitizenMapPageProps) {
  const { issues, wards, upvoteIssue, downvoteIssue, selectIssue, selectedIssueId } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(false);
  const [focusLocation, setFocusLocation] = useState<[number, number] | null>(null);

  // Categories to filter
  const categories = ["All", "Pothole", "Water Leakage", "Broken Streetlight", "Garbage Dumping", "Damaged Footpath"];
  const statuses = [
    { label: "All Statuses", value: "All" },
    { label: "Reported Only", value: "reported" },
    { label: "Verified Only", value: "verified" },
    { label: "Active Repairs", value: "in_progress" },
    { label: "Resolved Proofs", value: "resolved" }
  ];

  // Currently selected issue details overlay card on top of the map
  const activeSelectedIssue = issues.find(i => i.id === selectedIssueId);

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row rounded-2xl border border-slate-100 overflow-hidden shadow-sm relative bg-white animate-slide-up">
      
      {/* Map Control Settings Panel on Left */}
      <div className="w-full md:w-80 bg-slate-50 border-r border-slate-150 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold font-display text-slate-800">Hyperlocal Live map</h2>
            <p className="text-xs text-slate-500">
              Color-coded pins indicate severity of problems. Red represents critical threat points.
            </p>
          </div>

          {/* Heatmap overlay switch */}
          <div className="p-3.5 bg-gradient-to-tr from-orange-50 to-amber-50 border border-orange-100 rounded-xl flex items-center justify-between gap-3 shadow-inner">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-orange-950 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-650" />
                Civic Density Heatmap
              </span>
              <span className="text-[10px] text-orange-750 block">Highlight high-density issue clusters</span>
            </div>
            <button 
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`w-11 h-6 rounded-full p-1 transition-all ${showHeatmap ? "bg-orange-600" : "bg-slate-300"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-all ${showHeatmap ? "translate-x-5" : ""}`} />
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Category Filter</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 block">Status Filter</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none"
            >
              {statuses.map(s => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {/* Focus Location Picker */}
          <div className="space-y-1.5 border-t border-slate-150 pt-4">
            <label className="text-xs font-bold text-slate-700 block">Select View Focus Location</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        setFocusLocation([pos.coords.latitude, pos.coords.longitude]);
                      },
                      (err) => {
                        console.error("Geolocation error:", err);
                      }
                    );
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5" />
                My Current GPS Location
              </button>

              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === "default") {
                    setFocusLocation(null);
                  } else {
                    const [lat, lng] = val.split(",").map(Number);
                    setFocusLocation([lat, lng]);
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="default">Kochi Center (Default)</option>
                <option value="9.9678,76.2231">Fort Kochi Beach</option>
                <option value="10.0272,76.3080">Edappally (Lulu Mall)</option>
                <option value="9.9591,76.2595">Mattancherry Palace</option>
                <option value="9.9696,76.3212">Vyttila Mobility Hub</option>
                <option value="9.9798,76.2754">Marine Drive Walkway</option>
              </select>
            </div>
          </div>
        </div>

        {/* Small warning note */}
        <div className="text-[10px] text-slate-400 bg-white border border-slate-150 p-2.5 rounded-lg flex gap-1.5 leading-normal">
          <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
          Dragging map adjusts perspective. Click pins to upvote or inspect full details.
        </div>
      </div>

      {/* Main Map Leaflet Container */}
      <div className="flex-1 h-full relative">
        <MapView
          issues={issues}
          wards={wards}
          selectedIssueId={selectedIssueId || undefined}
          onSelectIssue={(id) => {
            selectIssue(id);
          }}
          showHeatmap={showHeatmap}
          filterCategory={filterCategory}
          filterStatus={filterStatus}
          focusLocation={focusLocation}
        />

        {/* Floating details overlay card if a pin is selected */}
        {activeSelectedIssue && (
          <div className="absolute bottom-5 left-5 right-5 md:right-auto md:w-96 bg-white border border-slate-100 rounded-xl p-4 shadow-xl z-[1000] flex gap-3 animate-slide-up">
            <img 
              src={activeSelectedIssue.before_image} 
              alt={activeSelectedIssue.title}
              referrerPolicy="no-referrer"
              className="w-20 h-20 rounded-lg object-cover bg-slate-100 shrink-0" 
            />
            <div className="flex-1 space-y-2 overflow-hidden">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {activeSelectedIssue.category}
                </span>
                <h4 className="font-bold text-slate-800 text-sm mt-1 truncate">{activeSelectedIssue.title}</h4>
                <p className="text-[10px] text-slate-500 truncate">{activeSelectedIssue.address}</p>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-50 gap-2">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => upvoteIssue(activeSelectedIssue.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-indigo-600"
                    title="Upvote"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{activeSelectedIssue.upvotes || 0}</span>
                  </button>
                  <button 
                    onClick={() => downvoteIssue(activeSelectedIssue.id)}
                    className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-rose-600"
                    title="Downvote"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>{activeSelectedIssue.downvotes || 0}</span>
                  </button>
                </div>

                <button 
                  onClick={() => onSelectIssue(activeSelectedIssue.id)}
                  className="bg-slate-900 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  Inspect Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
