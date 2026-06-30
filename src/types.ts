export type UserRole = 'citizen' | 'authority' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  ward_id: string; // The ward they reside in / monitor
  trust_score: number; // 0 - 100
  points: number;
  badges: string[];
  username?: string;
  phone?: string;
  password?: string;
  avatar_url?: string;
  is_anonymous?: boolean;
  local_body?: string;
  ward_number?: string;
}

export interface Ward {
  id: string;
  name: string;
  city: string;
  state: string;
  health_score: number; // 0 - 100
  authority_id?: string;
  lat: number;
  lng: number;
}

export type IssueStatus = 'reported' | 'verified' | 'in_progress' | 'resolved';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: number; // 1 - 10
  status: IssueStatus;
  ward_id: string;
  reporter_id: string;
  reporter_name: string;
  assigned_to?: string; // e.g. "Roads & Traffic Dept"
  department?: string;
  latitude: number;
  longitude: number;
  address: string;
  upvotes: number;
  upvoted_by: string[]; // User IDs to avoid double-upvoting
  downvotes: number;
  downvoted_by: string[]; // User IDs to avoid double-downvoting
  is_duplicate: boolean;
  parent_issue_id?: string;
  sla_deadline: string; // ISO string
  resolved_at?: string; // ISO string
  created_at: string; // ISO string
  estimated_cost?: number; // AI suggested cost
  before_image?: string; // Base64 or URL
  after_image?: string; // Verification of fix
  comment_count?: number;
}

export interface Comment {
  id: string;
  issue_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  text: string;
  created_at: string;
  likes?: string[];
  parent_id?: string;
}

export interface Verification {
  id: string;
  issue_id: string;
  user_id: string;
  type: 'confirm' | 'resolve';
  created_at: string;
}

export interface WardScoreHistory {
  id: string;
  ward_id: string;
  score: number;
  reason: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  head: string;
  assigned_issues_count: number;
  sla_days: number;
}

export interface GamificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  criteria: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  ward_id: string;
  members: string[];
  created_by: string;
  created_at: string;
}
