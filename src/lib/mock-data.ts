export interface Job {
  id: string
  title: string
  candidates: number
  topScore: number
  status: "Active" | "Closed" | "Draft"
  created: string
  department: "Engineering" | "Design" | "Marketing" | "Sales" | "HR" | "Finance" | "Other"
  location: string
  type: "Full-time" | "Part-time" | "Contract" | "Remote"
  salaryMin?: number
  salaryMax?: number
  currency?: string
  description?: string
  requiredSkills?: string[]
  niceToHaveSkills?: string[]
  experienceLevel?: "Entry" | "Mid" | "Senior" | "Lead"
  questionCount?: number
  questionTypes?: string[]
  timeLimit?: number
  proctoringEnabled?: boolean
}

export interface Candidate {
  id: string
  jobId: string
  name: string
  role: string
  score: number // Resume match score (0-100)
  stage: "Applied" | "Screened" | "Interview" | "Offer" | "Hired" | "Rejected"
  date: string // Applied date
  status: "Strong Hire" | "Consider" | "Not Recommended" | "Pending"
  interviewStatus: "Pending" | "Completed" | "Suspended"
  interviewScore?: number
  email: string
  phone: string
  skills: string[]
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
  { stage: "Interview" as const, count: 54, description: "Completed AI proctored sessions" },
  { stage: "Offer" as const, count: 38, description: "Offers extended to top candidates" },
  { stage: "Hired" as const, count: 16, description: "Candidates hired successfully" },
]

export const MOCK_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Senior Fullstack Engineer",
    candidates: 42,
    topScore: 94,
    status: "Active",
    created: "2026-06-10",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    salaryMin: 120000,
    salaryMax: 160000,
    currency: "USD",
    description: "We are looking for a Senior Fullstack Engineer to lead our frontend and backend engineering efforts. You will work on Next.js, React, Node.js, and Postgres.",
    requiredSkills: ["React", "TypeScript", "Node.js", "PostgreSQL"],
    niceToHaveSkills: ["Docker", "AWS", "GraphQL"],
    experienceLevel: "Senior",
    questionCount: 8,
    questionTypes: ["Technical", "Behavioral"],
    timeLimit: 15,
    proctoringEnabled: true
  },
  {
    id: "job-2",
    title: "DevOps Systems Specialist",
    candidates: 28,
    topScore: 88,
    status: "Active",
    created: "2026-06-12",
    department: "Engineering",
    location: "Remote (US/Canada)",
    type: "Remote",
    salaryMin: 130000,
    salaryMax: 170000,
    currency: "USD",
    description: "Manage AWS deployments, Terraform scriptings, and Kubernetes containers. Optimize CI/CD pipelines.",
    requiredSkills: ["AWS", "Terraform", "Kubernetes", "Docker"],
    niceToHaveSkills: ["Ansible", "Jenkins", "Python"],
    experienceLevel: "Lead",
    questionCount: 6,
    questionTypes: ["Technical", "Situational"],
    timeLimit: 10,
    proctoringEnabled: true
  },
  {
    id: "job-3",
    title: "Lead UI/UX Designer",
    candidates: 19,
    topScore: 96,
    status: "Active",
    created: "2026-06-14",
    department: "Design",
    location: "New York, NY",
    type: "Full-time",
    salaryMin: 110000,
    salaryMax: 150000,
    currency: "USD",
    description: "Lead UI/UX Designer to establish design system tokens, wireframes, figma mockups, and run user testing sessions.",
    requiredSkills: ["Figma", "User Research", "Wireframing", "Interaction Design"],
    niceToHaveSkills: ["Adobe Illustrator", "HTML/CSS"],
    experienceLevel: "Lead",
    questionCount: 5,
    questionTypes: ["Behavioral", "Culture Fit"],
    timeLimit: 10,
    proctoringEnabled: false
  },
  {
    id: "job-4",
    title: "Staff Product Manager",
    candidates: 34,
    topScore: 78,
    status: "Draft",
    created: "2026-06-17",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    salaryMin: 140000,
    salaryMax: 190000,
    currency: "USD",
    description: "Orchestrate product roadmaps, lead agile ceremonies, write user stories, and track product analytics.",
    requiredSkills: ["Product Roadmap", "Agile", "User Stories", "Analytics"],
    niceToHaveSkills: ["SQL", "Jira", "Mixpanel"],
    experienceLevel: "Senior",
    questionCount: 10,
    questionTypes: ["Behavioral", "Situational", "Culture Fit"],
    timeLimit: 20,
    proctoringEnabled: true
  },
  {
    id: "job-5",
    title: "Senior QA Automation Engineer",
    candidates: 15,
    topScore: 82,
    status: "Closed",
    created: "2026-05-20",
    department: "Engineering",
    location: "Austin, TX",
    type: "Contract",
    salaryMin: 90,
    salaryMax: 120,
    currency: "USD",
    description: "Write automated tests using Cypress, Playwright, Selenium, and Python. Execute regression runs.",
    requiredSkills: ["Playwright", "Cypress", "Selenium", "JavaScript"],
    niceToHaveSkills: ["CI/CD", "Load Testing", "Python"],
    experienceLevel: "Senior",
    questionCount: 8,
    questionTypes: ["Technical", "Situational"],
    timeLimit: 15,
    proctoringEnabled: true
  },
]

export const MOCK_CANDIDATES: Candidate[] = [
  // Stage: Applied
  { 
    id: "cand-1", 
    jobId: "job-1", 
    name: "Rohan Sharma", 
    role: "Senior Fullstack Engineer", 
    score: 82, 
    stage: "Applied", 
    date: "2026-06-18", 
    status: "Pending",
    interviewStatus: "Pending",
    email: "rohan.sharma@example.com",
    phone: "+91 98765 43210",
    skills: ["React", "Node.js", "Express", "MongoDB", "JavaScript"]
  },
  { 
    id: "cand-2", 
    jobId: "job-2", 
    name: "Priya Patel", 
    role: "DevOps Systems Specialist", 
    score: 48, 
    stage: "Applied", 
    date: "2026-06-17", 
    status: "Pending",
    interviewStatus: "Pending",
    email: "priya.patel@example.com",
    phone: "+91 99887 76655",
    skills: ["Docker", "Linux", "Nginx", "Bash Scripting"]
  },
  { 
    id: "cand-3", 
    jobId: "job-3", 
    name: "Vikram Singh", 
    role: "Lead UI/UX Designer", 
    score: 85, 
    stage: "Applied", 
    date: "2026-06-18", 
    status: "Pending",
    interviewStatus: "Pending",
    email: "vikram.singh@example.com",
    phone: "+91 91234 56789",
    skills: ["Figma", "Sketch", "Adobe XD", "Wireframing", "Prototyping"]
  },
  
  // Stage: Screened
  { 
    id: "cand-4", 
    jobId: "job-1", 
    name: "Arjun Mehta", 
    role: "Senior Fullstack Engineer", 
    score: 89, 
    stage: "Screened", 
    date: "2026-06-17", 
    status: "Consider",
    interviewStatus: "Pending",
    email: "arjun.mehta@example.com",
    phone: "+91 88776 65544",
    skills: ["TypeScript", "Next.js", "React", "PostgreSQL", "TailwindCSS"]
  },
  { 
    id: "cand-5", 
    jobId: "job-1", 
    name: "Ananya Rao", 
    role: "Senior Fullstack Engineer", 
    score: 91, 
    stage: "Screened", 
    date: "2026-06-16", 
    status: "Strong Hire",
    interviewStatus: "Pending",
    email: "ananya.rao@example.com",
    phone: "+91 77665 54433",
    skills: ["React Native", "TypeScript", "Node.js", "AWS", "GraphQL"]
  },
  { 
    id: "cand-6", 
    jobId: "job-3", 
    name: "Rahul Verma", 
    role: "Lead UI/UX Designer", 
    score: 74, 
    stage: "Screened", 
    date: "2026-06-15", 
    status: "Consider",
    interviewStatus: "Pending",
    email: "rahul.verma@example.com",
    phone: "+91 66554 43322",
    skills: ["UI Design", "Visual Design", "HTML", "CSS", "Design Systems"]
  },

  // Stage: Interview
  { 
    id: "cand-7", 
    jobId: "job-5", 
    name: "Siddharth Nair", 
    role: "Senior QA Automation Engineer", 
    score: 80, 
    stage: "Interview", 
    date: "2026-06-16", 
    status: "Pending",
    interviewStatus: "Suspended",
    interviewScore: 30,
    email: "siddharth.nair@example.com",
    phone: "+91 55443 32211",
    skills: ["Selenium", "Python", "PyTest", "Jenkins", "API Testing"]
  },
  { 
    id: "cand-8", 
    jobId: "job-4", 
    name: "Meera Krishnan", 
    role: "Staff Product Manager", 
    score: 86, 
    stage: "Interview", 
    date: "2026-06-17", 
    status: "Consider",
    interviewStatus: "Completed",
    interviewScore: 82,
    email: "meera.k@example.com",
    phone: "+91 44332 21100",
    skills: ["Product Roadmap", "Agile", "User Stories", "Analytics", "SQL"]
  },
  { 
    id: "cand-9", 
    jobId: "job-1", 
    name: "Sarah Chen", 
    role: "Senior Fullstack Engineer", 
    score: 87, 
    stage: "Interview", 
    date: "2026-06-18", 
    status: "Strong Hire",
    interviewStatus: "Completed",
    interviewScore: 92,
    email: "sarah.chen@example.com",
    phone: "+1 555 019 2834",
    skills: ["Next.js", "React", "Node.js", "Redis", "Docker", "Kubernetes"]
  },

  // Stage: Offer
  { 
    id: "cand-10", 
    jobId: "job-2", 
    name: "Marcus Johnson", 
    role: "DevOps Systems Specialist", 
    score: 88, 
    stage: "Offer", 
    date: "2026-06-12", 
    status: "Strong Hire",
    interviewStatus: "Completed",
    interviewScore: 90,
    email: "m.johnson@example.com",
    phone: "+1 555 014 3829",
    skills: ["AWS", "Terraform", "Kubernetes", "Ansible", "CI/CD Pipelines"]
  },
  { 
    id: "cand-11", 
    jobId: "job-5", 
    name: "Emma Watson", 
    role: "Senior QA Automation Engineer", 
    score: 82, 
    stage: "Offer", 
    date: "2026-06-11", 
    status: "Consider",
    interviewStatus: "Completed",
    interviewScore: 78,
    email: "emma.watson@example.com",
    phone: "+1 555 011 2233",
    skills: ["Playwright", "Cypress", "JavaScript", "CI/CD", "Load Testing"]
  },

  // Stage: Hired
  { 
    id: "cand-12", 
    jobId: "job-3", 
    name: "Devon Lane", 
    role: "Lead UI/UX Designer", 
    score: 96, 
    stage: "Hired", 
    date: "2026-06-15", 
    status: "Strong Hire",
    interviewStatus: "Completed",
    interviewScore: 98,
    email: "devon.lane@example.com",
    phone: "+1 555 017 3728",
    skills: ["Figma", "User Research", "Interaction Design", "Typography", "HTML/CSS"]
  },
  { 
    id: "cand-13", 
    jobId: "job-1", 
    name: "John Doe", 
    role: "Senior Fullstack Engineer", 
    score: 94, 
    stage: "Hired", 
    date: "2026-06-14", 
    status: "Strong Hire",
    interviewStatus: "Completed",
    interviewScore: 94,
    email: "john.doe@example.com",
    phone: "+1 555 018 4839",
    skills: ["React", "GraphQL", "Ruby on Rails", "PostgreSQL", "Heroku"]
  },

  // Stage: Rejected
  { 
    id: "cand-14", 
    jobId: "job-4", 
    name: "Esther Howard", 
    role: "Staff Product Manager", 
    score: 74, 
    stage: "Rejected", 
    date: "2026-06-15", 
    status: "Not Recommended",
    interviewStatus: "Completed",
    interviewScore: 52,
    email: "esther.howard@example.com",
    phone: "+1 555 019 1234",
    skills: ["Scrum", "Market Research", "Jira", "Excel"]
  },
  { 
    id: "cand-15", 
    jobId: "job-2", 
    name: "Robert Fox", 
    role: "DevOps Systems Specialist", 
    score: 65, 
    stage: "Rejected", 
    date: "2026-06-16", 
    status: "Not Recommended",
    interviewStatus: "Suspended",
    interviewScore: 0,
    email: "robert.fox@example.com",
    phone: "+1 555 012 3456",
    skills: ["Linux", "Docker", "Apache", "MySQL"]
  }
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
