import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Issue, Ward } from "../../types";
import { 
  Search, ShieldAlert, Check, Clock, Eye, SlidersHorizontal, 
  MapPin, Calendar, FileText, AlertTriangle, Shield, CheckCircle 
} from "lucide-react";
import { getLocalBodiesForDistrict, getDistrictForLocalBody } from "../../data/localBodies";

// Pre-set resolved image samples to let municipal officers "fix" things easily in the demo flow
const RESOLVED_PHOTO_SAMPLES = [
  "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
  "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400"
];

export default function Queue() {
  const { 
    issues, 
    wards, 
    departments, 
    updateIssueStatus, 
    addComment, 
    selectIssue, 
    selectedIssue,
    activeMunicipality,
    activeLocalBody,
    setActiveLocalBody
  } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterWard, setFilterWard] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const localBodies = getLocalBodiesForDistrict(activeMunicipality);

  // Reset to page 1 whenever search, district/local-body, category or ward filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterWard, filterCategory, activeLocalBody, activeMunicipality]);

  // Selected issue for quick-view drawer
  const [drawerIssueId, setDrawerIssueId] = useState<string | null>(null);

  // Form states inside the drawer
  const [editStatus, setEditStatus] = useState<string>("");
  const [editDept, setEditDept] = useState<string>("");
  const [selectedFixPhoto, setSelectedFixPhoto] = useState<string>(RESOLVED_PHOTO_SAMPLES[0]);
  const [officerNote, setOfficerNote] = useState<string>("");

  // Detect which ward the officer is standing in using browser GPS coordinates
  const handleDetectOfficerWard = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Ward centroids approximation based on MapView coordinates
          const wardCentroids: Record<string, { lat: number; lng: number }> = {
            ward_1: { lat: 9.967, lng: 76.230 }, // Fort Kochi
            ward_2: { lat: 10.035, lng: 76.300 }, // Edappally
            ward_3: { lat: 9.962, lng: 76.250 }, // Mattancherry
            ward_4: { lat: 9.975, lng: 76.310 }, // Vyttila
          };

          let nearestWardId = "All";
          let minDistance = Infinity;

          Object.entries(wardCentroids).forEach(([wardId, coords]) => {
            const dist = Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2);
            if (dist < minDistance) {
              minDistance = dist;
              nearestWardId = wardId;
            }
          });

          setFilterWard(nearestWardId);
        },
        (error) => {
          console.error("GPS detection error for officer:", error);
        }
      );
    }
  };

  // Filter issues (include duplicates if they want to manage them, but standard filters is better)
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          issue.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWard = filterWard === "All" || issue.ward_id === filterWard;
    const matchesCategory = filterCategory === "All" || issue.category === filterCategory;
    return matchesSearch && matchesWard && matchesCategory;
  });

  const totalPages = Math.ceil(filteredIssues.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedIssues = filteredIssues.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Calculate hours remaining on SLA deadline
  const getSlaStatus = (deadlineIso: string) => {
    const deadline = new Date(deadlineIso).getTime();
    const now = Date.now();
    const difference = deadline - now;
    
    if (difference < 0) {
      return { text: "Breached", color: "text-red-600 bg-red-50 border-red-100 font-bold animate-pulse" };
    }
    
    const hrsLeft = Math.ceil(difference / (1000 * 60 * 60));
    if (hrsLeft <= 24) {
      return { text: `${hrsLeft} hrs left`, color: "text-amber-600 bg-amber-50 border-amber-100 font-bold" };
    }
    
    const daysLeft = Math.ceil(hrsLeft / 24);
    return { text: `${daysLeft} days left`, color: "text-slate-650 bg-slate-50 border-slate-100" };
  };

  // Open the detail drawer
  const handleOpenDrawer = (issue: Issue) => {
    setDrawerIssueId(issue.id);
    setEditStatus(issue.status);
    setEditDept(issue.assigned_to || "");
    setOfficerNote("");
  };

  // Save changes from drawer
  const handleSaveChanges = async () => {
    if (!drawerIssueId) return;
    
    const issueObj = issues.find(i => i.id === drawerIssueId);
    if (!issueObj) return;

    // Call API status update
    await updateIssueStatus(
      drawerIssueId, 
      editStatus, 
      editDept, 
      editStatus === 'resolved' ? selectedFixPhoto : undefined
    );

    // If officer left a note, submit it as a comment
    if (officerNote.trim()) {
      await addComment(drawerIssueId, officerNote);
    }

    setDrawerIssueId(null);
  };

  const categories = ["All", "Pothole", "Water Leakage", "Broken Streetlight", "Garbage Dumping", "Damaged Footpath"];

  const activeDrawerIssue = issues.find(i => i.id === drawerIssueId);
  const activeWard = wards.find(w => w.id === activeDrawerIssue?.ward_id);

  return (
    <div className="space-y-6 relative h-full">
      {/* Top action controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-1 text-slate-400">
          <Search className="w-4 h-4 ml-2" />
          <input 
            type="text" 
            placeholder="Search queues by title, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-60 p-1"
          />
        </div>

        <div className="flex gap-2.5 items-center">
          {/* Ward filter with GPS locator */}
          <div className="flex items-center gap-1 bg-indigo-50 border border-indigo-150 px-2.5 py-1.5 rounded-lg shadow-sm hover:border-indigo-250 transition-all">
            <select 
              value={activeLocalBody}
              onChange={(e) => {
                setActiveLocalBody(e.target.value);
                setFilterWard("All");
              }}
              className="bg-transparent text-xs font-bold text-indigo-900 focus:outline-none cursor-pointer max-w-[200px] truncate"
            >
              <option value="All">All wards of {activeMunicipality}</option>
              {localBodies.map(lb => (
                <option key={lb.id} value={lb.name}>{lb.name}</option>
              ))}
            </select>
            <button
              onClick={handleDetectOfficerWard}
              title="Detect Current GPS Ward"
              className="p-1 hover:bg-indigo-100 rounded text-indigo-600 hover:text-indigo-800 transition-all cursor-pointer"
            >
              <MapPin className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Category filter */}
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Data Queue Table */}
      <div className="bg-white border border-slate-150 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 font-display font-bold uppercase tracking-wider text-[10px]">
                <th className="p-4 w-12 text-center">S.No</th>
                <th className="p-4">District</th>
                <th className="p-4">Complaint / Address</th>
                <th className="p-4">Category</th>
                <th className="p-4 text-center">Severity</th>
                <th className="p-4">Ward Location</th>
                <th className="p-4">SLA Status</th>
                <th className="p-4">Department assigned</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedIssues.map((issue, localIndex) => {
                const index = startIndex + localIndex;
                const ward = wards.find(w => w.id === issue.ward_id);
                const districtName = ward ? getDistrictForLocalBody(ward.city) : activeMunicipality;
                const sla = getSlaStatus(issue.sla_deadline);

                return (
                  <tr 
                    key={issue.id}
                    className="hover:bg-slate-50/50 transition-all cursor-pointer"
                    onClick={() => handleOpenDrawer(issue)}
                  >
                    {/* S.No */}
                    <td className="p-4 text-center font-mono font-bold text-slate-500">
                      {index + 1}
                    </td>

                    {/* District */}
                    <td className="p-4 font-bold text-slate-700">
                      <span className="bg-slate-100 border border-slate-200/60 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">
                        {districtName}
                      </span>
                    </td>

                    {/* Title address */}
                    <td className="p-4 max-w-sm">
                      <span className="font-bold text-slate-800 block break-words whitespace-normal">{issue.title}</span>
                      <span className="text-[10px] text-slate-400 block break-words whitespace-normal mt-0.5">{issue.address}</span>
                    </td>

                    {/* Category */}
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded font-semibold">
                        {issue.category}
                      </span>
                    </td>

                    {/* Severity */}
                    <td className="p-4 text-center font-bold">
                      <span className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[10px] ${
                        issue.severity >= 8 ? "bg-red-100 text-red-700" : issue.severity >= 4 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {issue.severity}
                      </span>
                    </td>

                    {/* Ward */}
                    <td className="p-4 font-semibold text-slate-800">
                      {ward?.name || "Kochi Ward"}
                    </td>

                    {/* SLA status */}
                    <td className="p-4">
                      {issue.status === "resolved" ? (
                        <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 font-semibold text-[10px] uppercase">
                          Resolved
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded border text-[10px] font-semibold uppercase ${sla.color}`}>
                          {sla.text}
                        </span>
                      )}
                    </td>

                    {/* Assigned Department */}
                    <td className="p-4 text-slate-550 font-medium">
                      {issue.assigned_to || "Unassigned"}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        issue.status === "resolved" 
                          ? "bg-emerald-100 text-emerald-800" 
                          : issue.status === "in_progress" 
                            ? "bg-blue-100 text-blue-800"
                            : issue.status === "verified"
                              ? "bg-indigo-100 text-indigo-800"
                              : "bg-slate-100 text-slate-700"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          issue.status === "resolved" ? "bg-emerald-550" : issue.status === "in_progress" ? "bg-blue-550" : "bg-slate-500"
                        }`} />
                        {issue.status}
                      </span>
                    </td>

                    {/* Action trigger */}
                    <td className="p-4 text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDrawer(issue);
                        }}
                        className="bg-slate-900 text-white hover:bg-slate-800 font-bold text-[10px] px-3 py-1.5 rounded-lg inline-flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Manage
                      </button>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 bg-slate-50/50">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 ${
                  currentPage === 1 ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`relative ml-3 inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 ${
                  currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">
                  Showing <span className="font-extrabold text-slate-900">{startIndex + 1}</span> to{" "}
                  <span className="font-extrabold text-slate-900">
                    {Math.min(startIndex + ITEMS_PER_PAGE, filteredIssues.length)}
                  </span>{" "}
                  of <span className="font-extrabold text-slate-900">{filteredIssues.length}</span> entries
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md gap-1" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all ${
                      currentPage === 1 ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-slate-300"
                    }`}
                  >
                    ← Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? "bg-slate-950 text-white border border-slate-950 shadow-sm"
                          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all ${
                      currentPage === totalPages ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:border-slate-300"
                    }`}
                  >
                    Next →
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK VIEW SLIDE-OUT DRAWER OVERLAY */}
      {drawerIssueId && activeDrawerIssue && (
        <div className="fixed inset-0 bg-slate-900/50 z-[2000] flex justify-end animate-fade-in">
          
          {/* Main Slide-out panel */}
          <div className="w-[450px] bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              {/* Drawer header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Grievance Controller</span>
                  <h3 className="font-bold text-slate-800 text-base font-display leading-tight">{activeDrawerIssue.title}</h3>
                </div>
                <button 
                  onClick={() => setDrawerIssueId(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                >
                  Close ✕
                </button>
              </div>

              {/* Photos comparison proof */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reported Proof:</span>
                <img 
                  src={activeDrawerIssue.before_image} 
                  alt="Reported visual" 
                  referrerPolicy="no-referrer"
                  className="w-full h-36 object-cover rounded-xl border border-slate-200 bg-slate-50"
                />
              </div>

              {/* Status and Department change triggers */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Update Complaint Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs outline-none"
                  >
                    <option value="reported">Reported</option>
                    <option value="verified">Verified (Confirm existence)</option>
                    <option value="in_progress">In Progress (Assign crew)</option>
                    <option value="resolved">Resolved (Complete work)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Assign Department Head</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-lg text-xs outline-none"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* RESOLVED PHOTO SELECTOR IF resolved selected */}
                {editStatus === "resolved" && (
                  <div className="space-y-2 border border-emerald-100 p-3 bg-emerald-50 rounded-xl animate-slide-up">
                    <span className="text-xs font-bold text-emerald-850 block">Resolve Proof: Upload Repair Photo</span>
                    <p className="text-[10px] text-emerald-700 leading-normal">
                      Municipal officers must submit photo proof of the resolved streetlight, potholes, or waste cleanup to restore Ward Health points!
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {RESOLVED_PHOTO_SAMPLES.map((photo, i) => (
                        <div 
                          key={photo}
                          onClick={() => setSelectedFixPhoto(photo)}
                          className={`h-16 rounded-lg border-2 overflow-hidden cursor-pointer relative ${
                            selectedFixPhoto === photo ? "border-emerald-500 shadow" : "border-transparent opacity-60"
                          }`}
                        >
                          <img src={photo} alt="Resolved sample" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/10 hover:bg-transparent" />
                          {selectedFixPhoto === photo && (
                            <div className="absolute bottom-1 right-1 bg-emerald-500 text-white rounded-full p-0.5">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Officer note / progress log comment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Progress Log / Officer Note</label>
                  <textarea
                    rows={3}
                    placeholder="Provide a public update regarding inspection scheduling, budgets, or work completion details..."
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-xs focus:outline-none focus:border-slate-450"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="flex gap-2.5 border-t border-slate-100 pt-4 bg-white sticky bottom-0">
              <button
                onClick={() => setDrawerIssueId(null)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 font-bold text-xs py-2.5 rounded-xl cursor-pointer"
              >
                Discard
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex-1 bg-slate-900 text-white hover:bg-slate-800 font-bold text-xs py-2.5 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1"
              >
                <Check className="w-4 h-4" />
                Apply Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
