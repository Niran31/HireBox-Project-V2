"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api, ApiCandidate } from "@/lib/api"
import { CandidateReport } from "@/components/reports/CandidateReport"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  ArrowRight, 
  Calendar, 
  SlidersHorizontal,
  FileText,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

// Alias for compatibility
type Candidate = ApiCandidate

export default function ReportsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  
  // Filters state
  const [selectedJobId, setSelectedJobId] = useState("all")
  const [selectedScoreRange, setSelectedScoreRange] = useState("all")
  const [selectedRec, setSelectedRec] = useState("all")

  // Active scorecard detail view state
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null)

  // React Query: Get candidates (completed and suspended ones)
  const { data: candidates = [], isLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => api.getCandidates(),
  })

  // React Query: Get jobs list for filter selector
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
  })

  // Helper: calculate final recommendation category from interview score
  const getRecommendation = (cand: Candidate) => {
    const technicalGrade = cand.interviewScore || (cand.score - 5)
    const resumeScore = cand.score
    const behavioralGrade = Math.min(100, Math.round(cand.score + (cand.id === "cand-9" ? 5 : -2)))
    const finalScore = Math.round(resumeScore * 0.3 + technicalGrade * 0.5 + behavioralGrade * 0.2)
    
    if (finalScore >= 80 && cand.interviewStatus !== "Suspended") return "recommend"
    if (finalScore < 65 || cand.interviewStatus === "Suspended") return "do_not_hire"
    return "borderline"
  }

  // Filter completed or suspended candidates for reports list
  const completedCandidates = candidates.filter(
    (c) => c.interviewStatus === "Completed" || c.interviewStatus === "Suspended"
  )

  // Filter candidates list based on selectors
  const filteredCandidates = completedCandidates.filter((c) => {
    // Search query match
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Job filter match
    const matchesJob = selectedJobId === "all" || c.jobId.toString() === selectedJobId.toString()
    
    // Weighted score match
    const technicalGrade = c.interviewScore || (c.score - 5)
    const finalScore = Math.round(c.score * 0.3 + technicalGrade * 0.5 + Math.min(100, c.score * 1.1) * 0.2)
    
    let matchesScore = true
    if (selectedScoreRange === "90+") matchesScore = finalScore >= 90
    else if (selectedScoreRange === "80-89") matchesScore = finalScore >= 80 && finalScore < 90
    else if (selectedScoreRange === "70-79") matchesScore = finalScore >= 70 && finalScore < 80
    else if (selectedScoreRange === "under-70") matchesScore = finalScore < 70

    // Recommendation match
    const rec = getRecommendation(c)
    const matchesRec = selectedRec === "all" || rec === selectedRec

    return matchesSearch && matchesJob && matchesScore && matchesRec
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        
        {/* Filters Panel Skeleton */}
        <div className="rounded-xl border border-border p-4 bg-card grid gap-4 grid-cols-1 sm:grid-cols-4 dark:bg-slate-900">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>

        {/* Table Skeletons */}
        <div className="border border-border rounded-xl bg-card overflow-hidden dark:bg-slate-900">
          <div className="p-4 border-b border-border">
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // If viewing a specific detailed report
  if (activeCandidate) {
    return (
      <CandidateReport
        candidate={activeCandidate as any}
        onBack={() => setActiveCandidate(null)}
      />
    )
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Header Block */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Assessment Reports</h2>
        <p className="text-sm text-brand-muted-text">Analyze completed AI technical tests, screening scorecards, and proctor integrity metrics.</p>
      </div>

      {/* Filter Action Strip */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm grid gap-4 grid-cols-1 sm:grid-cols-12 dark:bg-slate-900 transition-colors duration-300">
        
        {/* Search Input */}
        <div className="relative sm:col-span-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate or role..."
            className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-950 transition-colors"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-muted-text" />
        </div>

        {/* Job Selection Dropdown */}
        <div className="relative sm:col-span-3">
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-950 transition-colors cursor-pointer"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Score Range Dropdown */}
        <div className="relative sm:col-span-2.5">
          <select
            value={selectedScoreRange}
            onChange={(e) => setSelectedScoreRange(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-950 transition-colors cursor-pointer"
          >
            <option value="all">All Scores</option>
            <option value="90+">Grade A (90%+)</option>
            <option value="80-89">Grade B (80%-89%)</option>
            <option value="70-79">Grade C (70%-79%)</option>
            <option value="under-70">Fail (&lt;70%)</option>
          </select>
        </div>

        {/* Recommendation Dropdown */}
        <div className="relative sm:col-span-2.5">
          <select
            value={selectedRec}
            onChange={(e) => setSelectedRec(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-950 transition-colors cursor-pointer"
          >
            <option value="all">All Actions</option>
            <option value="recommend">Recommend Hire</option>
            <option value="borderline">Borderline Fit</option>
            <option value="do_not_hire">Do Not Hire</option>
          </select>
        </div>

      </div>

      {/* Reports Table List card */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden dark:bg-slate-900 transition-colors duration-300">
        <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-brand-muted-text flex items-center gap-2">
            <SlidersHorizontal className="h-4.5 w-4.5" /> Completed Assessments ({filteredCandidates.length})
          </h3>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="py-16 text-center text-brand-muted-text space-y-3">
            <FileText className="h-12 w-12 mx-auto stroke-1" />
            <div>
              <p className="font-semibold text-lg">No reports match your filters</p>
              <p className="text-sm">Try widening your search terms or adjustments.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/75 dark:bg-slate-800/40 text-brand-muted-text font-bold border-b border-border/40 select-none">
                  <th className="p-4 pl-6">Candidate Name</th>
                  <th className="p-4">Applied Job Role</th>
                  <th className="p-4 text-center">Score Grade</th>
                  <th className="p-4">Session Date</th>
                  <th className="p-4">Integrity status</th>
                  <th className="p-4 text-center">Action Recommendation</th>
                  <th className="p-4 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((cand, index) => {
                  const technicalGrade = cand.interviewScore || (cand.score - 5)
                  const finalScore = Math.round(
                    cand.score * 0.3 + technicalGrade * 0.5 + Math.min(100, cand.score * 1.1) * 0.2
                  )
                  const rec = getRecommendation(cand)

                  return (
                    <tr 
                      key={cand.id}
                      onClick={() => setActiveCandidate(cand)}
                      className={cn(
                        "border-b border-border/30 hover:bg-slate-50/65 dark:hover:bg-slate-800/30 cursor-pointer transition-colors",
                        index % 2 === 1 ? "bg-slate-50/20 dark:bg-slate-800/10" : ""
                      )}
                    >
                      {/* Name */}
                      <td className="p-4 pl-6 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-brand-primary-bg dark:bg-slate-800 text-brand-primary dark:text-brand-primary-bg flex items-center justify-center text-[10px] font-black">
                          {cand.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        {cand.name}
                      </td>
                      
                      {/* Role */}
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">{cand.role}</td>
                      
                      {/* Score */}
                      <td className="p-4 text-center">
                        <span className={cn(
                          "inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-xs font-extrabold",
                          finalScore >= 80 ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" :
                          finalScore >= 65 ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20" :
                          "text-rose-600 bg-rose-50 dark:bg-rose-950/20"
                        )}>
                          {finalScore}%
                        </span>
                      </td>
                      
                      {/* Date */}
                      <td className="p-4 text-brand-muted-text font-medium flex items-center gap-1 mt-1 border-none">
                        <Calendar className="h-3.5 w-3.5 text-brand-muted-text" />
                        {cand.date}
                      </td>
                      
                      {/* Integrity */}
                      <td className="p-4">
                        <span className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                          cand.interviewStatus === "Completed" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/25 border border-emerald-100/20" :
                          "bg-rose-50 text-brand-danger dark:bg-rose-950/25 border border-rose-100/20 animate-pulse"
                        )}>
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            cand.interviewStatus === "Completed" ? "bg-emerald-505" : "bg-rose-500"
                          )} />
                          {cand.interviewStatus === "Completed" ? "Secure" : "Suspended"}
                        </span>
                      </td>

                      {/* Recommendation */}
                      <td className="p-4 text-center">
                        {rec === "recommend" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/45 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Recommend Hire
                          </span>
                        )}
                        {rec === "borderline" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/45 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                            Borderline Fit
                          </span>
                        )}
                        {rec === "do_not_hire" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950/45 px-2.5 py-0.5 text-[10px] font-bold text-brand-danger">
                            Do Not Hire
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 pr-6 text-center">
                        <button className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline group cursor-pointer border-none bg-transparent">
                          View Report
                          <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

    </div>
  )
}
