"use client"

import React from "react"
import { Candidate } from "@/lib/mock-data"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { 
  Mail, 
  Phone, 
  Calendar, 
  Sparkles, 
  Award, 
  Download, 
  AlertTriangle,
  Play,
  CheckCircle,
  Tag,
  ArrowRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CandidateDetailModalProps {
  candidate: Candidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (id: string) => void
  onMoveStage: (id: string, stage: Candidate["stage"]) => void
}

export function CandidateDetailModal({
  candidate,
  open,
  onOpenChange,
  onInvite,
  onMoveStage,
}: CandidateDetailModalProps) {
  if (!candidate) return null

  // Circular progress specs
  const radius = 24
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (candidate.score / 100) * circumference

  let scoreColor = "text-rose-500"
  let strokeColor = "stroke-rose-500"
  let scoreLabel = "Needs Review"
  if (candidate.score >= 75) {
    scoreColor = "text-emerald-500"
    strokeColor = "stroke-emerald-500"
    scoreLabel = "Excellent Fit"
  } else if (candidate.score >= 50) {
    scoreColor = "text-amber-500"
    strokeColor = "stroke-amber-500"
    scoreLabel = "Moderate Fit"
  }

  // Stages options
  const stages: Candidate["stage"][] = ["Applied", "Screened", "Interview", "Offer", "Hired", "Rejected"]

  const handleDownload = () => {
    alert(`Downloading resume for ${candidate.name}... (Mock Document Generated)`)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto px-6 py-6 bg-white dark:bg-slate-900 border-l border-border/40">
        
        {/* Header Profile Info */}
        <SheetHeader className="space-y-2 border-b border-border/40 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-brand-primary text-white flex items-center justify-center font-extrabold text-base shadow-md">
              {candidate.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <SheetTitle className="text-xl font-bold tracking-tight">{candidate.name}</SheetTitle>
              <SheetDescription className="text-sm font-semibold text-brand-primary mt-0.5">
                {candidate.role}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Profile Details Body */}
        <div className="py-6 space-y-6">
          
          {/* Quick Metrics (Resume Match / Interview Score) */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Resume Score Card */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col items-center justify-center text-center">
              <div className="relative h-14 w-14 shrink-0">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="3.5"
                    fill="transparent"
                    r={radius}
                    cx="28"
                    cy="28"
                  />
                  <circle
                    className={cn(strokeColor, "transition-all duration-300")}
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="28"
                    cy="28"
                  />
                </svg>
                <div className={cn("absolute inset-0 flex items-center justify-center text-xs font-black", scoreColor)}>
                  {candidate.score}%
                </div>
              </div>
              <span className="text-[11px] font-bold text-brand-muted-text mt-3">Resume Match</span>
              <span className={cn("text-[10px] font-extrabold mt-0.5", scoreColor)}>{scoreLabel}</span>
            </div>

            {/* AI Assessment Grade */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col items-center justify-center text-center">
              {candidate.interviewStatus === "Completed" && candidate.interviewScore ? (
                <>
                  <div className="h-14 w-14 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-brand-success flex items-center justify-center font-black text-lg shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                    {candidate.interviewScore}
                  </div>
                  <span className="text-[11px] font-bold text-brand-muted-text mt-3">Interview Grade</span>
                  <span className="text-[10px] font-extrabold text-brand-success mt-0.5">Passed Screen</span>
                </>
              ) : candidate.interviewStatus === "Suspended" ? (
                <>
                  <div className="h-14 w-14 rounded-full bg-rose-50 dark:bg-rose-950/20 text-brand-danger flex items-center justify-center shadow-sm border border-rose-100 dark:border-rose-900/30">
                    <AlertTriangle className="h-6 w-6 animate-pulse" />
                  </div>
                  <span className="text-[11px] font-bold text-brand-muted-text mt-3">Interview Grade</span>
                  <span className="text-[10px] font-extrabold text-brand-danger mt-0.5">Suspended</span>
                </>
              ) : (
                <>
                  <div className="h-14 w-14 rounded-full bg-slate-100 dark:bg-slate-800 text-brand-muted-text flex items-center justify-center font-bold text-sm border border-border">
                    N/A
                  </div>
                  <span className="text-[11px] font-bold text-brand-muted-text mt-3">Interview Grade</span>
                  <span className="text-[10px] font-extrabold text-brand-muted-text mt-0.5">Pending Invite</span>
                </>
              )}
            </div>

          </div>

          {/* Contact Details */}
          <div className="space-y-3 rounded-xl border border-border p-4 bg-background/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text mb-2 flex items-center gap-1.5">
              <span>Contact Information</span>
            </h4>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-brand-muted-text shrink-0" />
              <span className="truncate">{candidate.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-brand-muted-text shrink-0" />
              <span>{candidate.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-brand-muted-text shrink-0" />
              <span>Applied on {candidate.date}</span>
            </div>
          </div>

          {/* Skills Badges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              <span>Extracted Tech Skills</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-brand-primary-bg px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-card-dark"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* AI Proctoring Log Status details */}
          <div className="space-y-3 rounded-xl border border-border p-4 bg-background/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">
              AI Proctoring Log status
            </h4>
            {candidate.interviewStatus === "Completed" ? (
              <p className="text-xs text-brand-muted-text leading-relaxed">
                Exam completed successfully. Proctoring check completed with **0 integrity alerts**. No signs of multiple people or cell phones detected.
              </p>
            ) : candidate.interviewStatus === "Suspended" ? (
              <div className="space-y-2">
                <p className="text-xs text-brand-danger font-semibold flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  <span>Violations Detected during Session</span>
                </p>
                <p className="text-xs text-brand-muted-text leading-relaxed">
                  The session was auto-suspended. Integrity flags logged:
                  <span className="block mt-1 font-bold text-rose-600 dark:text-rose-400">• Mobile Phone Detected (x2)</span>
                  <span className="block font-bold text-rose-600 dark:text-rose-400">• Multiple faces present on camera frame</span>
                </p>
              </div>
            ) : (
              <p className="text-xs text-brand-muted-text leading-relaxed">
                Candidate is scheduled to receive the link. Proctoring analytics will activate automatically when the session starts.
              </p>
            )}
          </div>

          {/* Stage Drag-drop Move stage Dropdown */}
          <div className="space-y-2 border-t border-border/40 pt-4">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text block">
              Move Candidate Stage
            </label>
            <select
              value={candidate.stage}
              onChange={(e) => onMoveStage(candidate.id, e.target.value as Candidate["stage"])}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
            >
              {stages.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/40 pt-5 mt-6 flex flex-col gap-3">
          <button
            onClick={() => onInvite(candidate.id)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/95 transition-all cursor-pointer"
          >
            <Play className="h-4 w-4" />
            Send Interview Invite
          </button>
          
          <button
            onClick={handleDownload}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-accent transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download Resume (PDF)
          </button>
        </div>

      </SheetContent>
    </Sheet>
  )
}
