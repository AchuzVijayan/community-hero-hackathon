import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import IssueCard from "../../components/IssueCard";
import { 
  AlertCircle, 
  Plus, 
  Search, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Users, 
  PlusCircle, 
  Check, 
  CheckCircle, 
  Globe, 
  Info, 
  ArrowRight,
  Filter,
  UserCheck
} from "lucide-react";
import { getLocalBodiesForDistrict } from "../../data/localBodies";

interface FeedProps {
  onSelectIssue: (id: string) => void;
  onNavigateToReport: () => void;
}

export default function Feed({ onSelectIssue, onNavigateToReport }: FeedProps) {
  const { 
    issues, 
    wards, 
    currentUser, 
    communities, 
    createCommunity, 
    joinCommunity, 
    leaveCommunity,
    activeMunicipality,
    activeLocalBody,
    setActiveLocalBody
  } = useApp();

  const [selectedWardId, setSelectedWardId] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeSubTab, setActiveSubTab] = useState<'trending' | 'my_reports' | 'resolved' | 'communities'>('trending');

  const localBodies = getLocalBodiesForDistrict(activeMunicipality);

  // Community-specific states
  const [communitySearchTerm, setCommunitySearchTerm] = useState<string>("");
  const [isCreatingCommunity, setIsCreatingCommunity] = useState<boolean>(false);
  const [newCommName, setNewCommName] = useState<string>("");
  const [newCommDesc, setNewCommDesc] = useState<string>("");
  const [newCommWardId, setNewCommWardId] = useState<string>("ward_1");
  const [communityMessage, setCommunityMessage] = useState<string>("");
  
  // Toggle to filter problems by ONLY joined communities' wards
  const [filterByJoinedCommunities, setFilterByJoinedCommunities] = useState<boolean>(false);

  // Active user's joined community list
  const userJoinedCommunities = (communities || []).filter(
    (c) => currentUser && c.members && c.members.includes(currentUser.id)
  );

  // Wards covered by user's joined communities
  const joinedCommunitiesWardIds = userJoinedCommunities.map((c) => c.ward_id);

  // Select active ward details
  const activeWard = wards.find(w => w.id === (selectedWardId === "All" ? currentUser?.ward_id : selectedWardId));

  // Determine health color band
  const getHealthBand = (score: number) => {
    if (score >= 90) return { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", ring: "ring-emerald-500", label: "Excellent 🟢", labelStyle: "text-emerald-600 bg-emerald-100", progress: "bg-emerald-500" };
    if (score >= 70) return { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", ring: "ring-yellow-500", label: "Moderate 🟡", labelStyle: "text-yellow-600 bg-yellow-100", progress: "bg-yellow-500" };
    if (score >= 50) return { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", ring: "ring-orange-500", label: "Poor 🟠", labelStyle: "text-orange-600 bg-orange-100", progress: "bg-orange-500" };
    return { bg: "bg-red-50 border-red-200 animate-pulse", text: "text-red-700", ring: "ring-red-500", label: "Critical 🔴", labelStyle: "text-red-600 bg-red-100 font-bold", progress: "bg-red-500" };
  };

  const healthStyle = activeWard ? getHealthBand(activeWard.health_score) : getHealthBand(80);

  // Filter issues based on community, ward, category, search term, and subtabs
  const filteredIssues = issues.filter((issue) => {
    // Community ward filter if toggled
    if (filterByJoinedCommunities && activeSubTab !== "my_reports") {
      if (!joinedCommunitiesWardIds.includes(issue.ward_id)) {
        return false;
      }
    }

    // Ward filter
    const matchesWard = selectedWardId === "All" || issue.ward_id === selectedWardId;
    
    // Category filter
    const matchesCategory = selectedCategory === "All" || issue.category === selectedCategory;
    
    // Search filter
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Sub-tab filter
    let matchesTab = true;
    if (activeSubTab === "my_reports") {
      matchesTab = issue.reporter_id === currentUser?.id;
    } else if (activeSubTab === "resolved") {
      matchesTab = issue.status === "resolved";
    }

    return matchesWard && matchesCategory && matchesSearch && matchesTab && !issue.is_duplicate;
  });

  // Sort: if trending, sort by upvotes; otherwise by created date
  const sortedIssues = [...filteredIssues].sort((a, b) => {
    if (activeSubTab === 'trending') {
      return b.upvotes - a.upvotes;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Filter communities based on search term
  const searchedCommunities = (communities || []).filter((c) => {
    const wardName = wards.find(w => w.id === c.ward_id)?.name || "";
    return c.name.toLowerCase().includes(communitySearchTerm.toLowerCase()) ||
           c.description.toLowerCase().includes(communitySearchTerm.toLowerCase()) ||
           wardName.toLowerCase().includes(communitySearchTerm.toLowerCase());
  });

  const handleCreateCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;
    try {
      await createCommunity(newCommName.trim(), newCommDesc.trim(), newCommWardId);
      setCommunityMessage("🎉 Community group created successfully!");
      setNewCommName("");
      setNewCommDesc("");
      setIsCreatingCommunity(false);
      setTimeout(() => setCommunityMessage(""), 4000);
    } catch (err) {
      console.error(err);
      setCommunityMessage("❌ Failed to create community. Try again.");
    }
  };

  const handleQuickCreate = async (name: string) => {
    try {
      const defaultDesc = `Public group for residents and volunteers of ${wards.find(w => w.id === currentUser?.ward_id)?.name || "Kochi Wards"} to coordinate civic improvements.`;
      await createCommunity(name, defaultDesc, currentUser?.ward_id || "ward_1");
      setCommunityMessage(`🎉 Created and joined public group "${name}"!`);
      setCommunitySearchTerm("");
      setTimeout(() => setCommunityMessage(""), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const categories = ["All", "Pothole", "Water Leakage", "Broken Streetlight", "Garbage Dumping", "Damaged Footpath"];

  return (
    <div className="space-y-6">
      {/* Ward Health Score Widget */}
      {activeWard && activeSubTab !== 'communities' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-150 sm:border-2 border-slate-100 p-4 sm:p-5 lg:p-6 shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-up hover:border-indigo-100">
          <div className="space-y-1.5 sm:space-y-2 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${healthStyle.labelStyle} shadow-sm`}>
                Ward Health Score: {healthStyle.label}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black font-display text-slate-900 tracking-tight">
              {activeWard.name}, <span className="text-indigo-600">{activeWard.city}</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-md font-medium leading-relaxed">
              Ward health metrics represent the active resolution performance and safety state of local infrastructure. Keep reporting to maintain scores!
            </p>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 shadow-inner">
            <div className="relative flex items-center justify-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-slate-900 font-black text-lg sm:text-xl md:text-2xl font-display relative z-10 bg-white shadow-sm">
                {activeWard.health_score}
                <div className="absolute inset-0 rounded-full border-2 sm:border-4 border-slate-100" />
                <div 
                  className={`absolute inset-0 rounded-full border-2 sm:border-4 border-t-transparent border-l-transparent ${activeWard.health_score > 70 ? "border-emerald-500" : activeWard.health_score > 50 ? "border-amber-500" : "border-rose-500"}`} 
                  style={{ transform: `rotate(${activeWard.health_score * 3.6}deg)` }}
                />
              </div>
            </div>
            <div className="text-[11px] sm:text-xs font-bold text-slate-700 flex flex-col justify-center">
              <span>Status: <strong className={healthStyle.text}>{activeWard.health_score >= 80 ? "Excellent" : activeWard.health_score >= 60 ? "Stable" : "Critical Warning"}</strong></span>
              <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-semibold">
                {activeWard.health_score >= 80 ? (
                  <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-500" />
                )}
                Recalculated live
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Community Hub Header info widget */}
      {activeSubTab === 'communities' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-150 sm:border-2 border-slate-100 p-4 sm:p-5 lg:p-6 shadow-sm transition-all flex flex-col md:flex-row items-center justify-between gap-4 animate-slide-up hover:border-indigo-100">
          <div className="space-y-1.5 sm:space-y-2 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-indigo-700 bg-indigo-50 shadow-sm flex items-center gap-1">
                <Users className="w-3 h-3" /> Public Community Groups
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-black font-display text-slate-900 tracking-tight">
              Kochi Ward <span className="text-indigo-600">Communities</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-xl font-medium leading-relaxed">
              Join Ward public groups to filter your civic feed to only the wards you belong to! This keeps your feed clean of distant complaints and brings relevant neighborhood actions straight to your hands.
            </p>
          </div>

          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center max-w-xs shrink-0">
            <span className="text-[11px] sm:text-xs font-bold text-slate-700">Joined Communities</span>
            <span className="text-2xl sm:text-3xl font-black text-indigo-600 mt-0.5 sm:mt-1">{userJoinedCommunities.length}</span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5 sm:mt-1 font-semibold">Keeping your feed relevant</span>
          </div>
        </div>
      )}

      {/* AI Spark Quick Assist Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white opacity-10 rounded-full"></div>
        <div className="absolute -left-3 -top-3 w-12 h-12 bg-white opacity-5 rounded-full"></div>
        
        <div className="flex items-center gap-3 sm:gap-4 relative z-10">
          <div className="bg-white/10 p-2 sm:p-3 rounded-xl sm:rounded-2xl backdrop-blur-sm shadow-md">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h4 className="font-black text-sm sm:text-base tracking-tight">Have a community problem near you?</h4>
            <p className="text-[11px] sm:text-xs text-indigo-100 mt-0.5 sm:mt-1 font-medium max-w-xl leading-relaxed">
              Report immediately with a simple photo. Our Gemini-powered AI classifies, scores, and routes your complaints to Kochi officers automatically!
            </p>
          </div>
        </div>
        <button 
          onClick={onNavigateToReport}
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-black text-[11px] sm:text-xs py-2 sm:py-2.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl shadow-lg transition-all cursor-pointer whitespace-nowrap relative z-10 transform active:scale-95 hover:shadow-xl"
        >
          <Plus className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
          FILE REPORT
        </button>
      </div>

      {/* Filter and Search Bar controls */}
      <div className="space-y-4">
        {communityMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-bounce flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            {communityMessage}
          </div>
        )}

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 w-full">
          {/* Sub-tabs Selection */}
          <div className="flex bg-white p-0.5 sm:p-1 rounded-xl sm:rounded-2xl shadow-sm border sm:border-2 border-slate-100 overflow-x-auto no-scrollbar shrink-0">
            <button
              onClick={() => {
                setActiveSubTab("trending");
              }}
              className={`px-3 sm:px-4.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === "trending" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              Trending Problems
            </button>
            <button
              onClick={() => {
                setActiveSubTab("my_reports");
              }}
              className={`px-3 sm:px-4.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === "my_reports" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              My Reports
            </button>
            <button
              onClick={() => {
                setActiveSubTab("resolved");
              }}
              className={`px-3 sm:px-4.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeSubTab === "resolved" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              Resolved Proofs
            </button>
            <button
              onClick={() => {
                setActiveSubTab("communities");
              }}
              className={`px-3 sm:px-4.5 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                activeSubTab === "communities" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-600 hover:text-indigo-600"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Public Communities
            </button>
          </div>

          {/* Search bar & Ward Filter */}
          {activeSubTab !== "communities" ? (
            <div className="flex gap-2 items-center flex-wrap xl:flex-nowrap w-full xl:w-auto min-w-0">
              {/* Joined Communities Filter Checkbox */}
              {userJoinedCommunities.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterByJoinedCommunities(!filterByJoinedCommunities)}
                  className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold transition-all border border-slate-200 cursor-pointer shrink-0 ${
                    filterByJoinedCommunities
                      ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  title="Filter feed to only display issues from wards of communities you have joined"
                >
                  <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Communities: </span>
                  <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-black ${filterByJoinedCommunities ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                    {filterByJoinedCommunities ? "ON" : "OFF"}
                  </span>
                </button>
              )}

              <div className="relative flex-1 xl:w-44 min-w-[110px]">
                <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-2.5 sm:top-3" />
                <input 
                  type="text" 
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border border-slate-200 sm:border-2 border-slate-100 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none shadow-sm"
                />
              </div>

              <select 
                value={activeLocalBody}
                onChange={(e) => {
                  setActiveLocalBody(e.target.value);
                  setSelectedWardId("All");
                }}
                className="bg-white border border-slate-200 sm:border-2 border-slate-100 py-1.5 sm:py-2 px-2.5 sm:px-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer max-w-[180px] sm:max-w-[220px] min-w-0 truncate"
              >
                <option value="All">All wards of {activeMunicipality}</option>
                {localBodies.map(lb => (
                  <option key={lb.id} value={lb.name}>{lb.name}</option>
                ))}
              </select>
            </div>
          ) : (
            /* Search communities bar */
            <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap w-full xl:w-auto min-w-0">
              <div className="relative flex-1 xl:w-64 min-w-[150px]">
                <Search className="w-3.5 h-3.5 text-indigo-400 absolute left-3 top-2.5 sm:top-3" />
                <input 
                  type="text" 
                  placeholder="Search communities..."
                  value={communitySearchTerm}
                  onChange={(e) => setCommunitySearchTerm(e.target.value)}
                  className="w-full bg-white pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 border border-slate-200 sm:border-2 border-slate-100 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingCommunity(!isCreatingCommunity)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] sm:text-xs py-1.5 sm:py-2 px-3 sm:px-4 rounded-xl sm:rounded-2xl flex items-center gap-1 sm:gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
              >
                <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Create Group</span>
              </button>
            </div>
          )}
        </div>

        {/* Categories Pills Filters */}
        {activeSubTab !== "communities" && (
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto py-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-extrabold whitespace-nowrap transition-all border sm:border-2 cursor-pointer ${
                  selectedCategory === cat 
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100" 
                    : "bg-white text-slate-650 border-slate-200 sm:border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {activeSubTab !== "communities" ? (
        /* PROBLEMS FEED RENDER */
        <div>
          {filterByJoinedCommunities && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-3 text-indigo-800 text-xs font-bold mb-4 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Showing only issues reported inside wards of your joined communities: ({userJoinedCommunities.map(c => c.name).join(", ") || "None"}).
              </span>
              <button 
                onClick={() => setFilterByJoinedCommunities(false)} 
                className="text-[10px] uppercase font-black text-indigo-600 hover:underline cursor-pointer"
              >
                Clear Filter
              </button>
            </div>
          )}

          {sortedIssues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {sortedIssues.map((issue) => {
                const issueWard = wards.find(w => w.id === issue.ward_id);
                return (
                  <div key={issue.id} className="flex flex-col">
                    <IssueCard
                      issue={issue}
                      ward={issueWard}
                      onSelect={(id) => onSelectIssue(id)}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h3 className="font-bold text-slate-800 text-base">No active issues found</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  {filterByJoinedCommunities 
                    ? "No reported issues match your active communities filter. Try joining more groups or toggle the Communities filter off!" 
                    : "We couldn't find any issues matching your exact filters and searches. Let's make sure the neighborhood stays pristine!"}
                </p>
              </div>
              <div className="flex justify-center gap-3">
                {filterByJoinedCommunities && (
                  <button 
                    onClick={() => setFilterByJoinedCommunities(false)}
                    className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Turn off Filter
                  </button>
                )}
                <button 
                  onClick={onNavigateToReport}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs py-2 px-4 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Submit First Complaint
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PUBLIC COMMUNITIES HUB RENDER */
        <div className="space-y-6">
          {/* Create community form panel */}
          {isCreatingCommunity && (
            <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-5 shadow-sm animate-slide-down space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-black text-slate-900 text-sm">Create Public Community Group</h3>
                </div>
                <button 
                  onClick={() => setIsCreatingCommunity(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateCommunitySubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Group Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Fort Kochi Heritage Cleaners" 
                      value={newCommName} 
                      onChange={(e) => setNewCommName(e.target.value)}
                      required
                      className="w-full bg-white px-3.5 py-2 border border-slate-250 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Associated Kochi Ward</label>
                    <select
                      value={newCommWardId}
                      onChange={(e) => setNewCommWardId(e.target.value)}
                      className="w-full bg-white px-3 py-2 border border-slate-250 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                    >
                      {wards.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Group Purpose / Description</label>
                  <textarea 
                    placeholder="Describe what issues this community coordinates on (e.g. cleanliness, broken lights, trash)." 
                    value={newCommDesc} 
                    onChange={(e) => setNewCommDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-white px-3.5 py-2 border border-slate-250 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 px-5 rounded-xl transition-all shadow-md cursor-pointer"
                  >
                    Create & List Community
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Communities search feedback */}
          {communitySearchTerm && (
            <div className="text-xs font-bold text-slate-500">
              Showing {searchedCommunities.length} results for public groups matching "{communitySearchTerm}"
            </div>
          )}

          {/* Communities Grid List */}
          {searchedCommunities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {searchedCommunities.map((comm) => {
                const commWard = wards.find((w) => w.id === comm.ward_id);
                const isMember = currentUser && comm.members && comm.members.includes(currentUser.id);
                const memberCount = (comm.members || []).length;

                return (
                  <div 
                    key={comm.id} 
                    className={`bg-white border-2 rounded-3xl p-5 flex flex-col justify-between gap-4 transition-all hover:shadow-md ${
                      isMember ? "border-indigo-150 hover:border-indigo-250 bg-gradient-to-b from-white to-indigo-50/10" : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-mono">
                          {commWard ? commWard.name : "Kochi Ward"}
                        </span>
                        {isMember && (
                          <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5 animate-pulse">
                            <Check className="w-2.5 h-2.5" /> Joined Member
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900 tracking-tight">{comm.name}</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium min-h-12 line-clamp-3">
                        {comm.description || "No description provided."}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-600">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-indigo-500" />
                        {memberCount} {memberCount === 1 ? "member" : "members"}
                      </span>

                      {isMember ? (
                        <button
                          type="button"
                          onClick={() => leaveCommunity(comm.id)}
                          className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer text-[10px]"
                        >
                          Leave Group
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => joinCommunity(comm.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm text-[10px] font-black"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* EMPTY STATE AND SEARCH CREATOR ENGINE */
            <div className="bg-white border border-slate-150 rounded-3xl p-8 text-center max-w-lg mx-auto space-y-5 shadow-sm">
              <Users className="w-14 h-14 text-indigo-400 mx-auto animate-pulse" />
              <div className="space-y-2">
                <h3 className="font-black text-slate-800 text-base">No public communities found</h3>
                <p className="text-slate-500 text-xs leading-relaxed max-w-md mx-auto">
                  {communitySearchTerm.trim() 
                    ? `We couldn't find any community matching "${communitySearchTerm}". Under our public group policy, you can instantly create this community now so other residents of Kochi can discover and join it!`
                    : "No public communities are available. Why don't you start the very first civic community in your neighborhood?"}
                </p>
              </div>

              {communitySearchTerm.trim() ? (
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-left space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-indigo-900 font-semibold leading-relaxed">
                      You searched for <strong className="font-black">"{communitySearchTerm}"</strong>. Click the button below to instantly register and launch this community group under your active ward!
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickCreate(communitySearchTerm.trim())}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create & Join "{communitySearchTerm}" instantly</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCreatingCommunity(true)}
                  className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs py-2.5 px-5 rounded-2xl transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-md"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" />
                  Create Neighborhood Community
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
