import React, { useState } from "react";
import { Issue, Ward } from "../types";
import { ThumbsUp, ThumbsDown, Calendar, MapPin, AlertCircle, Eye, CheckCircle2, Clock, Image, MessageSquare } from "lucide-react";
import { useApp } from "../context/AppContext";

interface IssueCardProps {
  issue: Issue;
  ward?: Ward;
  onSelect: (issueId: string) => void;
}

export default function IssueCard({ issue, ward, onSelect }: IssueCardProps) {
  const { upvoteIssue, downvoteIssue, currentUser, setShouldFocusComments } = useApp();
  const [imageError, setImageError] = useState(false);

  const isUpvoted = currentUser ? issue.upvoted_by?.includes(currentUser.id) : false;
  const isDownvoted = currentUser ? issue.downvoted_by?.includes(currentUser.id) : false;

  // Severity style configuration
  const getSeverityStyle = (severity: number) => {
    if (severity >= 8) {
      return {
        bg: "bg-rose-50 border-rose-100",
        text: "text-rose-700",
        badge: "bg-rose-500 text-white",
        dot: "bg-rose-500",
        label: "Critical"
      };
    } else if (severity >= 4) {
      return {
        bg: "bg-amber-50 border-amber-100",
        text: "text-amber-700",
        badge: "bg-amber-500 text-white",
        dot: "bg-amber-500",
        label: "Moderate"
      };
    } else {
      return {
        bg: "bg-emerald-50 border-emerald-100",
        text: "text-emerald-700",
        badge: "bg-emerald-500 text-white",
        dot: "bg-emerald-500",
        label: "Low"
      };
    }
  };

  const severityStyle = getSeverityStyle(issue.severity);

  // Status colors configuration
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "resolved":
        return { bg: "bg-emerald-50 border border-emerald-200 text-emerald-700", text: "Resolved", icon: CheckCircle2 };
      case "in_progress":
        return { bg: "bg-amber-50 border border-amber-200 text-amber-700", text: "In Progress", icon: Clock };
      case "verified":
        return { bg: "bg-indigo-50 border border-indigo-200 text-indigo-700", text: "Verified", icon: Clock };
      default:
        return { bg: "bg-slate-50 border border-slate-200 text-slate-700", text: "Reported", icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(issue.status);
  const StatusIcon = statusConfig.icon;

  const dateStr = new Date(issue.created_at).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  return (
    <div 
      className="bg-white rounded-3xl border-2 border-slate-100 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
      id={`issue-card-${issue.id}`}
    >
      {/* Top Banner with Image */}
      <div className="relative h-44 bg-slate-100 overflow-hidden group">
        {!issue.before_image || imageError ? (
          <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-6 text-center select-none border-b border-slate-100">
            <Image className="w-6 h-6 text-slate-300 mb-2 animate-pulse" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">
              No Image Provided
            </span>
            <span className="text-[10px] font-bold text-slate-400 max-w-[200px] line-clamp-2 leading-tight">
              {issue.title}
            </span>
          </div>
        ) : (
          <img 
            src={issue.before_image} 
            alt={issue.title}
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
          />
        )}
        {/* Badges Container */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-1.5 z-10">
          <div className="flex flex-wrap gap-1 sm:gap-1.5 items-center">
            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm ${severityStyle.badge}`}>
              Severity {issue.severity}
            </span>
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm bg-indigo-900/90 text-white truncate max-w-[75px] sm:max-w-[120px]" title={issue.category}>
              {issue.category}
            </span>
          </div>
          <div className="flex shrink-0">
            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1 backdrop-blur-sm ${statusConfig.bg}`}>
              <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {statusConfig.text}
            </span>
          </div>
        </div>

        {/* SLA Warning Overlay if breached */}
        {issue.status !== "resolved" && new Date(issue.sla_deadline).getTime() < Date.now() && (
          <div className="absolute bottom-0 inset-x-0 bg-rose-600/95 text-white text-[10px] font-black py-1.5 px-3 flex items-center justify-between shadow-lg z-10 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              SLA BREACHED: Overdue Response
            </span>
          </div>
        )}
      </div>

      {/* Content Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-2">
            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate max-w-[180px]">{issue.address}</span>
            <span className="text-slate-300">•</span>
            <span className="text-indigo-600 font-extrabold">{ward?.name || "Local Ward"}</span>
          </div>

          <h3 className="font-black text-slate-900 text-lg leading-tight hover:text-indigo-600 transition-colors line-clamp-1 cursor-pointer" onClick={() => onSelect(issue.id)}>
            {issue.title}
          </h3>

          <p className="text-slate-650 text-xs mt-2 line-clamp-2 leading-relaxed font-medium">
            {issue.description}
          </p>
        </div>

        {/* Interaction Bar */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {/* Upvote Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                upvoteIssue(issue.id);
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-black tracking-wide transition-all ${
                isUpvoted 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" 
                  : "bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100"
              }`}
              title="Upvote/Vouch"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? "fill-white text-white" : ""}`} />
              <span>{issue.upvotes || 0}</span>
            </button>

            {/* Downvote Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                downvoteIssue(issue.id);
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-black tracking-wide transition-all ${
                isDownvoted 
                  ? "bg-rose-600 text-white shadow-md shadow-rose-100" 
                  : "bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100"
              }`}
              title="Downvote"
            >
              <ThumbsDown className={`w-3.5 h-3.5 ${isDownvoted ? "fill-white text-white" : ""}`} />
              <span>{issue.downvotes || 0}</span>
            </button>

            {/* Comment Button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShouldFocusComments(true);
                onSelect(issue.id);
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-black tracking-wide bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100 transition-all cursor-pointer"
              title="Comments"
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>{issue.comment_count || 0}</span>
            </button>
          </div>

          <button 
            onClick={() => onSelect(issue.id)}
            className="flex items-center gap-1 text-xs font-black text-indigo-600 hover:text-indigo-750 transition-colors"
          >
            <Eye className="w-4 h-4" />
            VIEW DETAILS
          </button>
        </div>
      </div>
    </div>
  );
}
