"use client"

import React, { useState, useEffect } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MOCK_STATS, 
  MOCK_PIPELINE, 
  MOCK_JOBS, 
  MOCK_CANDIDATES, 
  MOCK_ACTIVITIES,
  Job,
  Candidate,
  Activity
} from "@/lib/mock-data"
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
  Zap, 
  Plus, 
  ChevronRight,
  ArrowUpRight,
  X,
  Filter,
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
  const [isLoading, setIsLoading] = useState(true)
  const [activeStage, setActiveStage] = useState<string | null>(null)

  // Simulation of skeleton loader for 1.5s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Filter candidates based on selected stage
  const filteredCandidates = activeStage 
    ? MOCK_CANDIDATES.filter(c => c.stage === activeStage)
    : []

  // Skeleton loading screen
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Banner Skeleton */}
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>

        {/* Stats Row Skeletons */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>

        {/* Content Skeletons */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Panel Skeletons (Col Span 8) */}
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-[350px] w-full rounded-xl" />
          </div>

          {/* Activity Panel Skeletons (Col Span 4) */}
          <div className="lg:col-span-4">
            <Skeleton className="h-[490px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Niranjan</h2>
          <p className="text-sm text-brand-muted-text">Here is what's happening with your recruitment pipelines today.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
          <Plus className="h-4 w-4" />
          Create New Job
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {MOCK_STATS.map((stat) => {
          const Icon = getStatIcon(stat.icon)
          return (
            <div key={stat.id} className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-brand-muted-text">{stat.label}</span>
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-extrabold tracking-tight">{stat.value}</h3>
                <p className="text-xs text-brand-success flex items-center gap-1 mt-1 font-medium">
                  <TrendingUp className="h-3 w-3 fill-current" />
                  <span>{stat.trend}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Horizontal Funnel Hiring Pipeline */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold tracking-tight">Hiring Pipeline</h3>
          <p className="text-sm text-brand-muted-text">Click any stage to filter candidate details below.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {MOCK_PIPELINE.map((step, idx) => {
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

                {/* Arrow connector for non-last desktop items */}
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

      {/* Main Grid: Dashboard content / Activities */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Jobs or Filtered Candidates List (Col Span 8) */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
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
                /* Filtered Candidates Table */
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
                      {filteredCandidates.map((cand) => (
                        <tr key={cand.id} className="hover:bg-accent/10 transition-colors">
                          <td className="py-3.5 font-semibold">{cand.name}</td>
                          <td className="py-3.5 text-brand-muted-text">{cand.role}</td>
                          <td className="py-3.5 text-right font-bold text-brand-primary">{cand.score}%</td>
                          <td className="py-3.5 text-right text-brand-muted-text">{cand.date}</td>
                          <td className="py-3.5 text-right">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              cand.status === "Strong Hire" ? "bg-emerald-100 text-brand-success dark:bg-emerald-950/40" :
                              cand.status === "Consider" ? "bg-blue-100 text-brand-primary dark:bg-blue-950/40" :
                              cand.status === "Not Recommended" ? "bg-rose-100 text-brand-danger dark:bg-rose-950/40" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {cand.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              ) : (
                /* Recent Jobs Table */
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
                    {MOCK_JOBS.map((job) => (
                      <tr key={job.id} className="hover:bg-accent/10 transition-colors">
                        <td className="py-3.5 font-semibold text-foreground">{job.title}</td>
                        <td className="py-3.5 text-right font-medium">{job.candidates}</td>
                        <td className="py-3.5 text-right text-brand-primary font-bold">{job.topScore}%</td>
                        <td className="py-3.5 text-right">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            job.status === "Active" ? "bg-emerald-100 text-brand-success dark:bg-emerald-950/40" :
                            job.status === "Draft" ? "bg-amber-100 text-brand-warning dark:bg-amber-950/40" :
                            "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          }`}>
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
                              <DropdownMenuItem 
                                onClick={() => alert(`Viewing pipeline for: ${job.title}`)}
                                className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent rounded"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                <span>View Pipeline</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => alert(`Editing: ${job.title}`)}
                                className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent rounded"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                                <span>Edit Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => alert(`Archived: ${job.title}`)}
                                className="flex items-center gap-2 px-3 py-2 text-xs text-brand-danger cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded"
                              >
                                <Archive className="h-3.5 w-3.5" />
                                <span>Archive</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {!activeStage && (
            <div className="mt-4 flex items-center justify-between text-xs text-brand-muted-text border-t border-border/40 pt-4">
              <span>Displaying 5 of 12 jobs</span>
              <a href="#" className="font-semibold text-brand-primary hover:underline flex items-center gap-0.5">
                View All Jobs <ChevronRight className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Right Column: Recent Activity Feed (Col Span 4) */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Recent Activity</h3>
              <p className="text-sm text-brand-muted-text">Timeline of candidate and platform activities.</p>
            </div>

            <div className="flow-root">
              <ul className="-mb-8">
                {MOCK_ACTIVITIES.map((activity, activityIdx) => {
                  const Icon = getActivityIcon(activity.type)
                  const iconColor = getActivityIconColor(activity.type)
                  return (
                    <li key={activity.id}>
                      <div className="relative pb-6">
                        {/* Connecting Line */}
                        {activityIdx !== MOCK_ACTIVITIES.length - 1 ? (
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
          </div>
        </div>
      </div>
      
    </div>
  )
}
