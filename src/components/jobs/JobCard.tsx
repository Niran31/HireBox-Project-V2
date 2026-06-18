"use client"

import React from "react"
import Link from "next/link"
import { Job, Candidate, MOCK_CANDIDATES } from "@/lib/mock-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreVertical, 
  MapPin, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Eye, 
  Edit3, 
  Trash2,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

interface JobCardProps {
  job: Job
  onStatusToggle: (id: string) => void
  onEdit: (job: Job) => void
  onDelete: (id: string) => void
}

export function JobCard({ job, onStatusToggle, onEdit, onDelete }: JobCardProps) {
  // Find candidates linked to this specific job dynamically
  const jobCandidates = MOCK_CANDIDATES.filter((c) => c.jobId === job.id)
  const candidateCount = jobCandidates.length

  // Calculate top score dynamically from candidates if Hired/Interviewed, else fallback to job.topScore
  const scores = jobCandidates.map((c) => c.score)
  const topScore = scores.length > 0 ? Math.max(...scores) : job.topScore

  // Overlap avatars calculations
  const displayLimit = 3
  const avatarsToShow = jobCandidates.slice(0, displayLimit)
  const remainingCount = Math.max(0, candidateCount - displayLimit)

  // Colors for avatar circles
  const colors = [
    "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  ]

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
      <div>
        {/* Title & Actions Row */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-lg tracking-tight group-hover:text-brand-primary transition-colors">
              {job.title}
            </h3>
            <span className="text-[10px] text-brand-muted-text flex items-center gap-1 mt-1 font-semibold">
              <Calendar className="h-3.5 w-3.5" />
              Posted {job.created}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 rounded-md text-brand-muted-text hover:bg-accent hover:text-foreground cursor-pointer transition-colors">
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
              <DropdownMenuItem onClick={() => onEdit(job)} className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent rounded">
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit Job</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(job.id)} className="flex items-center gap-2 px-3 py-2 text-xs text-brand-danger cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Job</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Badges (Department & Location) */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-bg px-2.5 py-0.5 text-[10px] font-bold text-brand-primary dark:bg-brand-card-dark">
            <Briefcase className="h-2.5 w-2.5" />
            {job.department}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <MapPin className="h-2.5 w-2.5" />
            {job.location}
          </span>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {job.type}
          </span>
        </div>

        {/* Top Score Linear Bar */}
        <div className="space-y-1.5 mb-5">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-brand-muted-text">Top Screening Score</span>
            <span className="text-brand-primary">{topScore}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-brand-primary h-full rounded-full transition-all duration-500" 
              style={{ width: `${topScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer: Status Toggle & Overlap Avatars */}
      <div className="border-t border-border/40 pt-4 flex items-center justify-between">
        
        {/* Status Switcher Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onStatusToggle(job.id)}
            className={cn(
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
              job.status === "Active" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                job.status === "Active" ? "translate-x-4" : "translate-x-0"
              )}
            />
          </button>
          <span className="text-xs font-bold">
            {job.status === "Active" ? "Active" : "Closed"}
          </span>
        </div>

        {/* Overlap Avatars */}
        <div className="flex items-center gap-1.5">
          {candidateCount > 0 ? (
            <div className="flex -space-x-2.5 overflow-hidden">
              {avatarsToShow.map((cand, idx) => {
                const initials = cand.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                const avatarColor = colors[cand.name.length % colors.length]
                return (
                  <div
                    key={cand.id}
                    className={cn(
                      "inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-slate-900 flex items-center justify-center font-bold text-[9px]",
                      avatarColor
                    )}
                    title={cand.name}
                  >
                    {initials}
                  </div>
                )
              })}
              {remainingCount > 0 && (
                <div className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 text-brand-muted-text flex items-center justify-center font-bold text-[9px]">
                  +{remainingCount}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-brand-muted-text font-bold flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              0 candidates
            </span>
          )}
        </div>

      </div>
    </div>
  )
}
