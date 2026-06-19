"use client"

import React, { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api, ApiInterview } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { MOCK_JOBS } from "@/lib/mock-data"
import {
  Video,
  Copy,
  ExternalLink,
  Clock,
  Search,
  Filter,
  Eye,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Calendar,
  X,
  Play,
  UserCheck,
  ShieldCheck,
  Camera
} from "lucide-react"
import Link from "next/link"

const MOCK_INTERVIEWS: ApiInterview[] = [
  {
    id: "int-1",
    candidateId: "cand-9",
    candidateName: "Sarah Chen",
    jobId: "job-1",
    jobTitle: "Senior Fullstack Engineer",
    token: "token-sarah-chen",
    status: "Completed",
    score: 92,
    created: "2026-06-18",
    proctorFlagsCount: 0
  },
  {
    id: "int-2",
    candidateId: "cand-8",
    candidateName: "Meera Krishnan",
    jobId: "job-4",
    jobTitle: "Staff Product Manager",
    token: "token-meera-k",
    status: "Completed",
    score: 82,
    created: "2026-06-17",
    proctorFlagsCount: 0
  },
  {
    id: "int-3",
    candidateId: "cand-7",
    candidateName: "Siddharth Nair",
    jobId: "job-5",
    jobTitle: "Senior QA Automation Engineer",
    token: "token-siddharth-nair",
    status: "Suspended",
    score: 30,
    created: "2026-06-16",
    proctorFlagsCount: 4
  },
  {
    id: "int-4",
    candidateId: "cand-4",
    candidateName: "Arjun Mehta",
    jobId: "job-1",
    jobTitle: "Senior Fullstack Engineer",
    token: "token-arjun-mehta",
    status: "In Progress",
    created: "2026-06-18",
    proctorFlagsCount: 1
  },
  {
    id: "int-5",
    candidateId: "cand-1",
    candidateName: "Rohan Sharma",
    jobId: "job-1",
    jobTitle: "Senior Fullstack Engineer",
    token: "token-rohan-sharma",
    status: "Pending",
    created: "2026-06-18",
    proctorFlagsCount: 0
  },
  {
    id: "int-6",
    candidateId: "cand-12",
    candidateName: "Devon Lane",
    jobId: "job-3",
    jobTitle: "Lead UI/UX Designer",
    token: "token-devon-lane",
    status: "Completed",
    score: 98,
    created: "2026-06-15",
    proctorFlagsCount: 0
  },
  {
    id: "int-7",
    candidateId: "cand-2",
    candidateName: "Priya Patel",
    jobId: "job-2",
    jobTitle: "DevOps Systems Specialist",
    token: "token-priya-patel",
    status: "Pending",
    created: "2026-06-17",
    proctorFlagsCount: 0
  }
]

export default function InterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedJobId, setSelectedJobId] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [selectedInterview, setSelectedInterview] = useState<ApiInterview | null>(null)

  // React Queries fetching from Flask API
  const {
    data: interviews,
    isLoading: isInterviewsLoading,
    isError: isInterviewsError
  } = useQuery({
    queryKey: ["interviews"],
    queryFn: api.getInterviews,
    retry: false
  })

  const {
    data: jobs
  } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
    retry: false
  })

  useEffect(() => {
    if (isInterviewsError) {
      toast.error("Failed to connect to Flask API server.", {
        description: "Verify that your Flask backend is running on http://localhost:5000"
      })
    }
  }, [isInterviewsError])

  const isLoading = isInterviewsLoading

  // Real data mappings (no mock fallbacks)
  const displayInterviews = interviews || []
  const displayJobs = jobs || []

  // Compute stats
  const totalCount = displayInterviews.length
  const completedCount = displayInterviews.filter(i => (i.status as string).toLowerCase() === "completed").length
  const activeCount = displayInterviews.filter(i => {
    const s = (i.status as string).toLowerCase()
    return s === "in progress" || s === "started"
  }).length
  const flaggedCount = displayInterviews.filter(i => {
    const s = (i.status as string).toLowerCase()
    return s === "suspended" || (i.proctorFlagsCount && i.proctorFlagsCount > 0)
  }).length


  // Filter list
  const filteredInterviews = displayInterviews.filter(i => {
    const matchesSearch = i.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          i.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesJob = selectedJobId === "all" || i.jobId.toString() === selectedJobId.toString()
    const matchesStatus = selectedStatus === "all" || i.status === selectedStatus
    return matchesSearch && matchesJob && matchesStatus
  })

  // Copy direct exam invite URL
  const copyInviteLink = (token: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    const inviteUrl = `${origin}/interview/${token}`
    navigator.clipboard.writeText(inviteUrl)
    toast.success("Exam link copied to clipboard!", {
      description: inviteUrl
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="border border-border rounded-xl bg-card p-6 space-y-4 dark:bg-slate-900">
          <Skeleton className="h-10 w-full rounded-lg" />
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Header Block */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Recruiter Interviews</h2>
        <p className="text-sm text-brand-muted-text">Invite applicants, view security flags, and monitor live candidate exam status in real-time.</p>
      </div>

      {/* Stats row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:bg-slate-900">
          <div className="flex justify-between items-center text-brand-muted-text">
            <span className="text-xs font-bold uppercase tracking-wider">Total Interviews</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/20 text-brand-primary rounded-lg">
              <Video className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold">{totalCount}</h3>
            <p className="text-xs text-brand-muted-text mt-1">Configure new exam runs</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:bg-slate-900">
          <div className="flex justify-between items-center text-brand-muted-text">
            <span className="text-xs font-bold uppercase tracking-wider">In Progress</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-brand-success rounded-lg">
              <Clock className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-brand-success">{activeCount}</h3>
            <p className="text-xs text-brand-muted-text mt-1">Candidates answering live</p>
          </div>
        </div>

        {/* Completed */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:bg-slate-900">
          <div className="flex justify-between items-center text-brand-muted-text">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 rounded-lg">
              <UserCheck className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{completedCount}</h3>
            <p className="text-xs text-brand-muted-text mt-1">Scorecards waiting review</p>
          </div>
        </div>

        {/* Flagged / Suspended */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:bg-slate-900">
          <div className="flex justify-between items-center text-brand-muted-text">
            <span className="text-xs font-bold uppercase tracking-wider">Flagged Warnings</span>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-brand-danger rounded-lg">
              <AlertTriangle className="h-4.5 w-4.5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-brand-danger">{flaggedCount}</h3>
            <p className="text-xs text-brand-muted-text mt-1">Suspicious behavior detected</p>
          </div>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm grid gap-4 grid-cols-1 sm:grid-cols-12 dark:bg-slate-900">
        {/* Search */}
        <div className="relative sm:col-span-5">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate or job role..."
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-muted-text" />
        </div>

        {/* Job Dropdown */}
        <div className="sm:col-span-4">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <option value="all">All Jobs</option>
            {displayJobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="sm:col-span-3">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600 transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Invitation</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Main Sessions Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden dark:bg-slate-900">
        <div className="overflow-x-auto">
          {filteredInterviews.length === 0 ? (
            <div className="py-16 text-center text-brand-muted-text space-y-3">
              <Video className="h-12 w-12 mx-auto stroke-1" />
              <div>
                <p className="font-semibold text-lg">No interview sessions found</p>
                <p className="text-sm">Configure exam links on the Candidates dashboard tab.</p>
              </div>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/40 text-brand-muted-text font-bold border-b border-border/40 select-none">
                  <th className="p-4 pl-6">Candidate Name</th>
                  <th className="p-4">Target Job Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Created/Date</th>
                  <th className="p-4 text-center">Score Grade</th>
                  <th className="p-4 text-center">Proctor Flags</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview, index) => {
                  return (
                    <tr
                      key={interview.id}
                      className={cn(
                        "border-b border-border/30 hover:bg-slate-50/65 dark:hover:bg-slate-800/30 transition-colors",
                        index % 2 === 1 ? "bg-slate-50/20 dark:bg-slate-800/50" : ""
                      )}
                    >
                      {/* Name */}
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-primary-bg dark:bg-slate-800 text-brand-primary dark:text-brand-primary-bg flex items-center justify-center text-[10px] font-black">
                          {interview.candidateName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        {interview.candidateName}
                      </td>

                      {/* Job */}
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                        {interview.jobTitle}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                          interview.status === "Completed" && "bg-emerald-50 text-brand-success border-emerald-100/30 dark:bg-emerald-950/25",
                          interview.status === "In Progress" && "bg-blue-50 text-brand-primary border-blue-100/30 dark:bg-blue-950/25 animate-pulse",
                          interview.status === "Suspended" && "bg-rose-50 text-brand-danger border-rose-100/30 dark:bg-rose-950/25",
                          interview.status === "Pending" && "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        )}>
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            interview.status === "Completed" && "bg-brand-success",
                            interview.status === "In Progress" && "bg-brand-primary",
                            interview.status === "Suspended" && "bg-brand-danger",
                            interview.status === "Pending" && "bg-slate-400"
                          )} />
                          {interview.status}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="p-4 text-brand-muted-text font-medium">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-brand-muted-text" />
                          {interview.created}
                        </div>
                      </td>

                      {/* Score */}
                      <td className="p-4 text-center">
                        {interview.score !== undefined ? (
                          <span className={cn(
                            "inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-extrabold",
                            interview.score >= 80 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" :
                            interview.score >= 65 ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" :
                            "text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                          )}>
                            {interview.score}%
                          </span>
                        ) : (
                          <span className="text-brand-muted-text font-semibold">—</span>
                        )}
                      </td>

                      {/* Proctor flags */}
                      <td className="p-4 text-center">
                        {interview.proctorFlagsCount !== undefined && interview.proctorFlagsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-50 text-brand-danger dark:bg-rose-950/20 px-2 py-0.5 font-bold">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {interview.proctorFlagsCount} flags
                          </span>
                        ) : interview.status === "Pending" ? (
                          <span className="text-brand-muted-text">—</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-brand-success dark:bg-emerald-950/20 px-2 py-0.5 font-bold">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Clean
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-right space-x-2">
                        {interview.status === "Pending" && (
                          <button
                            onClick={() => copyInviteLink(interview.token)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline bg-transparent border-none cursor-pointer"
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy Exam URL
                          </button>
                        )}

                        {interview.status === "In Progress" && (
                          <button
                            onClick={() => setSelectedInterview(interview)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-success hover:underline bg-transparent border-none cursor-pointer"
                          >
                            <Play className="h-3.5 w-3.5 animate-pulse" />
                            Live Monitor
                          </button>
                        )}

                        {(interview.status === "Completed" || interview.status === "Suspended") && (
                          <Link
                            href="/reports"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline bg-transparent border-none cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Scorecard
                          </Link>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Live Monitor Dialog Modal */}
      {selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            
            {/* Close */}
            <button
              onClick={() => setSelectedInterview(null)}
              className="absolute right-4 top-4 p-1 rounded-md text-brand-muted-text hover:bg-accent hover:text-foreground cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-3 border-b border-border/40 pb-4 mb-4">
              <div className="h-10 w-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm">
                {selectedInterview.candidateName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-extrabold">{selectedInterview.candidateName}</h3>
                <p className="text-xs text-brand-muted-text">{selectedInterview.jobTitle} • Exam Session</p>
              </div>
            </div>

            {/* Simulated Live Stream Block */}
            <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center text-white border border-slate-800">
              {/* Webcam mirroring placeholder screen */}
              <div className="absolute inset-0 bg-slate-900 opacity-60 flex flex-col items-center justify-center space-y-2">
                <Camera className="h-10 w-10 text-slate-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Feed Stream Active</span>
              </div>
              
              {/* Live Overlay tags */}
              <div className="absolute top-3 left-3 bg-rose-600/90 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                LIVE
              </div>

              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur text-white text-[10px] font-mono px-2 py-1 rounded">
                PROCTOR: ACTIVE
              </div>
            </div>

            {/* Active Logs / Violations simulation */}
            <div className="mt-5 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-brand-muted-text uppercase tracking-wider">Live Security Logs</h4>
                <span className="text-xs font-bold text-brand-danger flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded">
                  <AlertTriangle className="h-3 w-3" />
                  {selectedInterview.proctorFlagsCount} Warning Flag(s)
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/50 border border-border p-3.5 rounded-lg space-y-2.5 text-xs font-medium">
                <div className="flex gap-2 text-slate-500 font-mono">
                  <span>02:14</span>
                  <span className="text-brand-success">Candidate webcam and mic verified.</span>
                </div>
                <div className="flex gap-2 text-slate-500 font-mono">
                  <span>05:32</span>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Answering Question #2: Web Optimization.</span>
                </div>
                {selectedInterview.proctorFlagsCount && selectedInterview.proctorFlagsCount > 0 ? (
                  <div className="flex gap-2 text-slate-500 font-mono animate-pulse">
                    <span>08:12</span>
                    <span className="text-brand-danger font-bold">WARNING: Tab switch detected (Candidate lost focus).</span>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Quick Actions inside Live Modal */}
            <div className="mt-6 border-t border-border/40 pt-4 flex justify-end gap-2.5">
              <button
                onClick={() => setSelectedInterview(null)}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-border bg-card hover:bg-accent cursor-pointer"
              >
                Close Stream
              </button>
              <button
                onClick={() => {
                  toast.error("Candidate session has been manually terminated.")
                  setSelectedInterview(null)
                }}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-brand-danger text-white hover:bg-brand-danger/90 cursor-pointer"
              >
                Suspend Session
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
