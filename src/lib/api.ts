"use client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

export interface ApiJob {
  id: string | number
  title: string
  candidates: number
  topScore: number
  status: "Active" | "Closed" | "Draft"
  created: string
  department: string
  location: string
  type: string
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

export interface ApiCandidate {
  id: string | number
  jobId: string | number
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

export interface ApiDashboardStats {
  activeJobs: number
  totalCandidates: number
  interviewsToday: number
  avgHireScore: string
  pipeline: { stage: string; count: number; description: string }[]
  recentActivities: { id: string; type: string; text: string; time: string }[]
}

export interface ApiQuestion {
  id: number
  text: string
}

export interface ApiInterviewSession {
  token: string
  candidateName: string
  role: string
  company: string
  timeLimit: number // in minutes
  questions: ApiQuestion[]
  proctoringEnabled: boolean
}

export interface ApiReport {
  interviewId: string | number
  candidateName: string
  email: string
  phone: string
  appliedRole: string
  appliedDate: string
  calculatedFinalScore: number
  resumeScore: number
  technicalGrade: number
  behavioralGrade: number
  recommendation: "recommend" | "borderline" | "do_not_hire"
  proctorIntegrity: "Clean" | "Minor Violations" | "Suspended"
  proctorLogs: { time: string; event: string; type: "warning" | "alert" | "critical" | "system" | "info" }[]
  aiSummary: string
  qaBreakdown: {
    question: string
    answer: string
    score: number
    feedback: string
  }[]
}

export interface ApiInterview {
  id: string | number
  candidateId: string | number
  candidateName: string
  jobId: string | number
  jobTitle: string
  token: string
  status: "Pending" | "In Progress" | "Completed" | "Suspended"
  score?: number
  created: string
  proctorFlagsCount?: number
}

export interface ApiAnalytics {
  dropOffFunnel: { stage: string; count: number; percentage: number }[]
  scoreDistribution: { label: string; count: number }[]
  integrityBreakdown: { label: string; count: number; color: string }[]
  departmentAverages: { department: string; avgScore: number; candidatesCount: number }[]
}

// Fetch wrapper with JWT injection and error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith("/api") ? endpoint : `/api${endpoint}`}`
  
  const headers = new Headers(options.headers)
  headers.set("Content-Type", "application/json")
  
  // Inject JWT authorization token if available
  const token = typeof window !== "undefined" ? localStorage.getItem("hirebox_token") : null
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      let errorMessage = "An error occurred while connecting to the server."
      try {
        const errData = await response.json()
        errorMessage = errData.message || errorMessage
      } catch {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    return (await response.json()) as T
  } catch (error: any) {
    console.error(`API Error on fetch to ${url}:`, error)
    throw new Error(error.message || "Failed to establish network connection.")
  }
}

// Centered API methods
export const api = {
  // Authentication
  setToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hirebox_token", token)
    }
  },
  
  clearToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("hirebox_token")
    }
  },

  // Dashboard stats
  getDashboardStats: () => {
    return fetchAPI<ApiDashboardStats>("/dashboard/stats")
  },

  // Jobs Endpoints
  getJobs: () => {
    return fetchAPI<ApiJob[]>("/jobs")
  },

  createJob: (job: Omit<ApiJob, "candidates" | "topScore" | "created" | "id">) => {
    return fetchAPI<ApiJob>("/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    })
  },

  updateJob: (id: string | number, job: Partial<ApiJob>) => {
    return fetchAPI<ApiJob>(`/jobs/${id}`, {
      method: "PUT",
      body: JSON.stringify(job),
    })
  },

  deleteJob: (id: string | number) => {
    return fetchAPI<{ success: boolean }>(`/jobs/${id}`, {
      method: "DELETE",
    })
  },

  // Candidates Endpoints
  getCandidates: (jobId?: string | number) => {
    const query = jobId ? `?job_id=${jobId}` : ""
    return fetchAPI<ApiCandidate[]>(`/candidates${query}`)
  },

  addCandidate: (cand: Omit<ApiCandidate, "id" | "date" | "status" | "interviewStatus">) => {
    return fetchAPI<ApiCandidate>("/candidates", {
      method: "POST",
      body: JSON.stringify(cand),
    })
  },

  moveCandidateStage: (id: string | number, stage: ApiCandidate["stage"]) => {
    return fetchAPI<ApiCandidate>(`/candidates/${id}/stage`, {
      method: "PUT",
      body: JSON.stringify({ stage }),
    })
  },

  // Candidate Interview Portal Endpoints
  getInterviewSession: (token: string) => {
    return fetchAPI<ApiInterviewSession>(`/interview/${token}`)
  },

  submitInterviewAnswers: (token: string, answers: Record<number, string>, proctorLog?: any[]) => {
    return fetchAPI<{ success: boolean }>((`/interview/${token}/submit`), {
      method: "POST",
      body: JSON.stringify({ answers, proctorLog }),
    })
  },

  // Scorecards & Reports Endpoints
  getReport: (interviewId: string | number) => {
    return fetchAPI<ApiReport>(`/reports/${interviewId}`)
  },

  // Recruiter Interviews & Analytics
  getInterviews: () => {
    return fetchAPI<ApiInterview[]>("/interviews")
  },

  getAnalytics: () => {
    return fetchAPI<ApiAnalytics>("/analytics")
  }
}
