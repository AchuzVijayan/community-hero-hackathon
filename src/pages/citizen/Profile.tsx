import React from "react";
import { useApp } from "../../context/AppContext";
import { Trophy, Shield, Award, Calendar, CheckCircle, Clock, MapPin, ThumbsUp, Users, Check, Eye } from "lucide-react";

interface ProfileProps {
  onSelectIssue?: (id: string) => void;
}

export default function Profile({ onSelectIssue }: ProfileProps) {
  const { currentUser, issues, wards, updateProfile, communities, leaveCommunity } = useApp();

  if (!currentUser) return null;

  // Filter issues reported by current user
  const myReports = issues.filter(i => i.reporter_id === currentUser.id);

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "🦺": return "🦺";
      case "🕳️": return "🕳️";
      case "💡": return "💡";
      case "🔥": return "🔥";
      case "🏆": return "🏆";
      case "🕵️": return "🕵️";
      case "⚡": return "⚡";
      default: return "🌟";
    }
  };

  // Pre-configured list of all gamification badges to show unlocked/locked states beautifully
  const ALL_BADGES = [
    { id: "b1", name: "First Responder", emoji: "🦺", desc: "First verified report in your ward", color: "bg-orange-50 border-orange-100 text-orange-700" },
    { id: "b2", name: "Pothole Hunter", emoji: "🕳️", desc: "Reported and resolved 10 road issues", color: "bg-blue-50 border-blue-100 text-blue-700" },
    { id: "b3", name: "Light Guardian", emoji: "💡", desc: "Verified and fixed 5 streetlights", color: "bg-yellow-50 border-yellow-100 text-yellow-700" },
    { id: "b4", name: "Streak Reporter", emoji: "🔥", desc: "7-day consecutive reporting streak", color: "bg-red-50 border-red-100 text-red-700" },
    { id: "b5", name: "Ward Champion", emoji: "🏆", desc: "Highest points in ward this month", color: "bg-purple-50 border-purple-100 text-purple-700" },
    { id: "b6", name: "Duplicate Buster", emoji: "🕵️", desc: "Correctly flagged 5 duplicate entries", color: "bg-teal-50 border-teal-100 text-teal-700" },
    { id: "b7", name: "Speed Verifier", emoji: "⚡", desc: "First to verify 20 nearby issues", color: "bg-indigo-50 border-indigo-100 text-indigo-700" },
    { id: "b8", name: "Community Hero", emoji: "🌟", desc: "50+ verified reports and 500+ points", color: "bg-yellow-50 border-amber-200 text-amber-800" },
  ];

  const userWard = wards.find(w => w.id === currentUser.ward_id);

  const joinedCommunities = (communities || []).filter(
    c => currentUser && c.members && c.members.includes(currentUser.id)
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Profile summary card */}
      <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-6 items-center hover:border-indigo-100 transition-colors">
        {/* Avatar */}
        <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white rounded-full flex items-center justify-center font-black text-3xl shadow-lg shadow-indigo-100 uppercase relative shrink-0">
          {currentUser.name.substring(0, 2)}
          <div className="absolute bottom-0 right-0 bg-emerald-400 border-2 border-white w-4.5 h-4.5 rounded-full" />
        </div>

        {/* User Details */}
        <div className="flex-1 text-center md:text-left space-y-1">
          <h2 className="text-2xl font-black font-display text-slate-900 tracking-tight">{currentUser.name}</h2>
          
          <div className="flex items-center justify-center md:justify-start gap-1 text-xs font-black text-indigo-700 uppercase tracking-wider py-0.5">
            <MapPin className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              {currentUser.local_body ? `${currentUser.local_body}, Ward ${currentUser.ward_number || "N/A"}` : "Location Preference Not Set"}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-semibold">{currentUser.email}</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-1.5">
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-indigo-100">
              Role: {currentUser.role}
            </span>
            {userWard && (
              <span className="bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-amber-100">
                Ward: {userWard.name}
              </span>
            )}
            <button
              onClick={async () => {
                if (window.confirm("Would you like to reconfigure your governing local body location preference?")) {
                  await updateProfile(currentUser.id, { local_body: "" });
                }
              }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-200 cursor-pointer transition-colors"
            >
              Reconfigure Location
            </button>
          </div>
        </div>

        {/* Core Stats points & trust */}
        <div className="flex gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 w-full md:w-auto justify-around">
          <div className="text-center space-y-1 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100/50">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">
              Gamified Points
            </span>
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              <Trophy className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="font-black text-2xl font-display text-slate-850">
                {currentUser.points}
              </span>
            </div>
          </div>

          <div className="text-center space-y-1 bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-100/50">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block">
              Trust Rating
            </span>
            <div className="flex items-center justify-center gap-1.5 pt-0.5">
              <Shield className="w-5 h-5 text-indigo-600 fill-indigo-55/40" />
              <span className="font-black text-2xl font-display text-slate-850">
                {currentUser.trust_score}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges and Achievements section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h3 className="font-black text-slate-950 text-lg font-display tracking-tight">Civic Achievements & Badges</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {ALL_BADGES.map((badge) => {
            const isUnlocked = currentUser.badges.includes(badge.name);
            return (
              <div 
                key={badge.id}
                className={`p-5 rounded-3xl border-2 flex flex-col justify-between transition-all ${
                  isUnlocked 
                    ? `${badge.color} border-slate-200/60 shadow-sm hover:shadow-md hover:border-indigo-300 transform hover:-translate-y-0.5` 
                    : "bg-slate-50/50 border-slate-200/50 opacity-40 filter grayscale"
                }`}
              >
                <div>
                  <span className="text-3xl block mb-2">{badge.emoji}</span>
                  <span className="font-black text-xs block tracking-wide">{badge.name}</span>
                  <p className="text-[10px] leading-relaxed mt-1 font-medium">{badge.desc}</p>
                </div>
                <div className="mt-4">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${isUnlocked ? "bg-white/95 text-indigo-800 shadow-sm" : "bg-slate-200 text-slate-500"}`}>
                    {isUnlocked ? "Unlocked ✓" : "Locked"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Joined Communities section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <h3 className="font-black text-slate-950 text-lg font-display tracking-tight">My Joined Communities</h3>
        </div>

        {joinedCommunities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {joinedCommunities.map((comm) => {
              const commWard = wards.find((w) => w.id === comm.ward_id);
              const memberCount = (comm.members || []).length;

              return (
                <div 
                  key={comm.id} 
                  className="bg-white border-2 border-slate-100 rounded-3xl p-5 flex flex-col justify-between gap-3 transition-all hover:border-indigo-150 hover:shadow-sm"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md text-slate-500 font-mono">
                        {commWard ? commWard.name : "Local Ward"}
                      </span>
                      <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" /> Joined
                      </span>
                    </div>

                    <h4 className="text-sm font-black text-slate-900 tracking-tight">{comm.name}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium line-clamp-2">
                      {comm.description || "No description provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-1 text-[11px] font-bold text-slate-600">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>

                    <button
                      type="button"
                      onClick={() => leaveCommunity(comm.id)}
                      className="text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 transition-all cursor-pointer text-[10px] font-black uppercase tracking-wider"
                    >
                      Leave Group
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl p-6 text-center text-slate-500 border-2 border-dashed border-slate-200 font-medium text-xs leading-normal">
            You haven't joined any communities yet. Head over to the <strong className="font-black text-indigo-600">Feed → Communities</strong> tab to discover and join local neighborhood groups!
          </div>
        )}
      </div>

      {/* Activity logs history */}
      <div className="space-y-4">
        <h3 className="font-black text-slate-950 text-lg font-display tracking-tight">My Civic Postings History</h3>
        
        {myReports.length > 0 ? (
          <div className="bg-white border-2 border-slate-100 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm hover:border-indigo-100 transition-colors">
            {myReports.map((report) => (
              <div 
                key={report.id} 
                onClick={() => onSelectIssue && onSelectIssue(report.id)}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-indigo-50/10 transition-all cursor-pointer group"
              >
                <div className="space-y-1">
                  <span className="font-black text-slate-800 text-sm block group-hover:text-indigo-900 transition-colors">{report.title}</span>
                  <div className="flex flex-wrap gap-3 items-center text-xs text-slate-400 font-bold">
                    <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-lg border border-indigo-100/30">
                      {report.category}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-500">
                      <ThumbsUp className="w-3.5 h-3.5 text-slate-400" />
                      {report.upvotes} Vouches
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border ${
                    report.status === "resolved" 
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                      : report.status === "in_progress"
                      ? "bg-amber-50 border-amber-200 text-amber-700"
                      : "bg-slate-50 border-slate-200 text-slate-700"
                  }`}>
                    {report.status}
                  </span>
                  
                  {onSelectIssue && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIssue(report.id);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Updates
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl p-8 text-center text-slate-500 border-2 border-dashed border-slate-200 font-medium">
            No issues filed yet. Click "Report Issue" to earn your first +50 points!
          </div>
        )}
      </div>
    </div>
  );
}
