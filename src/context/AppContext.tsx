import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Issue, Ward, UserProfile, Comment, Department, Community } from "../types";
import { getLocalBodiesForDistrict } from "../data/localBodies";

interface AppContextType {
  currentUser: UserProfile | null;
  usersList: UserProfile[];
  wards: Ward[];
  departments: Department[];
  issues: Issue[];
  communities: Community[];
  selectedIssueId: string | null;
  selectedIssue: (Issue & { comments?: Comment[]; verifications?: any[] }) | null;
  isLoading: boolean;
  activeRole: 'citizen' | 'authority';
  activeState: string;
  setActiveState: (state: string) => void;
  activeMunicipality: string;
  setActiveMunicipality: (city: string) => void;
  activeLocalBody: string;
  setActiveLocalBody: (body: string) => void;
  
  // Actions
  fetchData: () => Promise<void>;
  selectIssue: (issueId: string | null) => Promise<void>;
  reportIssue: (issueData: any) => Promise<{ issue: Issue; duplicate_found: boolean }>;
  upvoteIssue: (issueId: string) => Promise<void>;
  downvoteIssue: (issueId: string) => Promise<void>;
  addComment: (issueId: string, text: string) => Promise<void>;
  likeComment: (commentId: string) => Promise<void>;
  replyToComment: (commentId: string, text: string) => Promise<void>;
  verifyIssue: (issueId: string, type: 'confirm' | 'resolve') => Promise<void>;
  updateIssueStatus: (issueId: string, status: string, department?: string, afterImage?: string) => Promise<void>;
  switchUser: (userId: string) => Promise<void>;
  login: (identifier: string, password: string) => Promise<UserProfile>;
  signup: (signupData: any) => Promise<UserProfile>;
  createAuthority: (officerData: any) => Promise<UserProfile>;
  updateProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => void;
  createCommunity: (name: string, description: string, ward_id: string) => Promise<Community>;
  joinCommunity: (communityId: string) => Promise<void>;
  leaveCommunity: (communityId: string) => Promise<void>;
  shouldFocusComments: boolean;
  setShouldFocusComments: (val: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [wards, setWards] = useState<Ward[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<(Issue & { comments?: Comment[]; verifications?: any[] }) | null>(null);
  const [shouldFocusComments, setShouldFocusComments] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<'citizen' | 'authority'>('citizen');
  const [activeState, setActiveState] = useState<string>("KERALA");
  const [activeMunicipality, setActiveMunicipality] = useState<string>("Ernakulam");
  const [activeLocalBody, setActiveLocalBody] = useState<string>("Kochi Municipal Corporation");

  // Hardcoded profiles list for demo switching
  const usersList: UserProfile[] = [
    {
      id: "demo_citizen",
      email: "citizen@communityhero.in",
      name: "Aravind Nair",
      role: "citizen",
      ward_id: "ward_2",
      trust_score: 85,
      points: 240,
      badges: ["First Responder", "Pothole Hunter"]
    },
    {
      id: "demo_authority",
      email: "officer@kochi.gov.in",
      name: "Commissioner V.S. Kumar",
      role: "authority",
      ward_id: "ward_1",
      trust_score: 100,
      points: 0,
      badges: []
    }
  ];

  // Initialize data
  const fetchData = async () => {
    try {
      setIsLoading(true);

      const DISTRICT_TO_CITY: Record<string, string> = {
        "Ernakulam": "Kochi",
        "Thiruvananthapuram": "Trivandrum",
        "Kozhikode": "Kozhikode",
        "Thrissur": "Thrissur",
        "Kannur": "Kannur",
        "Kollam": "Kollam",
        "Alappuzha": "Alappuzha",
        "Kottayam": "Kottayam",
        "Palakkad": "Palakkad",
        "Chennai": "Chennai",
        "Coimbatore": "Coimbatore",
        "Madurai": "Madurai",
        "Tiruchirappalli": "Trichy",
        "Salem": "Salem",
        "Bengaluru Rural": "Bengaluru",
        "Bengaluru Urban": "Bengaluru",
        "Mysuru": "Mysuru",
        "Dharwad": "Hubli-Dharwad",
        "Dakshina Kannada": "Mangaluru",
        "Mumbai City": "Mumbai",
        "Mumbai Suburban": "Mumbai",
        "Pune": "Pune",
        "Nagpur": "Nagpur",
        "Thane": "Thane",
        "New Delhi": "New Delhi",
        "Central Delhi": "New Delhi",
        "Hyderabad": "Hyderabad",
        "Kolkata": "Kolkata",
        "Lucknow": "Lucknow",
        "Jaipur": "Jaipur City",
        "Patna": "Patna",
        "Kamrup Metropolitan": "Guwahati",
        "Khordha": "Bhubaneswar"
      };

      let wardsUrl = "";
      let deptsUrl = "";
      let issuesUrl = "";
      let commsUrl = "";

      if (activeLocalBody === "All") {
        wardsUrl = `/api/wards?city=All&district=${encodeURIComponent(activeMunicipality)}`;
        deptsUrl = `/api/departments?city=All&district=${encodeURIComponent(activeMunicipality)}`;
        issuesUrl = `/api/issues?city=All&district=${encodeURIComponent(activeMunicipality)}`;
        commsUrl = `/api/communities?city=All&district=${encodeURIComponent(activeMunicipality)}`;
      } else {
        const rawCity = (activeLocalBody || activeMunicipality).trim();
        const mappedCity = DISTRICT_TO_CITY[rawCity] || rawCity;
        wardsUrl = `/api/wards?city=${encodeURIComponent(mappedCity)}`;
        deptsUrl = `/api/departments?city=${encodeURIComponent(mappedCity)}`;
        issuesUrl = `/api/issues?city=${encodeURIComponent(mappedCity)}`;
        commsUrl = `/api/communities?city=${encodeURIComponent(mappedCity)}`;
      }

      const [wardsRes, deptRes, issuesRes, commRes] = await Promise.all([
        fetch(wardsUrl),
        fetch(deptsUrl),
        fetch(issuesUrl),
        fetch(commsUrl)
      ]);

      const wardsData = await wardsRes.json();
      const deptsData = await deptRes.json();
      const issuesData = await issuesRes.json();
      const commData = await commRes.json();

      setWards(wardsData);
      setDepartments(deptsData);
      setIssues(issuesData);
      setCommunities(commData);
    } catch (e) {
      console.error("Failed to fetch application data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch current active user
  const switchUser = async (userId: string) => {
    try {
      setIsLoading(true);
      const user = usersList.find(u => u.id === userId);
      if (user) {
        const res = await fetch(`/api/users/${userId}?role=${user.role}&name=${encodeURIComponent(user.name)}&email=${user.email}`);
        const data = await res.json();
        setCurrentUser(data);
        setActiveRole(data.role as 'citizen' | 'authority');
        localStorage.setItem("community_hero_user", JSON.stringify(data));
      }
    } catch (e) {
      console.error("Failed to switch user:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Login failed");
      }
      const data = await res.json();
      setCurrentUser(data);
      setActiveRole(data.role as 'citizen' | 'authority');
      localStorage.setItem("community_hero_user", JSON.stringify(data));
      return data;
    } catch (e) {
      console.error("Login Error:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Signup failed");
      }
      const data = await res.json();
      setCurrentUser(data);
      setActiveRole(data.role as 'citizen' | 'authority');
      localStorage.setItem("community_hero_user", JSON.stringify(data));
      return data;
    } catch (e) {
      console.error("Signup Error:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const createAuthority = async (officerData: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/create-authority", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...officerData, adminId: currentUser?.id })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create authority account");
      }
      const data = await res.json();
      return data;
    } catch (e) {
      console.error("Create Authority Error:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userId: string, profileData: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update profile");
      }
      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem("community_hero_user", JSON.stringify(data));
      return data;
    } catch (e) {
      console.error("Error updating profile:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("community_hero_user");
  };

  useEffect(() => {
    const bodies = getLocalBodiesForDistrict(activeMunicipality);
    if (bodies.length > 0) {
      setActiveLocalBody(bodies[0].name);
    }
  }, [activeMunicipality]);

  useEffect(() => {
    if (activeLocalBody) {
      fetchData();
    }
  }, [activeLocalBody]);

  useEffect(() => {
    const cachedUser = localStorage.getItem("community_hero_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setCurrentUser(parsed);
        setActiveRole(parsed.role as 'citizen' | 'authority');
      } catch (e) {
        setCurrentUser(null);
      }
    } else {
      // Don't auto-login so we see the login page first!
      setCurrentUser(null);
    }
  }, []);

  // Fetch specific issue details
  const selectIssue = async (issueId: string | null) => {
    setSelectedIssueId(issueId);
    if (!issueId) {
      setSelectedIssue(null);
      return;
    }

    try {
      const res = await fetch(`/api/issues/${issueId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedIssue(data);
      }
    } catch (e) {
      console.error("Failed to fetch issue details:", e);
    }
  };

  // Report a new issue
  const reportIssue = async (issueData: any) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...issueData,
          reporter_id: currentUser?.id,
          reporter_name: currentUser?.name
        })
      });

      if (!res.ok) throw new Error("Failed to report issue");

      const data = await res.json();
      await fetchData(); // refresh list
      
      // refresh user points
      if (currentUser) {
        await switchUser(currentUser.id);
      }

      return data;
    } catch (e) {
      console.error("Error reporting issue:", e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  // Upvote issue
  const upvoteIssue = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (res.ok) {
        await fetchData();
        // If the currently selected issue is this one, refresh it
        if (selectedIssueId === issueId) {
          await selectIssue(issueId);
        }
        await switchUser(currentUser.id); // update points
      }
    } catch (e) {
      console.error("Error upvoting issue:", e);
    }
  };

  // Downvote issue
  const downvoteIssue = async (issueId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/downvote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (res.ok) {
        await fetchData();
        // If the currently selected issue is this one, refresh it
        if (selectedIssueId === issueId) {
          await selectIssue(issueId);
        }
        await switchUser(currentUser.id); // update points
      }
    } catch (e) {
      console.error("Error downvoting issue:", e);
    }
  };

  // Add Comment
  const addComment = async (issueId: string, text: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          text
        })
      });

      if (res.ok) {
        await selectIssue(issueId);
        await switchUser(currentUser.id); // update points
      }
    } catch (e) {
      console.error("Error adding comment:", e);
    }
  };

  // Like Comment
  const likeComment = async (commentId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });

      if (res.ok) {
        if (selectedIssueId) {
          await selectIssue(selectedIssueId);
        }
      }
    } catch (e) {
      console.error("Error liking comment:", e);
    }
  };

  // Reply to Comment
  const replyToComment = async (commentId: string, text: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/comments/${commentId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          text
        })
      });

      if (res.ok) {
        if (selectedIssueId) {
          await selectIssue(selectedIssueId);
        }
        await switchUser(currentUser.id); // update points
      }
    } catch (e) {
      console.error("Error replying to comment:", e);
    }
  };

  // Verify Issue
  const verifyIssue = async (issueId: string, type: 'confirm' | 'resolve') => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, type })
      });

      if (res.ok) {
        await fetchData();
        await selectIssue(issueId);
        await switchUser(currentUser.id); // update points
      }
    } catch (e) {
      console.error("Error verifying issue:", e);
    }
  };

  // Update Status (Authority action)
  const updateIssueStatus = async (issueId: string, status: string, department?: string, afterImage?: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, assigned_to: department, after_image: afterImage })
      });

      if (res.ok) {
        await fetchData();
        if (selectedIssueId === issueId) {
          await selectIssue(issueId);
        }
      }
    } catch (e) {
      console.error("Error updating issue status:", e);
    }
  };

  const createCommunity = async (name: string, description: string, ward_id: string): Promise<Community> => {
    if (!currentUser) throw new Error("Authentication required");
    const res = await fetch("/api/communities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, ward_id, created_by: currentUser.id })
    });
    if (!res.ok) {
      throw new Error("Failed to create community");
    }
    const data = await res.json();
    await fetchData();
    return data;
  };

  const joinCommunity = async (communityId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/communities/${communityId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Error joining community:", e);
    }
  };

  const leaveCommunity = async (communityId: string) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/communities/${communityId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        await fetchData();
      }
    } catch (e) {
      console.error("Error leaving community:", e);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      usersList,
      wards,
      departments,
      issues,
      communities,
      selectedIssueId,
      selectedIssue,
      isLoading,
      activeRole,
      activeState,
      setActiveState,
      activeMunicipality,
      setActiveMunicipality,
      activeLocalBody,
      setActiveLocalBody,
      fetchData,
      selectIssue,
      reportIssue,
      upvoteIssue,
      downvoteIssue,
      addComment,
      likeComment,
      replyToComment,
      verifyIssue,
      updateIssueStatus,
      switchUser,
      login,
      signup,
      createAuthority,
      updateProfile,
      logout,
      createCommunity,
      joinCommunity,
      leaveCommunity,
      shouldFocusComments,
      setShouldFocusComments
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
