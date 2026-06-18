export interface Job {
  id: string
  title: string
  candidates: number
  topScore: number
  status: "Active" | "Closed" | "Draft"
  created: string
}

export interface Candidate {
  id: string
  name: string
  role: string
  score: number
  stage: "Applied" | "Screened" | "Interview Sent" | "Interviewed" | "Decision"
  date: string
  status: "Strong Hire" | "Consider" | "Not Recommended" | "Pending"
}

export interface Activity {
  id: string
  type: "score" | "upload" | "invite" | "alert" | "system"
  text: string
  time: string
}

export interface Stat {
  id: string
  label: string
  value: string | number
  trend: string
  trendType: "up" | "down" | "neutral"
  icon: string
  color: string
}

export const MOCK_STATS: Stat[] = [
  {
    id: "active-jobs",
    label: "Active Jobs",
    value: 12,
    trend: "+12% vs last week",
    trendType: "up",
    icon: "Briefcase",
    color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/45",
  },
  {
    id: "total-candidates",
    label: "Total Candidates",
    value: 348,
    trend: "+18% vs last month",
    trendType: "up",
    icon: "Users",
    color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/45",
  },
  {
    id: "interviews-today",
    label: "Interviews Today",
    value: 8,
    trend: "+5% vs yesterday",
    trendType: "up",
    icon: "Video",
    color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/45",
  },
  {
    id: "avg-hire-score",
    label: "Avg. Hire Score",
    value: "84.2%",
    trend: "+2.4% vs last week",
    trendType: "up",
    icon: "TrendingUp",
    color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/45",
  },
]

export const MOCK_PIPELINE = [
  { stage: "Applied" as const, count: 142, description: "New applications received" },
  { stage: "Screened" as const, count: 98, description: "Resumes parsed & ranked" },
  { stage: "Interview Sent" as const, count: 54, description: "Invitations dispatched" },
  { stage: "Interviewed" as const, count: 38, description: "Completed AI proctored sessions" },
  { stage: "Decision" as const, count: 16, description: "Ready for final sign-off" },
]

export const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Fullstack Engineer",
    candidates: 42,
    topScore: 94,
    status: "Active",
    created: "2026-06-10",
  },
  {
    id: "job-2",
    title: "DevOps Systems Specialist",
    candidates: 28,
    topScore: 88,
    status: "Active",
    created: "2026-06-12",
  },
  {
    id: "job-3",
    title: "Lead UI/UX Designer",
    candidates: 19,
    topScore: 96,
    status: "Active",
    created: "2026-06-14",
  },
  {
    id: "job-4",
    title: "Staff Product Manager",
    candidates: 34,
    topScore: 78,
    status: "Draft",
    created: "2026-06-17",
  },
  {
    id: "job-5",
    title: "Senior QA Automation Engineer",
    candidates: 15,
    topScore: 82,
    status: "Closed",
    created: "2026-05-20",
  },
]

export const MOCK_CANDIDATES: Candidate[] = [
  // Applied
  { id: "cand-1", name: "Rohan Sharma", role: "Senior Fullstack Engineer", score: 82, stage: "Applied", date: "2026-06-18", status: "Pending" },
  { id: "cand-2", name: "Priya Patel", role: "DevOps Systems Specialist", score: 79, stage: "Applied", date: "2026-06-17", status: "Pending" },
  { id: "cand-3", name: "Vikram Singh", role: "Lead UI/UX Designer", score: 85, stage: "Applied", date: "2026-06-18", status: "Pending" },
  // Screened
  { id: "cand-4", name: "Arjun Mehta", role: "Data Analyst", score: 89, stage: "Screened", date: "2026-06-17", status: "Consider" },
  { id: "cand-5", name: "Ananya Rao", role: "Senior Fullstack Engineer", score: 91, stage: "Screened", date: "2026-06-16", status: "Strong Hire" },
  { id: "cand-6", name: "Rahul Verma", role: "Lead UI/UX Designer", score: 74, stage: "Screened", date: "2026-06-15", status: "Consider" },
  // Interview Sent
  { id: "cand-7", name: "Siddharth Nair", role: "Senior QA Automation Engineer", score: 80, stage: "Interview Sent", date: "2026-06-16", status: "Pending" },
  { id: "cand-8", name: "Meera Krishnan", role: "Staff Product Manager", score: 86, stage: "Interview Sent", date: "2026-06-17", status: "Consider" },
  // Interviewed
  { id: "cand-9", name: "Sarah Chen", role: "Senior Fullstack Engineer", score: 87, stage: "Interviewed", date: "2026-06-18", status: "Strong Hire" },
  { id: "cand-10", name: "Marcus Johnson", role: "DevOps Systems Specialist", score: 85, stage: "Interviewed", date: "2026-06-17", status: "Consider" },
  { id: "cand-11", name: "Emma Watson", role: "Senior QA Automation Engineer", score: 45, stage: "Interviewed", date: "2026-06-16", status: "Not Recommended" },
  // Decision
  { id: "cand-12", name: "Devon Lane", role: "Lead UI/UX Designer", score: 96, stage: "Decision", date: "2026-06-15", status: "Strong Hire" },
  { id: "cand-13", name: "John Doe", role: "Senior Fullstack Engineer", score: 94, stage: "Decision", date: "2026-06-14", status: "Strong Hire" },
  { id: "cand-14", name: "Esther Howard", role: "Staff Product Manager", score: 74, stage: "Decision", date: "2026-06-15", status: "Consider" },
]

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    type: "score",
    text: "Sarah Chen scored 87% on Frontend Engineer interview",
    time: "2 hours ago",
  },
  {
    id: "act-2",
    type: "upload",
    text: "New resume uploaded: Arjun Mehta for Data Analyst",
    time: "3 hours ago",
  },
  {
    id: "act-3",
    type: "invite",
    text: "Interview link sent to 3 candidates for DevOps role",
    time: "5 hours ago",
  },
  {
    id: "act-4",
    type: "alert",
    text: "Security Flag: Multiple faces detected for Candidate ID #11",
    time: "6 hours ago",
  },
  {
    id: "act-5",
    type: "system",
    text: "Job draft 'Senior QA Automation' published by Niranjan",
    time: "1 day ago",
  },
  {
    id: "act-6",
    type: "score",
    text: "Vikram Singh completed screen: 85% relevance rank",
    time: "1 day ago",
  },
  {
    id: "act-7",
    type: "upload",
    text: "Resumes bulk upload (15 files) completed for Product Manager",
    time: "2 days ago",
  },
  {
    id: "act-8",
    type: "invite",
    text: "Custom questions generated for Senior Fullstack Engineer",
    time: "2 days ago",
  },
  {
    id: "act-9",
    type: "alert",
    text: "Interview session suspended: Candidate ID #15 flagged for cheating",
    time: "3 days ago",
  },
  {
    id: "act-10",
    type: "system",
    text: "Billing plan successfully updated to Growth tier",
    time: "5 days ago",
  },
]
