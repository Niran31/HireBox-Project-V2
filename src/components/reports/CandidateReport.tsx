"use client"

import React, { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { api, ApiCandidate, ApiReport } from "@/lib/api"
import { 
  ArrowLeft, 
  Download, 
  Send, 
  Archive, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Bot, 
  FileText,
  Clock,
  Shield,
  ChevronDown,
  ChevronUp,
  Award,
  AlertOctagon,
  Percent
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface CandidateReportProps {
  candidate: ApiCandidate
  onBack: () => void
}

export function CandidateReport({ candidate, onBack }: CandidateReportProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  // React Query: fetch detailed scorecard report from Flask API
  const { 
    data: report, 
    isLoading, 
    isError 
  } = useQuery<ApiReport>({
    queryKey: ["report", candidate.id],
    queryFn: () => api.getReport(candidate.id),
    retry: 1
  })

  // Skeletons loader if loading report
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <button onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted-text">
          <ArrowLeft className="h-4 w-4" /> Back to Reports List
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-[350px] w-full rounded-xl" />
            <Skeleton className="h-[200px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-8 space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[150px] w-full rounded-xl" />
            <Skeleton className="h-[250px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // --- Dynamic Mapped / Fallback Parameters ---
  
  // Weighted scores fallback if backend report is unavailable
  const fallbackTechnicalGrade = candidate.interviewScore || (candidate.score - 5)
  const fallbackResumeScore = candidate.score
  const fallbackBehavioralGrade = Math.min(100, Math.round(candidate.score + (candidate.id.toString() === "cand-9" ? 5 : -2)))
  const fallbackFinalScore = Math.round(
    fallbackResumeScore * 0.3 + fallbackTechnicalGrade * 0.5 + fallbackBehavioralGrade * 0.2
  )

  const calculatedFinalScore = report ? report.calculatedFinalScore : fallbackFinalScore
  const resumeScore = report ? report.resumeScore : fallbackResumeScore
  const technicalGrade = report ? report.technicalGrade : fallbackTechnicalGrade
  const behavioralGrade = report ? report.behavioralGrade : fallbackBehavioralGrade

  // Recommendation configuration
  let fallbackRec: "recommend" | "borderline" | "do_not_hire" = "borderline"
  if (fallbackFinalScore >= 80 && candidate.interviewStatus !== "Suspended") {
    fallbackRec = "recommend"
  } else if (fallbackFinalScore < 65 || candidate.interviewStatus === "Suspended") {
    fallbackRec = "do_not_hire"
  }
  const recommendation = report ? report.recommendation : fallbackRec

  // Circular gauge parameters
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (calculatedFinalScore / 100) * circumference

  // Proctoring logs mapping
  const getProctoringFallback = () => {
    if (candidate.interviewStatus === "Suspended") {
      return {
        integrity: "Suspended" as const,
        color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30",
        logs: [
          { time: "01:12", event: "Tab minimization detected (Attempt 1)", type: "warning" as const },
          { time: "02:45", event: "Multiple faces detected in camera feed", type: "alert" as const },
          { time: "03:10", event: "Mobile device detected in candidate's hand", type: "critical" as const },
          { time: "03:12", event: "Session suspended automatically due to security violation", type: "system" as const }
        ]
      }
    } else if (candidate.score < 75) {
      return {
        integrity: "Minor Violations" as const,
        color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30",
        logs: [
          { time: "05:14", event: "Temporary loss of face visibility (12 seconds)", type: "warning" as const },
          { time: "11:22", event: "Browser focus lost (tab switched)", type: "warning" as const }
        ]
      }
    } else {
      return {
        integrity: "Clean" as const,
        color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30",
        logs: [
          { time: "00:00", event: "Webcam and microphone calibration verified", type: "info" as const },
          { time: "15:00", event: "Interview completed. No anomalies detected.", type: "info" as const }
        ]
      }
    }
  }

  const getIntegrityColor = (integ: string) => {
    switch(integ) {
      case "Clean": return "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
      case "Minor Violations": return "text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30"
      default: return "text-rose-500 bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
    }
  }

  const proctorStatus = report ? {
    integrity: report.proctorIntegrity,
    color: getIntegrityColor(report.proctorIntegrity),
    logs: report.proctorLogs
  } : getProctoringFallback()

  // Q&A responses list mapping
  const fallbackQA = [
    {
      question: "Explain the main differences between Next.js React Server Components (RSC) and Client Components. When should you use each?",
      answer: candidate.id.toString() === "cand-9" 
        ? "Server Components execute solely on the server side, keeping vendor libraries out of the bundle. Client Components are hydrated in-browser for handles, state, and browser-only APIs. I use RSC by default and Client Components for buttons, modals, and client hooks."
        : "Server components are for loading data on the server. Client components run on the client for user clicks and state. Next.js does server components by default.",
      score: candidate.id.toString() === "cand-9" ? 94 : 78,
      feedback: candidate.id.toString() === "cand-9"
        ? "Excellent response. Accurately defined the bundle-reduction benefits of server components and boundary rules."
        : "Correct concept, but lacked detail regarding client bundle sizes and hydration boundaries."
    },
    {
      question: "Describe a challenging technical bug you encountered in production. How did you diagnose and resolve it?",
      answer: candidate.id.toString() === "cand-9"
        ? "Diagnosed a DB CPU spike due to an unindexed foreign key in an inner loop. Analyzed Slow Query logs, added the target index, and batched queries to resolve the database bottleneck."
        : "Our server crashed because of infinite loops in our database query. I logged out details, found the file, and fixed the condition.",
      score: candidate.id.toString() === "cand-9" ? 90 : 70,
      feedback: candidate.id.toString() === "cand-9"
        ? "Great debugging demonstration. Clear systematic approach (metrics, logging, optimization execution)."
        : "Vague debugging methodology. Lacked details about specific monitoring tools or database optimization mechanics."
    },
    {
      question: "How do you optimize the performance of a React application with a large dataset rendering dynamically?",
      answer: candidate.id.toString() === "cand-9"
        ? "Adopted list windowing via react-window to render only the visible viewport. Implemented memoization hooks, dynamic import boundaries, and debounced heavy handlers to minimize render blocking."
        : "I use lazy loading, pagination, and React memo to avoid rendering everything at once on the page.",
      score: candidate.id.toString() === "cand-9" ? 92 : 75,
      feedback: candidate.id.toString() === "cand-9"
        ? "Highly proficient. Shows active experience deploying layout optimization tools for scalable feeds."
        : "Recognized core concepts (pagination, memo) but did not mention virtual lists or thread rendering bottlenecks."
    }
  ]

  const mockQA = report ? report.qaBreakdown : fallbackQA

  // Executive AI Summary comment
  const getAISummary = () => {
    if (candidate.interviewStatus === "Suspended") {
      return `WARNING: This candidate's session was automatically suspended due to severe proctoring violations. A mobile device was detected in hand, alongside multiple instances of tab-switching. The final score is not representative of their skills. Recommend disqualification.`
    }
    
    if (calculatedFinalScore >= 85) {
      return `${candidate.name} demonstrated top-tier engineering talent. Technical solutions to Next.js architectural boundaries and database optimizations were precise and well-reasoned. In behavioral questions, communication and agile alignment were clear. Strongly recommend moving to the final executive round.`
    }
    
    if (calculatedFinalScore >= 75) {
      return `The candidate displays strong fundamental knowledge. Answers to optimization and layout rendering were accurate, though she would benefit from deeper familiarity with advanced web rendering mechanisms. Communications were clear and professional. Suitable for a mid-level development role.`
    }

    return `The candidate has basic understanding but struggles with advanced technical concepts. Performance optimizations and database batching questions lacked detail. Behavioral answers were adequate but generic. Recommend looking at other applicants.`
  }

  const aiSummary = report ? report.aiSummary : getAISummary()

  return (
    <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
      
      {/* Back & Actions Navigation Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-muted-text hover:text-foreground cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports List
        </button>

        <div className="flex flex-wrap gap-2.5">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-accent px-3 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer dark:bg-slate-900">
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-accent px-3 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer dark:bg-slate-900">
            <Send className="h-3.5 w-3.5" />
            Send to Team
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card text-brand-danger hover:bg-rose-50 dark:hover:bg-rose-950/20 px-3 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer dark:bg-slate-900">
            <Archive className="h-3.5 w-3.5" />
            Archive
          </button>
        </div>
      </div>

      {/* Main Report Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Score card and breakdowns (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Score Gauge and details */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm text-center flex flex-col items-center space-y-4 dark:bg-slate-900">
            
            <div>
              <p className="text-xs font-bold text-brand-muted-text uppercase tracking-wider">Candidate Scorecard</p>
              <h2 className="text-xl font-extrabold tracking-tight mt-1">{candidate.name}</h2>
              <p className="text-xs text-brand-muted-text">{candidate.role}</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative h-28 w-28 flex items-center justify-center">
              <svg className="h-full w-full -rotate-90">
                <circle
                  className="stroke-slate-100 dark:stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                  r={radius}
                  cx="56"
                  cy="56"
                />
                <circle
                  className={cn(
                    "transition-all duration-500",
                    recommendation === "recommend" && "stroke-emerald-500",
                    recommendation === "borderline" && "stroke-amber-500",
                    recommendation === "do_not_hire" && "stroke-rose-500"
                  )}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  r={radius}
                  cx="56"
                  cy="56"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">{calculatedFinalScore}%</span>
                <span className="text-[9px] text-brand-muted-text font-bold uppercase tracking-wider">Final Grade</span>
              </div>
            </div>

            {/* Recommendation Badge */}
            <div className="w-full pt-2">
              {recommendation === "recommend" && (
                <span className="inline-flex items-center gap-1.5 justify-center w-full rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/30 py-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-4 w-4 fill-emerald-100 dark:fill-emerald-950" />
                  RECOMMEND HIRE
                </span>
              )}
              {recommendation === "borderline" && (
                <span className="inline-flex items-center gap-1.5 justify-center w-full rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/30 py-2 text-xs font-black text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 fill-amber-100 dark:fill-amber-950" />
                  BORDERLINE FIT
                </span>
              )}
              {recommendation === "do_not_hire" && (
                <span className="inline-flex items-center gap-1.5 justify-center w-full rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/30 py-2 text-xs font-black text-brand-danger">
                  <XCircle className="h-4 w-4 fill-rose-100 dark:fill-rose-950" />
                  DO NOT HIRE
                </span>
              )}
            </div>

            {/* Contact details list */}
            <div className="w-full text-left text-xs border-t border-border/40 pt-4 space-y-2 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span className="font-semibold text-brand-muted-text">Email:</span>
                <span className="font-bold truncate max-w-[170px]">{candidate.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-brand-muted-text">Phone:</span>
                <span className="font-bold">{candidate.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-brand-muted-text">Applied:</span>
                <span className="font-bold">{candidate.date}</span>
              </div>
            </div>

          </div>

          {/* Card 2: Proctoring Security panel */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2">
              <Shield className="h-4 w-4" /> Proctoring & Integrity
            </h3>

            {/* Integrity Badge */}
            <div className={cn("p-3 rounded-lg border flex items-center justify-between text-xs font-bold", proctorStatus.color)}>
              <span>Overall Integrity:</span>
              <span className="flex items-center gap-1">
                {proctorStatus.integrity === "Clean" && <CheckCircle2 className="h-3.5 w-3.5" />}
                {proctorStatus.integrity === "Minor Violations" && <AlertTriangle className="h-3.5 w-3.5" />}
                {proctorStatus.integrity === "Suspended" && <AlertOctagon className="h-3.5 w-3.5" />}
                {proctorStatus.integrity}
              </span>
            </div>

            {/* Security log timeline */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider">Violation Log</p>
              
              <div className="space-y-2.5">
                {proctorStatus.logs.map((log, index) => (
                  <div key={index} className="flex gap-2.5 items-start text-[11px] leading-relaxed">
                    <span className="font-mono text-brand-muted-text bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[10px] select-none">
                      {log.time}
                    </span>
                    <span className={cn(
                      log.type === "critical" && "text-rose-500 font-bold",
                      log.type === "alert" && "text-rose-500 font-semibold",
                      log.type === "warning" && "text-amber-500 font-medium",
                      log.type === "system" && "text-slate-500 font-bold",
                      log.type === "info" && "text-emerald-500"
                    )}>
                      {log.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Side: Score breakdowns, Q&A table, executive summary (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Score breakdown progress bars */}
          <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-5 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2">
              <Award className="h-4 w-4" /> Assessment Score Breakdown
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Resume Match */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Resume Match Score</span>
                  <span className="text-brand-primary">{resumeScore}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-primary rounded-full" style={{ width: `${resumeScore}%` }} />
                </div>
              </div>

              {/* Technical Grade */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">AI Technical Competence</span>
                  <span className="text-purple-600 dark:text-purple-400">{technicalGrade}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${technicalGrade}%` }} />
                </div>
              </div>

              {/* Behavioral Grade */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Communication & Behavioral</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{behavioralGrade}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${behavioralGrade}%` }} />
                </div>
              </div>

              {/* Weighted calculation */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">Final Weighted Assessment</span>
                  <span className="text-amber-500">{calculatedFinalScore}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${calculatedFinalScore}%` }} />
                </div>
              </div>
            </div>

            {/* Formula note */}
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-border text-[10px] text-brand-muted-text flex items-center gap-1.5 font-bold">
              <Percent className="h-3.5 w-3.5 text-brand-primary" />
              <span>Weight Formula: Final = (Resume × 0.3) + (Technical × 0.5) + (Behavioral × 0.2)</span>
            </div>

          </div>

          {/* Section 2: AI Executive Summary */}
          <div className="rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2">
              <Bot className="h-4.5 w-4.5 text-brand-primary" /> AI Executive Summary
            </h3>

            <div className="p-4 bg-brand-primary-bg/50 dark:bg-slate-950 border border-brand-primary/10 rounded-xl text-xs md:text-sm leading-relaxed space-y-2">
              <p className="text-slate-700 dark:text-slate-300 italic">
                "{aiSummary}"
              </p>
            </div>
          </div>

          {/* Section 3: Expandable Question Breakdown Table */}
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden dark:bg-slate-900">
            <div className="p-5 border-b border-border/40 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-brand-muted-text" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text">
                Question-by-Question Breakdown
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/75 dark:bg-slate-800/40 text-brand-muted-text font-bold border-b border-border/40">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3 max-w-[200px]">Question</th>
                    <th className="p-3 max-w-[200px] hidden sm:table-cell">Answer Summary</th>
                    <th className="p-3 w-20 text-center">Score</th>
                    <th className="p-3 w-20 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mockQA.map((qa, index) => {
                    const isExpanded = expandedRow === index
                    return (
                      <React.Fragment key={index}>
                        {/* Summary Row */}
                        <tr 
                          onClick={() => setExpandedRow(isExpanded ? null : index)}
                          className={cn(
                            "border-b border-border/30 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors",
                            index % 2 === 1 ? "bg-slate-50/30 dark:bg-slate-800/10" : ""
                          )}
                        >
                          <td className="p-3 font-semibold text-center text-brand-muted-text">{index + 1}</td>
                          <td className="p-3 font-bold truncate max-w-[200px]">{qa.question}</td>
                          <td className="p-3 text-brand-muted-text truncate max-w-[200px] hidden sm:table-cell">{qa.answer}</td>
                          <td className="p-3 text-center font-extrabold text-brand-primary">{qa.score}%</td>
                          <td className="p-3 text-center">
                            <button className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-brand-muted-text">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Detail Content Row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/40 dark:bg-slate-950/40 border-b border-border/30">
                            <td colSpan={5} className="p-4 space-y-3.5">
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider block">Full Candidate Answer:</span>
                                <p className="bg-white dark:bg-slate-900 border border-border/80 p-3 rounded-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                  {qa.answer}
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider block flex items-center gap-1">
                                  <Bot className="h-3.5 w-3.5" /> AI Evaluation Feedback:
                                </span>
                                <div className="bg-brand-primary-bg/30 dark:bg-slate-900 border border-brand-primary/10 p-3 rounded-lg text-slate-700 dark:text-slate-300">
                                  {qa.feedback}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
