import React, { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { 
  ArrowLeft, Calendar, MapPin, AlertCircle, Sparkles, ThumbsUp, ThumbsDown,
  MessageSquare, User, Check, Send, ShieldAlert, FileText, Download, CheckCircle2,
  Heart, CornerDownRight, ChevronDown, ChevronUp, Reply, Mail, Trash2, Minimize2, Maximize2
} from "lucide-react";

interface IssueDetailProps {
  onBack: () => void;
}

export default function IssueDetail({ onBack }: IssueDetailProps) {
  const { 
    selectedIssue, 
    upvoteIssue, 
    downvoteIssue, 
    addComment, 
    likeComment, 
    replyToComment, 
    verifyIssue, 
    currentUser, 
    wards,
    shouldFocusComments,
    setShouldFocusComments
  } = useApp();

  const commentInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (shouldFocusComments && commentInputRef.current) {
      const target = commentInputRef.current;
      setTimeout(() => {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.focus();
      }, 300);
      setShouldFocusComments(false);
    }
  }, [shouldFocusComments, setShouldFocusComments]);
  
  const [commentText, setCommentText] = useState<string>("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState<boolean>(false);
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);

  // States for comment likes & nested replies
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>("");
  const [expandedCommentIds, setExpandedCommentIds] = useState<Record<string, boolean>>({});

  // Letter custom draft/minimize states
  const [isLetterMinimized, setIsLetterMinimized] = useState<boolean>(false);
  const [isDraftingEmail, setIsDraftingEmail] = useState<boolean>(false);
  const [draftRecipient, setDraftRecipient] = useState<string>("commissioner@kochicollectrate.gov.in");
  const [draftSubject, setDraftSubject] = useState<string>("");
  const [draftBody, setDraftBody] = useState<string>("");
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [showMailSentStatus, setShowMailSentStatus] = useState<boolean>(false);

  const handleOpenMailClient = () => {
    const mailtoUrl = `mailto:${encodeURIComponent(draftRecipient)}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draftBody)}`;
    window.location.href = mailtoUrl;
    setShowMailSentStatus(true);
    setTimeout(() => {
      setShowMailSentStatus(false);
    }, 5000);
  };

  if (!selectedIssue) {
    return (
      <div className="p-8 text-center text-slate-500">
        No issue selected. Select an issue from the feed or map.
      </div>
    );
  }

  // Find ward details
  const issueWard = wards.find(w => w.id === selectedIssue.ward_id);

  const isUpvoted = currentUser ? selectedIssue.upvoted_by?.includes(currentUser.id) : false;
  const isDownvoted = currentUser ? selectedIssue.downvoted_by?.includes(currentUser.id) : false;
  const isReporter = currentUser ? selectedIssue.reporter_id === currentUser.id : false;

  // Check if user has already verified
  const userVerifications = selectedIssue.verifications || [];
  const hasConfirmed = currentUser ? userVerifications.some((v: any) => v.user_id === currentUser.id && v.type === "confirm") : false;
  const hasVerifiedResolved = currentUser ? userVerifications.some((v: any) => v.user_id === currentUser.id && v.type === "resolve") : false;

  // Trigger Gemini AI Letter Generation
  const handleGenerateComplaintLetter = async () => {
    try {
      setIsGeneratingLetter(true);
      const isSlaBreached = new Date(selectedIssue.sla_deadline).getTime() < Date.now();
      
      const res = await fetch("/api/ai/generate-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueTitle: selectedIssue.title,
          category: selectedIssue.category,
          severity: selectedIssue.severity,
          address: selectedIssue.address,
          created_at: selectedIssue.created_at,
          ward_name: issueWard?.name || "Kochi Ward",
          department: selectedIssue.assigned_to || "Roads & Traffic Division",
          status: selectedIssue.status,
          isSlaBreached
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedLetter(data.letter);
        setDraftBody(data.letter);
        setDraftSubject(`[CIVIC COMPLAINT] - ${selectedIssue.title} (Ward: ${issueWard?.name || "Kochi Ward"})`);
        setIsLetterMinimized(false);
        setIsDraftingEmail(false);
        setShowDiscardConfirm(false);
      }
    } catch (e) {
      console.error("Failed to generate RTI Complaint Letter", e);
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(selectedIssue.id, commentText);
    setCommentText("");
  };

  const handleReplySubmit = async (e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    await replyToComment(parentCommentId, replyText);
    setReplyText("");
    setActiveReplyId(null);
    setExpandedCommentIds(prev => ({ ...prev, [parentCommentId]: true }));
  };

  // Timeline step statuses
  const getTimelineSteps = () => {
    const status = selectedIssue.status;
    const isReporterVerified = selectedIssue.verifications?.some(
      (v: any) => v.user_id === selectedIssue.reporter_id && v.type === "resolve"
    ) || false;

    return [
      { id: "reported", label: "Reported", desc: "Citizen uploaded complaint & coordinates", completed: true, active: status === "reported" },
      { id: "verified", label: "Verified", desc: "Community upvoted or checked", completed: status !== "reported", active: status === "verified" },
      { id: "in_progress", label: "In Progress", desc: "Assigned to department team", completed: status === "in_progress" || status === "resolved", active: status === "in_progress" },
      { id: "resolved", label: "Resolved Proof", desc: "Fix photo uploaded & verified", completed: status === "resolved", active: status === "resolved" && !isReporterVerified },
      { id: "closed", label: "Closed", desc: "Verified & approved by reporter", completed: isReporterVerified, active: isReporterVerified }
    ];
  };

  const timelineSteps = getTimelineSteps();

  const formattedDate = new Date(selectedIssue.created_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const formattedSla = new Date(selectedIssue.sla_deadline).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-slide-up">
      {/* Back button */}
      <button 
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to listings
      </button>

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 columns: Photos, description, AI Complaint PDF */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
            
            {/* Before After Image Slider or Single Proof */}
            <div className="relative h-64 bg-slate-900">
              {selectedIssue.status === "resolved" && selectedIssue.after_image ? (
                <div className="grid grid-cols-2 h-full gap-0.5">
                  <div className="relative h-full">
                    <img src={selectedIssue.before_image} alt="Before Fix" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 left-3 bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow">Before</span>
                  </div>
                  <div className="relative h-full">
                    <img src={selectedIssue.after_image} alt="After Fix" className="w-full h-full object-cover" />
                    <span className="absolute bottom-3 right-3 bg-emerald-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow">After (Fixed!)</span>
                  </div>
                </div>
              ) : (
                <img src={selectedIssue.before_image} alt={selectedIssue.title} className="w-full h-full object-cover opacity-90" />
              )}

              <div className="absolute top-3 left-3 flex gap-2">
                <span className="bg-slate-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                  {selectedIssue.category}
                </span>
                <span className="bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  Severity {selectedIssue.severity}/10
                </span>
              </div>
            </div>

            {/* Core Details content */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <h1 className="text-2xl font-bold text-slate-800 leading-tight font-display">{selectedIssue.title}</h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" /> {selectedIssue.address}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Reported {formattedDate}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-slate-400">Description</h3>
                <p className="text-slate-600 text-sm mt-1 leading-relaxed">{selectedIssue.description}</p>
              </div>

              {/* Estimate Cost metadata */}
              {selectedIssue.estimated_cost && (
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">AI Suggested Repair Budget:</span>
                  <strong className="text-slate-800 font-mono text-sm">₹{selectedIssue.estimated_cost.toLocaleString("en-IN")}</strong>
                </div>
              )}

              {/* Interaction upvotes + verifications */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2.5">
                <button 
                  onClick={() => upvoteIssue(selectedIssue.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isUpvoted 
                      ? "bg-indigo-600 text-white shadow-sm" 
                      : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  title="Upvote"
                >
                  <ThumbsUp className={`w-4 h-4 ${isUpvoted ? "fill-white text-white" : ""}`} />
                  {selectedIssue.upvotes || 0} Upvotes
                </button>

                <button 
                  onClick={() => downvoteIssue(selectedIssue.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isDownvoted 
                      ? "bg-rose-600 text-white shadow-sm" 
                      : "bg-slate-50 text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-800"
                  }`}
                  title="Downvote"
                >
                  <ThumbsDown className={`w-4 h-4 ${isDownvoted ? "fill-white text-white" : ""}`} />
                  {selectedIssue.downvotes || 0} Downvotes
                </button>

                {selectedIssue.status === "reported" && (
                  <button 
                    onClick={() => verifyIssue(selectedIssue.id, "confirm")}
                    disabled={hasConfirmed}
                    className={`text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 border transition-all ${
                      hasConfirmed 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {hasConfirmed ? "Confirmed Exists ✓" : "Confirm This Exists"}
                  </button>
                )}

                {selectedIssue.status === "resolved" && (
                  <div className="w-full mt-2 bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {isReporter ? "★ Reporter Direct Verification" : "Community Verification Panel"}
                        </span>
                        <p className="text-xs font-semibold text-slate-700 leading-normal">
                          {isReporter 
                            ? "As the original reporter, please verify if the uploaded fix meets the requirements to close this complaint." 
                            : "Community members can verify the resolution proof uploaded by authorities."}
                        </p>
                      </div>
                      
                      {hasVerifiedResolved ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100/80 text-emerald-800 text-[10px] font-black px-3 py-1.5 rounded-xl border border-emerald-200/50 shadow-sm shrink-0">
                          Verified Fixed ✓
                        </span>
                      ) : (
                        <button 
                          onClick={() => verifyIssue(selectedIssue.id, "resolve")}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1 shrink-0"
                        >
                          {isReporter ? "Verify & Approve Fix" : "Verify Resolved Proof"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI LETTER COMPILER CONTAINER */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  AI Legal & RTI Petition Letter Compiler
                </h3>
                <p className="text-xs text-slate-400">
                  Generate a formal, compiled grievance or legal Right to Information (RTI) letter to Kochi Municipality Commissioner. This demands immediate attention under regional civic charters.
                </p>
              </div>
              <button 
                onClick={handleGenerateComplaintLetter}
                disabled={isGeneratingLetter}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow whitespace-nowrap cursor-pointer flex items-center gap-1"
              >
                {isGeneratingLetter ? "Compiling..." : generatedLetter ? "Regenerate Letter" : "Generate PDF Letter"}
              </button>
            </div>

            {/* Custom feedback status on mail */}
            {showMailSentStatus && (
              <div className="bg-emerald-950/50 border border-emerald-900 text-emerald-300 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-slide-up">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold">Email draft transferred!</span> Your device's native mail application has been requested to open with the complaint email pre-drafted.
                </div>
              </div>
            )}

            {/* If Discard Confirmation is requested */}
            {showDiscardConfirm && (
              <div className="bg-rose-950/50 border border-rose-900 rounded-xl p-4 space-y-3 text-xs text-rose-200 animate-slide-up">
                <p className="font-semibold">
                  Are you sure you want to discard this compiled petition letter? This will clear the generated draft completely.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedLetter(null);
                      setDraftBody("");
                      setDraftSubject("");
                      setIsDraftingEmail(false);
                      setIsLetterMinimized(false);
                      setShowDiscardConfirm(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-extrabold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Yes, Discard Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDiscardConfirm(false)}
                    className="bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Keep Letter
                  </button>
                </div>
              </div>
            )}

            {generatedLetter && !showDiscardConfirm && (
              <div>
                {/* Minimized View of Letter */}
                {isLetterMinimized ? (
                  <div className="bg-slate-850 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-slide-up">
                    <div className="flex items-center gap-2 text-xs">
                      <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="text-left">
                        <span className="font-bold block text-slate-200">📎 Official Petition Letter Compiled</span>
                        <span className="text-[10px] text-slate-400 font-mono">Status: Ready (Minimized) • {draftBody.length} characters</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5 justify-end w-full sm:w-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => setIsLetterMinimized(false)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-slate-700"
                        title="Expand Letter"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        Expand
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsLetterMinimized(false);
                          setIsDraftingEmail(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        title="Email"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDiscardConfirm(true)}
                        className="bg-transparent hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-rose-900/40 cursor-pointer"
                        title="Discard Letter"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ) : isDraftingEmail ? (
                  /* Drafting/Editing Email Draft Area */
                  <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-4 animate-slide-up">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                      <span className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider font-mono flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        Drafting Official Petition Email
                      </span>
                      <button 
                        type="button"
                        onClick={() => {
                          // Discard draft edits, restore original compiled letter
                          setDraftBody(generatedLetter || "");
                          setDraftSubject(`[CIVIC COMPLAINT] - ${selectedIssue.title} (Ward: ${issueWard?.name || "Kochi Ward"})`);
                          setIsDraftingEmail(false);
                        }}
                        className="text-slate-400 hover:text-white font-bold text-[10px] bg-slate-900 border border-slate-750 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-all cursor-pointer"
                      >
                        Discard Draft Edits
                      </button>
                    </div>

                    {/* Email Input Fields */}
                    <div className="space-y-3.5 text-xs text-left">
                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1">To (Commissioner Recipient)</label>
                        <input 
                          type="email" 
                          value={draftRecipient}
                          onChange={(e) => setDraftRecipient(e.target.value)}
                          placeholder="e.g. commissioner@kochicollectrate.gov.in"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1">Subject Heading</label>
                        <input 
                          type="text" 
                          value={draftSubject}
                          onChange={(e) => setDraftSubject(e.target.value)}
                          placeholder="Subject of the complaint email"
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1">Customizable Letter Text Body</label>
                        <textarea 
                          rows={9}
                          value={draftBody}
                          onChange={(e) => setDraftBody(e.target.value)}
                          placeholder="Write or edit your complaint body here..."
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-[11px] leading-relaxed no-scrollbar"
                        />
                      </div>
                    </div>

                    {/* Asking user if they want to send/open client */}
                    <div className="bg-blue-950/40 border border-blue-900/50 rounded-xl p-4 text-xs text-blue-200 space-y-3 text-left">
                      <p className="font-semibold leading-relaxed">
                        Would you like to draft and open your email client to send this official letter to the authorities now?
                      </p>
                      <div className="flex flex-wrap gap-2.5 text-left">
                        <button
                          type="button"
                          onClick={handleOpenMailClient}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Yes, Draft & Open Mail Box
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            // Cancel edits, restore original letter, back in application
                            setDraftBody(generatedLetter || "");
                            setDraftSubject(`[CIVIC COMPLAINT] - ${selectedIssue.title} (Ward: ${issueWard?.name || "Kochi Ward"})`);
                            setIsDraftingEmail(false);
                          }}
                          className="bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-slate-800"
                        >
                          Discard Edits & Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDraftingEmail(false)}
                          className="ml-auto bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Keep Changes & Back
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Standard Full View of Compiled Letter */
                  <div className="bg-slate-850 border border-slate-800 rounded-xl p-4 space-y-4 print-section animate-slide-up">
                    <div className="flex flex-wrap gap-2 justify-between items-center pb-2.5 border-b border-slate-800">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider font-mono">Status: Ready to Print / Draft</span>
                      <div className="flex flex-wrap gap-1.5 justify-end">
                        <button 
                          onClick={() => window.print()}
                          className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                        <button 
                          onClick={() => setIsDraftingEmail(true)}
                          className="bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all shadow-sm shadow-indigo-900/50"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          Email
                        </button>
                        <button 
                          onClick={() => setIsLetterMinimized(true)}
                          className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700 font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                          title="Minimize Letter View"
                        >
                          <Minimize2 className="w-3.5 h-3.5" />
                          Minimize
                        </button>
                        <button 
                          onClick={() => setShowDiscardConfirm(true)}
                          className="text-rose-400 hover:text-rose-300 font-bold text-[10px] bg-slate-800 hover:bg-rose-950/20 border border-slate-700 hover:border-rose-900/40 px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                          title="Discard Compiled Letter"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Discard
                        </button>
                      </div>
                    </div>
                    {/* Beautiful clean letter layout */}
                    <div className="prose prose-invert max-w-none text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-line text-left bg-slate-900 p-4 rounded-xl border border-slate-850 overflow-x-auto">
                      {draftBody}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 column: Lifecycle Timeline and Comments Thread */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Lifecycle timeline progress */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm font-display">Resolution Timeline</h3>
              <span className="text-[10px] font-semibold text-slate-400 font-mono">SLA: {formattedSla}</span>
            </div>

            <div className="relative pl-5 space-y-6 border-l border-slate-150">
              {timelineSteps.map((step) => (
                <div key={step.id} className="relative">
                  {/* Circle dot on border */}
                  <div className={`absolute -left-[26px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    step.completed 
                      ? "bg-emerald-500 border-emerald-500 text-white" 
                      : step.active 
                        ? "bg-blue-100 border-blue-500 text-blue-600" 
                        : "bg-white border-slate-300"
                  }`}>
                    {step.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  <div className="space-y-0.5">
                    <span className={`text-xs font-bold flex items-center gap-1.5 ${step.active ? "text-blue-600" : "text-slate-850"}`}>
                      <span>{step.label}</span>
                      {step.id === "resolved" && step.completed && (
                        <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Fixed
                        </span>
                      )}
                      {step.id === "closed" && step.completed && (
                        <span className="inline-flex items-center bg-teal-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                          Closed ✓
                        </span>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-450 block leading-normal">
                      {step.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comments Thread */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm font-display flex items-center gap-1.5">
              <MessageSquare className="w-4.5 h-4.5 text-blue-500" />
              Community Discussion
            </h3>

            {/* Comments List */}
            <div className="space-y-3.5 max-h-[500px] overflow-y-auto no-scrollbar">
              {(() => {
                const allComments = selectedIssue.comments || [];
                const mainComments = allComments.filter(c => !c.parent_id);
                
                if (mainComments.length === 0) {
                  return (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      No comments yet. Leave a note below!
                    </div>
                  );
                }

                return mainComments.map((comment) => {
                  const commentReplies = allComments.filter(r => r.parent_id === comment.id);
                  const isExpanded = !!expandedCommentIds[comment.id];
                  const isReplying = activeReplyId === comment.id;
                  const commentLikes = comment.likes || [];
                  const hasLikedComment = currentUser ? commentLikes.includes(currentUser.id) : false;

                  return (
                    <div 
                      key={comment.id} 
                      id={`comment-card-${comment.id}`}
                      className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 transition-all text-left"
                    >
                      {/* Comment Header */}
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-800 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-450" />
                          {comment.user_name}
                          {comment.user_role === "authority" && (
                            <span className="bg-amber-100 text-amber-800 text-[8px] font-extrabold px-1 rounded uppercase tracking-wide">Official</span>
                          )}
                        </span>
                        <span className="text-slate-400 font-mono">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Comment Body */}
                      <p className="text-xs text-slate-755 leading-relaxed font-semibold">
                        {comment.text}
                      </p>

                      {/* Comment Action Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100/50 text-[10px] font-extrabold text-slate-450">
                        {/* Like button */}
                        <button
                          type="button"
                          onClick={() => likeComment(comment.id)}
                          className={`flex items-center gap-1 transition-all cursor-pointer hover:text-red-600 ${
                            hasLikedComment ? "text-red-500 font-black" : ""
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasLikedComment ? "fill-red-500 stroke-red-500" : ""}`} />
                          <span>{commentLikes.length} Likes</span>
                        </button>

                        {/* Reply button */}
                        <button
                          type="button"
                          onClick={() => {
                            if (activeReplyId === comment.id) {
                              setActiveReplyId(null);
                            } else {
                              setActiveReplyId(comment.id);
                            }
                          }}
                          className={`flex items-center gap-1 transition-all cursor-pointer hover:text-indigo-600 ${
                            isReplying ? "text-indigo-600" : ""
                          }`}
                        >
                          <Reply className="w-3.5 h-3.5" />
                          <span>Reply</span>
                        </button>

                        {/* Toggle replies button */}
                        {commentReplies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedCommentIds(prev => ({
                              ...prev,
                              [comment.id]: !prev[comment.id]
                            }))}
                            className="flex items-center gap-0.5 ml-auto text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer"
                          >
                            <span>{isExpanded ? "Hide replies" : `View ${commentReplies.length} replies`}</span>
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {/* Reply Input Form */}
                      {isReplying && (
                        <form 
                          onSubmit={(e) => handleReplySubmit(e, comment.id)} 
                          className="mt-2.5 flex gap-2 pt-2 border-t border-slate-100/30"
                        >
                          <input
                            type="text"
                            placeholder={`Reply to ${comment.user_name}...`}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={!replyText.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[10px] px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          >
                            Post
                          </button>
                        </form>
                      )}

                      {/* Expanded replies thread list */}
                      {isExpanded && commentReplies.length > 0 && (
                        <div className="mt-2.5 pl-3 border-l-2 border-slate-200 space-y-2 animate-slide-up">
                          {commentReplies.map((reply) => {
                            const replyLikes = reply.likes || [];
                            const hasLikedReply = currentUser ? replyLikes.includes(currentUser.id) : false;

                            return (
                              <div 
                                key={reply.id} 
                                id={`reply-card-${reply.id}`}
                                className="bg-white border border-slate-100/55 rounded-xl p-3 space-y-1.5 text-left"
                              >
                                <div className="flex justify-between items-center text-[9px] font-bold">
                                  <span className="text-slate-700 flex items-center gap-1">
                                    <CornerDownRight className="w-3 h-3 text-slate-400" />
                                    {reply.user_name}
                                    {reply.user_role === "authority" && (
                                      <span className="bg-amber-100 text-amber-800 text-[7px] font-extrabold px-1 rounded uppercase tracking-wide">Official</span>
                                    )}
                                  </span>
                                  <span className="text-slate-400 font-mono">
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                
                                <p className="text-xs text-slate-600 leading-relaxed pl-4 font-semibold">
                                  {reply.text}
                                </p>

                                <div className="flex items-center gap-3 pt-1 pl-4 text-[9px] font-extrabold text-slate-450">
                                  <button
                                    type="button"
                                    onClick={() => likeComment(reply.id)}
                                    className={`flex items-center gap-1 transition-all cursor-pointer hover:text-red-600 ${
                                      hasLikedReply ? "text-red-500 font-black" : ""
                                    }`}
                                  >
                                    <Heart className={`w-3.5 h-3.5 ${hasLikedReply ? "fill-red-500 stroke-red-500" : ""}`} />
                                    <span>{replyLikes.length} Likes</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Post comment form */}
            <form onSubmit={handleSubmitComment} className="pt-2 border-t border-slate-50 flex gap-2">
              <input 
                ref={commentInputRef}
                type="text" 
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500/10 focus:outline-none focus:border-blue-500"
              />
              <button 
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl transition-all cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
