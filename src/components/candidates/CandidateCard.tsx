"use client"

import React from "react"
import { useDraggable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Candidate } from "@/lib/mock-data"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  GripVertical, 
  MoreVertical, 
  Mail, 
  User, 
  Video, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  ArrowRight
} from "lucide-react"

interface CandidateCardProps {
  candidate: Candidate
  onClick: () => void
  onInvite: (id: string) => void
  onReject: (id: string) => void
}

export function CandidateCard({ candidate, onClick, onInvite, onReject }: CandidateCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: candidate.id,
  })

  // SVG circular progress details
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (candidate.score / 100) * circumference

  let strokeColor = "stroke-rose-500"
  let bgScoreColor = "text-rose-500"
  if (candidate.score >= 75) {
    strokeColor = "stroke-emerald-500"
    bgScoreColor = "text-emerald-500"
  } else if (candidate.score >= 50) {
    strokeColor = "stroke-amber-500"
    bgScoreColor = "text-amber-500"
  }

  // Initials for avatar
  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  // Custom colors for avatar circles
  const colors = [
    "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    "bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
  ]
  const avatarColor = colors[candidate.name.length % colors.length]

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all",
        isDragging ? "opacity-40 scale-95 border-brand-primary" : "opacity-100"
      )}
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        
        {/* Avatar & Info */}
        <div className="flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs select-none shadow-sm", avatarColor)}>
            {initials}
          </div>
          <div className="min-w-0">
            <h4 className="font-bold text-sm tracking-tight truncate hover:text-brand-primary transition-colors cursor-pointer" onClick={onClick}>
              {candidate.name}
            </h4>
            <p className="text-xs text-brand-muted-text truncate">{candidate.role}</p>
          </div>
        </div>

        {/* Drag Handle & Kebab Actions */}
        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
          
          {/* Drag Handle Area */}
          <div
            {...listeners}
            {...attributes}
            className="p-1 hover:bg-accent rounded-md cursor-grab active:cursor-grabbing text-brand-muted-text"
            title="Drag candidate"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Kebab Action Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md text-brand-muted-text hover:bg-accent hover:text-foreground cursor-pointer">
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 bg-white dark:bg-slate-900 border border-border">
              <DropdownMenuItem onClick={onClick} className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent rounded">
                <User className="h-3.5 w-3.5" />
                <span>View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onInvite(candidate.id)} className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer hover:bg-accent rounded">
                <Mail className="h-3.5 w-3.5" />
                <span>Send Invite</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReject(candidate.id)} className="flex items-center gap-2 px-3 py-2 text-xs text-brand-danger cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Move to Rejected</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>

      {/* Middle Stats Row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
        
        {/* Match Score circular SVG gauge */}
        <div className="flex items-center gap-2">
          <div className="relative h-8 w-8 shrink-0">
            <svg className="h-full w-full -rotate-90">
              <circle
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="3"
                fill="transparent"
                r={radius}
                cx="16"
                cy="16"
              />
              <circle
                className={cn(strokeColor, "transition-all duration-300")}
                strokeWidth="3"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                r={radius}
                cx="16"
                cy="16"
              />
            </svg>
            <div className={cn("absolute inset-0 flex items-center justify-center text-[9px] font-extrabold", bgScoreColor)}>
              {candidate.score}
            </div>
          </div>
          <span className="text-[10px] font-bold text-brand-muted-text">Match Score</span>
        </div>

        {/* Interview Status Badge */}
        <div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              candidate.interviewStatus === "Completed"
                ? "bg-emerald-100 text-brand-success dark:bg-emerald-950/40"
                : candidate.interviewStatus === "Suspended"
                ? "bg-rose-100 text-brand-danger dark:bg-rose-950/40 animate-pulse"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            )}
          >
            {candidate.interviewStatus === "Completed" && <CheckCircle className="h-2.5 w-2.5" />}
            {candidate.interviewStatus === "Suspended" && <AlertTriangle className="h-2.5 w-2.5" />}
            {candidate.interviewStatus === "Pending" && <Clock className="h-2.5 w-2.5" />}
            {candidate.interviewStatus}
          </span>
        </div>

      </div>

      {/* Action Footer Buttons */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onClick}
          className="flex-1 inline-flex items-center justify-center rounded-lg border border-border bg-card px-2 py-1.5 text-xs font-semibold hover:bg-accent transition-all cursor-pointer"
        >
          View Profile
        </button>
        <button
          onClick={() => onInvite(candidate.id)}
          className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-brand-primary px-2 py-1.5 text-xs font-semibold text-white hover:bg-brand-primary/95 transition-all cursor-pointer"
        >
          <Mail className="h-3 w-3" />
          Send Invite
        </button>
      </div>
    </div>
  )
}
