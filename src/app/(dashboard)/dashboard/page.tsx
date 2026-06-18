"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Briefcase, 
  Users, 
  Video, 
  TrendingUp, 
  MoreVertical, 
  FileText, 
  AlertTriangle, 
  Award, 
  Bot, 
  Plus, 
  ChevronRight,
  X,
  Eye,
  Edit3,
  Archive,
  Calendar
} from "lucide-react"

// Icon mapping helper for stats
const getStatIcon = (iconName: string) => {
  switch (iconName) {
    case "Briefcase": return Briefcase
    case "Users": return Users
    case "Video": return Video
    case "TrendingUp": return TrendingUp
    default: return Briefcase
  }
}

// Icon mapping helper for activity
const getActivityIcon = (type: string) => {
  switch (type) {
    case "score": return Award
    case "upload": return FileText
    case "invite": return Video
    case "alert": return AlertTriangle
    default: return Bot
  }
}

// Color mapping helper for activity
const getActivityIconColor = (type: string) => {
  switch (type) {
    case "score": return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
    case "upload": return "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
    case "invite": return "text-purple-500 bg-purple-50 dark:bg-purple-950/20"
    case "alert": return "text-rose-500 bg-rose-50 dark:bg-rose-950/20 animate-pulse"
    default: return "text-slate-500 bg-slate-50 dark:bg-slate-950/20"
  }
}

export default function DashboardPage() {
  const [activeStage, setActiveStage] = useState<string | null>(null)

  // React Queries fetching from Flask API
  const { 
    data: stats, 
    isLoading: isStatsLoading, 
    isError: isStatsError 
  } = useQuery({ 
    queryKey: ["dashboardStats"], 
    queryFn: api.getDashboardStats 
  })

  const { 
    data: candidates, 
    isLoading: isCandidatesLoading 
  } = useQuery({ 
    queryKey: ["candidates"], 
    queryFn: () => api.getCandidates() 
  })

  const { 
    data: jobs, 
    isLoading: isJobsLoading 
  } = useQuery({ 
    queryKey: ["jobs"], 
    queryFn: api.getJobs 
  })

  // Toast notifications for connection errors
  useEffect(() => {
    if (isStatsError) {
      toast.error("Failed to connect to Flask API server. Using mock fallback details.", {
        description: "Verify that your Flask backend is running on http://localhost:5000",
      })
    }
  }, [isStatsError])

  const isLoading = isStatsLoading || isCandidatesLoading || isJobsLoading

  // Map stats dynamically
  const statsList = stats ? [
    {
      id: "active-jobs",
      label: "Active Jobs",
      value: stats.activeJobs,
      trend: "Positions actively hiring",
      icon: "Briefcase",
      color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/45",
    },
    {
      id: "total-candidates",
      label: "Total Candidates",
      value: stats.totalCandidates,
      trend: "Across all active openings",
      icon: "Users",
      color: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/45",
    },
    {
      id: "interviews-today",
      label: "Interviews Completed",
      value: stats.interviewsToday,
      trend: "Completed AI sessions",
      icon: "Video",
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/45",
    },
    {
      id: "avg-hire-score",
      label: "Avg. Screening Score",
      value: stats.avgHireScore,
      trend: "AI scorecard average",
      icon: "TrendingUp",
      color: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/45",
    },
  ] : []

  // Filter candidates based on selected stage
  const filteredCandidates = activeStage && candidates
    ? candidates.filter(c => c.stage === activeStage)
    : []

  // Loading Screen Skeleton Layout
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-[350px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-4">
            <Skeleton className="h-[490px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Niranjan</h2>
          <p className="text-sm text-brand-muted-text">Here is what's happening with your recruitment pipelines today.</p>
        </div>
        <Link href="/jobs" className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
          <Plus className="h-4 w-4" />
          Post New Job
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsList.map((stat) => {
          const Icon = getStatIcon(stat.icon)
          return (
            <div key={stat.id} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-muted-text">{stat.label}</span>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight">{stat.value}</h3>
                <p className="text-xs text-brand-muted-text flex items-center gap-1 mt-1 font-medium">
                  <span>{stat.trend}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Hiring Pipeline Funnel Layout */}
      {stats && stats.pipeline && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900">
          <div className="mb-4">
            <h3 className="text-lg font-bold tracking-tight">Hiring Pipeline</h3>
            <p className="text-sm text-brand-muted-text">Click any stage to filter candidate details below.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.pipeline.map((step, idx) => {
              const isSelected = activeStage === step.stage
              return (
                <div key={step.stage} className="relative flex items-center">
                  <button
                    onClick={() => setActiveStage(isSelected ? null : step.stage)}
                    className={`flex-1 flex flex-col p-4 rounded-xl border transition-all cursor-pointer text-left hover:scale-[1.02] ${
                      isSelected 
                        ? "border-brand-primary bg-brand-primary-bg dark:bg-brand-card-dark text-brand-primary shadow-sm"
                        : "border-border bg-background/50 text-foreground hover:bg-accent/40"
                    }`}
                  >
                    <span className="text-2xl font-black">{step.count}</span>
                    <span className="text-xs font-bold mt-1 truncate">{step.stage}</span>
                    <span className="text-[10px] text-brand-muted-text leading-tight mt-0.5 line-clamp-1">
                      {step.description}
                    </span>
                  </button>

                  {idx < 4 && (
                    <div className="hidden lg:flex items-center justify-center absolute -right-3.5 z-10 w-3 h-3 text-brand-muted-text/60">
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Dashboard content / Activities */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Column: Jobs or Filtered Candidates Table */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold tracking-tight">
                  {activeStage ? `Pipeline Stage: ${activeStage}` : "Recent Jobs"}
                </h3>
                <p className="text-sm text-brand-muted-text">
                  {activeStage 
                    ? `Showing candidates currently in the ${activeStage} workflow.` 
                    : "Review status and applicant details for your active job listings."}
                </p>
              </div>

              {activeStage && (
                <button 
                  onClick={() => setActiveStage(null)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand-primary hover:underline border border-brand-primary-bg rounded-lg bg-brand-primary-bg dark:bg-brand-card-dark px-2.5 py-1.5 cursor-pointer"
                >
                  <X className="h-3 w-3" />
                  <span>Clear Filter</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              {activeStage ? (
                filteredCandidates.length === 0 ? (
                  <div className="py-12 text-center text-brand-muted-text space-y-2">
                    <Users className="h-8 w-8 mx-auto stroke-1" />
                    <p className="font-medium">No candidates in this stage</p>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-xs text-brand-muted-text font-bold uppercase">
                        <th className="pb-3">Candidate</th>
                        <th className="pb-3">Applied Role</th>
                        <th className="pb-3 text-right">Match Score</th>
                        <th className="pb-3 text-right">Update Date</th>
                        <th className="pb-3 text-right">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-sm">
                      {filteredCandidates.map((cand, index) => (
                        <tr 
                          key={cand.id} 
                          className={cn(
                            "hover:bg-accent/10 transition-colors",
                            index % 2 === 1 ? "bg-slate-50/20 dark:bg-slate-800/20" : ""
                          )}
                        >
                          <td className="py-3.5 font-semibold">{cand.name}</td>
                          <td className="py-3.5 text-brand-muted-text">{cand.role}</td>
                          <td className="py-3.5 text-right font-bold text-brand-primary">{cand.score}%</td>
                          <td className="py-3.5 text-right text-brand-muted-text">{cand.date}</td>
                          <td className="py-3.5 text-right">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                              cand.status === "Strong Hire" ? "bg-emerald-100 text-brand-success dark:bg-emerald-950/40" :
                              cand.status === "Consider" ? "bg-blue-100 text-brand-primary dark:bg-blue-950/40" :
                              cand.status === "Not Recommended" ? "bg-rose-100 text-brand-danger dark:bg-rose-950/40" :
                              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {cand.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                jobs && (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/40 text-xs text-brand-muted-text font-bold uppercase">
                        <th className="pb-3">Job Title</th>
                        <th className="pb-3 text-right">Candidates</th>
                        <th className="pb-3 text-right">Top Score</th>
                        <th className="pb-3 text-right">Status</th>
                        <th className="pb-3 text-right">Created</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30 text-sm">
                      {jobs.map((job, index) => (
                        <tr 
                          key={job.id} 
                          className={cn(
                            "hover:bg-accent/10 transition-colors",
                            index % 2 === 1 ? "bg-slate-50/20 dark:bg-slate-800/20" : ""
                          )}
                        >
                          <td className="py-3.5 font-semibold text-foreground">{job.title}</td>
                          <td className="py-3.5 text-right font-medium">{job.candidates}</td>
                          <td className="py-3.5 text-right text-brand-primary font-bold">{job.topScore}%</td>
                          <td className="py-3.5 text-right">
                            <span className={cn(
                              "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
                              job.status === "Active" ? "bg-emerald-100 text-brand-success dark:bg-emerald-950/40" :
                              job.status === "Draft" ? "bg-amber-100 text-brand-warning dark:bg-amber-950/40" :
                              "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                            )}>
                              {job.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-right text-brand-muted-text">{job.created}</td>
                          <td className="py-3.5 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="p-1 rounded-md text-brand-muted-text hover:bg-accent hover:text-foreground cursor-pointer">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-900 border border-border">
                                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent rounded">
                                  <Link href="/candidates" className="flex items-center gap-2 w-full">
                                    <Eye className="h-3.5 w-3.5" />
                                    <span>View Pipeline</span>
                                  </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent rounded">
                                  <Link href="/jobs" className="flex items-center gap-2 w-full">
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span>Edit Details</span>
                                  </Link>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between dark:bg-slate-900">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
              <p className="text-sm text-brand-muted-text">Timeline of candidate and platform activities.</p>
            </div>

            {stats && stats.recentActivities && (
              <div className="flow-root">
                <ul className="-mb-8">
                  {stats.recentActivities.map((activity, activityIdx) => {
                    const Icon = getActivityIcon(activity.type)
                    const iconColor = getActivityIconColor(activity.type)
                    return (
                      <li key={activity.id}>
                        <div className="relative pb-6">
                          {activityIdx !== stats.recentActivities.length - 1 ? (
                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-border/50" aria-hidden="true" />
                          ) : null}
                          
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-slate-900 ${iconColor}`}>
                                <Icon className="h-4 w-4" aria-hidden="true" />
                              </span>
                            </div>
                            <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-xs font-medium text-foreground">
                                  {activity.text}
                                </p>
                              </div>
                              <div className="text-right text-[10px] text-brand-muted-text whitespace-nowrap">
                                <time dateTime={activity.time}>{activity.time}</time>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>

      </div>
      
    </div>
  )
}
