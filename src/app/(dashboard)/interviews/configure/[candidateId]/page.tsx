"use client"

import React, { useState, useEffect, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, ApiCandidate, ApiJob } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MOCK_JOBS,
  MOCK_CANDIDATES
} from "@/lib/mock-data"
import {
  ChevronRight,
  Sparkles,
  Shield,
  Trash2,
  Plus,
  Clock,
  Mail,
  ArrowUp,
  ArrowDown,
  Eye,
  Check,
  Send,
  Loader2,
  FileText,
  AlertTriangle,
  FileCheck
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ConfigurePageProps {
  params: Promise<{ candidateId: string }> | { candidateId: string }
}

interface QuestionItem {
  id: string
  text: string
  type: "Technical" | "Behavioral" | "Situational"
}

export default function ConfigureInterviewPage({ params }: ConfigurePageProps) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const candidateId = resolvedParams?.candidateId

  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch candidates and jobs list via react-query
  const { data: candidates = [], isLoading: isCandidatesLoading, isError: isCandidatesError } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => api.getCandidates(),
    retry: false
  })

  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
    retry: false
  })

  // Find target candidate and associated job (no mock fallbacks)
  const candidate = candidates.find(c => c.id.toString() === candidateId?.toString())
  const job = jobs.find(j => j.id.toString() === candidate?.jobId.toString())

  // Page States
  const [questions, setQuestions] = useState<QuestionItem[]>([])
  const [isLoadingAI, setIsLoadingAI] = useState(true)
  const [timeLimit, setTimeLimit] = useState(15) // Minutes per question
  const [proctoringEnabled, setProctoringEnabled] = useState(true)
  const [candidateEmail, setCandidateEmail] = useState("")
  
  // Modal / Confirm States
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Sync candidate email when candidate is loaded
  useEffect(() => {
    if (candidate) {
      setCandidateEmail(candidate.email || "")
    }
  }, [candidate])

  // Load questions from Flask API
  useEffect(() => {
    if (!candidate) return

    setIsLoadingAI(true)
    api.generateQuestions(candidate.id)
      .then((data) => {
        const formatted: QuestionItem[] = data.map((qText, idx) => ({
          id: `q${idx + 1}`,
          text: qText,
          type: idx % 2 === 0 ? "Technical" : "Behavioral"
        }))
        setQuestions(formatted)
      })
      .catch((err) => {
        toast.error("Failed to generate AI questions. Using fallback questions.")
        setQuestions([
          { id: "q1", text: "Tell us about your experience alignment for this role.", type: "Technical" },
          { id: "q2", text: "Describe a challenging problem you solved recently.", type: "Technical" },
          { id: "q3", text: "How do you handle disagreement in technical designs?", type: "Behavioral" }
        ])
      })
      .finally(() => {
        setIsLoadingAI(false)
      })
  }, [candidateId, candidate])


  // Question manipulation handlers
  const handleAddQuestion = () => {
    const newId = `q-new-${Date.now()}`
    setQuestions([
      ...questions,
      { id: newId, text: "", type: "Technical" }
    ])
  }

  const handleQuestionTextChange = (id: string, text: string) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, text } : q)
    )
  }

  const handleQuestionTypeChange = (id: string, type: QuestionItem["type"]) => {
    setQuestions(prev =>
      prev.map(q => q.id === id ? { ...q, type } : q)
    )
  }

  const handleDeleteQuestion = (id: string) => {
    if (questions.length <= 3) {
      toast.warning("A minimum of 3 questions is required for screening.")
      return
    }
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const moveQuestionUp = (index: number) => {
    if (index === 0) return
    const updated = [...questions]
    const temp = updated[index]
    updated[index] = updated[index - 1]
    updated[index - 1] = temp
    setQuestions(updated)
  }

  const moveQuestionDown = (index: number) => {
    if (index === questions.length - 1) return
    const updated = [...questions]
    const temp = updated[index]
    updated[index] = updated[index + 1]
    updated[index + 1] = temp
    setQuestions(updated)
  }

  // Email Validation
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidateEmail)
  const isSendDisabled = questions.length < 3 || !isEmailValid

  const handleConfirmSend = async () => {
    if (!candidate) return
    setIsSending(true)

    const filteredQuestionTexts = questions.map(q => q.text.trim()).filter(Boolean)

    try {
      // Call create interview API
      await api.createInterview(candidate.id, {
        time_limit: timeLimit,
        questions: filteredQuestionTexts,
        candidate_email: candidateEmail
      })

      // Update stage to "Interview"
      await api.moveCandidateStage(candidate.id, "Interview")

      // Invalidate queries so candidates load correctly
      queryClient.invalidateQueries({ queryKey: ["candidates"] })
      queryClient.invalidateQueries({ queryKey: ["jobs"] })

      toast.success(`Invite sent to ${candidateEmail}!`)
      
      // Navigate back to referring Job Detail page
      router.push(`/jobs/${candidate.jobId}`)
    } catch (error: any) {
      console.error("Failed to send invitation:", error)
      toast.error(error.message || "Failed to configure interview invitation.")
    } finally {
      setIsSending(false)
      setIsConfirmOpen(false)
    }
  }


  if (isCandidatesLoading || !candidate) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-96" />
        </div>
        <Skeleton className="h-[180px] w-full rounded-xl" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  // Email Template body for Preview Modal
  const getEmailBody = () => {
    return `Subject: AI Interview Invitation - ${job?.title || candidate.role} Role

Dear ${candidate.name},

Thank you for your application for the ${job?.title || candidate.role} position at HireBox. We were highly impressed by your credentials and resume match score of ${candidate.score}%.

We would like to invite you to participate in an AI-proctored online screening exam.

Details of the interview:
- Total Questions: ${questions.length} questions
- Time Limit: ${timeLimit} minutes per question
- Proctoring: Enabled (Webcam and environment checks required)

Please access your secure interview link below to begin the assessment:
https://hirebox-ai.vercel.app/interview/start/token-placeholder

Note: This link is unique to you and will remain active for 7 days. Ensure that you have a working camera and a stable connection before starting.

Good luck!

Warm regards,
HireBox Recruitment Team`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 text-slate-900 dark:text-slate-100 p-2 md:p-6 animate-fade-in">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-brand-muted-text">
        <Link href="/jobs" className="hover:text-brand-primary transition-colors">Jobs</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
        <Link href={`/jobs/${candidate.jobId}`} className="hover:text-brand-primary transition-colors truncate max-w-[200px]">
          {job?.title || candidate.role}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600" />
        <span className="text-foreground dark:text-slate-300">Configure Interview — {candidate.name}</span>
      </nav>

      {/* Header title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Configure Interview Invite</h1>
        <p className="text-sm text-brand-muted-text mt-1">Review screening questions, configure proctoring regulations, and send invitation links.</p>
      </div>

      {/* SECTION 1 — Candidate Summary (top, read-only) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 grid gap-6 md:grid-cols-3 items-center">
        
        {/* Name details & avatar */}
        <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 items-center sm:items-start text-center sm:text-left">
          <div className="h-16 w-16 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-black text-xl uppercase dark:bg-brand-card-dark shrink-0 shadow-sm border border-brand-primary/20">
            {candidate.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold">{candidate.name}</h2>
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Applied
              </span>
            </div>
            <p className="text-sm text-brand-muted-text font-medium">{candidate.email} • {candidate.phone || "No phone provided"}</p>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Applied for: <span className="text-brand-primary font-bold">{job?.title || candidate.role}</span>
            </p>
            
            {/* Extracted skills badges */}
            <div className="flex flex-wrap gap-1.5 pt-2 justify-center sm:justify-start">
              {candidate.skills?.map(skill => (
                <span key={skill} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-brand-muted-text">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Match score gauge & resume link */}
        <div className="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-border/50 pt-4 md:pt-0 md:pl-6 space-y-3">
          
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-muted-text">Resume Match Score</span>
          </div>

          <div className="relative h-20 w-20 flex items-center justify-center select-none">
            <svg className="h-full w-full -rotate-90">
              <circle
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="5"
                fill="transparent"
                r="34"
                cx="40"
                cy="40"
              />
              <circle
                className={cn(
                  "transition-all duration-300",
                  candidate.score >= 75 ? "stroke-emerald-500" : candidate.score >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                )}
                strokeWidth="5"
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 - (candidate.score / 100) * (2 * Math.PI * 34)}
                strokeLinecap="round"
                fill="transparent"
                r="34"
                cx="40"
                cy="40"
              />
            </svg>
            <span className={cn(
              "absolute text-base font-black",
              candidate.score >= 75 ? "text-emerald-500" : candidate.score >= 50 ? "text-amber-500" : "text-rose-500"
            )}>
              {candidate.score}%
            </span>
          </div>

          <Link href="#" className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:underline">
            <FileText className="h-3.5 w-3.5" /> View Extracted Resume
          </Link>
        </div>
      </div>

      {/* SECTION 2 — AI-Generated Questions (center, editable) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 space-y-5">
        
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-border/40 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-brand-primary" /> Screening Interview Questions
            </h3>
            <p className="text-xs text-brand-muted-text">Customize the exam flow. Enforce at least 3 screening prompts.</p>
          </div>
          
          <button
            type="button"
            onClick={handleAddQuestion}
            disabled={isLoadingAI}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary-bg dark:bg-brand-card-dark text-brand-primary px-3.5 py-2 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer border border-brand-primary/10"
          >
            <Plus className="h-4 w-4" /> Add Question
          </button>
        </div>

        {/* AI Loading Simulation or Questions list */}
        {isLoadingAI ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs font-bold text-brand-primary animate-pulse py-1">
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> AI is generating custom questions...
              </span>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-border bg-slate-50/50 dark:bg-slate-950/20 p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <Skeleton className="h-5 w-24 rounded-lg" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-14 w-full rounded-lg" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-28 rounded-lg" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={q.id}
                className="rounded-xl border border-border bg-slate-50/50 dark:bg-slate-950/20 p-5 space-y-4 transition-all duration-200 hover:border-brand-primary/20 relative"
              >
                
                {/* Header row of card */}
                <div className="flex justify-between items-center">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Question {index + 1}
                  </span>
                  
                  {/* Select for Question Type */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted-text">Type:</span>
                    <select
                      value={q.type}
                      onChange={(e) => handleQuestionTypeChange(q.id, e.target.value as any)}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-xs font-bold outline-none cursor-pointer dark:bg-slate-800 dark:border-slate-600"
                    >
                      <option value="Technical">Technical</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Situational">Situational</option>
                    </select>
                  </div>
                </div>

                {/* Question Textarea */}
                <div>
                  <textarea
                    value={q.text}
                    onChange={(e) => handleQuestionTextChange(q.id, e.target.value)}
                    placeholder="Describe the screening request..."
                    rows={2}
                    required
                    className="w-full rounded-lg border border-border bg-background p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600 transition-colors"
                  />
                </div>

                {/* Footer Controls: Delete / Reorder */}
                <div className="flex justify-between items-center pt-1">
                  
                  {/* Left Spacer */}
                  <div></div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Reorder Arrows */}
                    <button
                      type="button"
                      onClick={() => moveQuestionUp(index)}
                      disabled={index === 0}
                      className={cn(
                        "p-1.5 rounded-lg border border-border bg-background hover:bg-accent hover:text-foreground cursor-pointer transition-colors",
                        index === 0 ? "opacity-35 cursor-not-allowed" : ""
                      )}
                      title="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => moveQuestionDown(index)}
                      disabled={index === questions.length - 1}
                      className={cn(
                        "p-1.5 rounded-lg border border-border bg-background hover:bg-accent hover:text-foreground cursor-pointer transition-colors",
                        index === questions.length - 1 ? "opacity-35 cursor-not-allowed" : ""
                      )}
                      title="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>

                    <div className="w-px h-5 bg-border/60 mx-1" />

                    {/* Delete trigger */}
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="p-1.5 text-brand-muted-text hover:text-brand-danger hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg cursor-pointer transition-colors"
                      title="Delete Question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {/* Questions count info strip */}
            <div className="flex justify-between items-center text-xs font-semibold text-brand-muted-text px-1">
              <span>Total Active Questions: <strong className="text-foreground">{questions.length}</strong></span>
              {questions.length < 3 && (
                <span className="text-brand-danger flex items-center gap-1 font-bold">
                  <AlertTriangle className="h-3.5 w-3.5" /> Minimum 3 questions required (Need {3 - questions.length} more)
                </span>
              )}
            </div>
          </div>
        )}

      </div>

      {/* SECTION 3 — Interview Settings + Send (bottom) */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 space-y-6">
        <h3 className="text-base font-extrabold flex items-center gap-2 border-b border-border/40 pb-3">
          <Shield className="h-4.5 w-4.5 text-emerald-500" /> Exam Regulations & Dispatch
        </h3>

        {/* Grid settings row */}
        <div className="grid gap-6 sm:grid-cols-3">
          
          {/* Time limit select */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-brand-muted-text flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-brand-primary" /> Time Limit Per Question
            </label>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
            </select>
          </div>

          {/* Proctoring toggle */}
          <div className="space-y-1.5 flex flex-col justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-muted-text flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-brand-primary" /> Environment Proctoring
            </span>
            <div className="flex items-center gap-3 py-1.5">
              <button
                type="button"
                onClick={() => setProctoringEnabled(!proctoringEnabled)}
                className={cn(
                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-brand-primary",
                  proctoringEnabled ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"
                )}
              >
                <span
                  className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    proctoringEnabled ? "translate-x-5" : "translate-x-0"
                  )}
                />
              </button>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {proctoringEnabled ? "Webcam validation active" : "Webcam checks disabled"}
              </span>
            </div>
          </div>

          {/* Candidate email override input */}
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold uppercase tracking-wider text-brand-muted-text flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-brand-primary" /> Candidate Recipient Email
            </label>
            <input
              type="email"
              value={candidateEmail}
              onChange={(e) => setCandidateEmail(e.target.value)}
              placeholder="candidate@example.com"
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none transition-colors dark:bg-slate-800 dark:border-slate-600 font-semibold",
                candidateEmail && !isEmailValid ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500" : "border-border focus:border-brand-primary"
              )}
            />
            {candidateEmail && !isEmailValid && (
              <span className="text-[10px] text-brand-danger font-bold">Please specify a valid email address layout.</span>
            )}
          </div>

        </div>

        {/* Buttons footer */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40 justify-end items-stretch">
          
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-xs font-bold hover:bg-accent hover:text-foreground cursor-pointer transition-colors shadow-sm"
          >
            <Eye className="h-4 w-4" /> Preview Invite Email
          </button>

          <button
            type="button"
            disabled={isSendDisabled}
            onClick={() => setIsConfirmOpen(true)}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-xs font-bold transition-all shadow-md select-none",
              isSendDisabled
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
                : "bg-brand-primary text-white hover:bg-brand-primary/95 active:scale-[0.98] cursor-pointer"
            )}
          >
            <Send className="h-4 w-4" /> Send Interview Invite
          </button>

        </div>
      </div>

      {/* MODAL 1: PREVIEW INVITE EMAIL */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 border border-border p-6 rounded-xl flex flex-col max-h-[85vh]">
          <DialogHeader className="border-b border-border/40 pb-3">
            <DialogTitle className="text-sm font-bold uppercase tracking-wider text-brand-muted-text">
              Email Notification Template
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <div className="rounded-lg border border-border bg-slate-50 dark:bg-slate-950 p-4.5 font-mono text-[11px] leading-relaxed text-brand-muted-text whitespace-pre-wrap select-text">
              {getEmailBody()}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-border/40">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:opacity-90 cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: CONFIRM & SEND SCHEDULER */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="w-full sm:max-w-md bg-white dark:bg-slate-900 border border-border p-6 rounded-xl">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              Confirm & Send Invite
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 text-sm text-slate-700 dark:text-slate-300">
            <p>
              Send interview invite to <strong className="text-foreground">{candidate.name}</strong> at <strong className="text-foreground">{candidateEmail}</strong>?
            </p>
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs font-medium text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/40 dark:text-amber-400">
              The applicant will receive a unique secure exam invitation valid for <strong>7 days</strong>.
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-border/40">
            <button
              onClick={() => setIsConfirmOpen(false)}
              disabled={isSending}
              className="px-4 py-2 rounded-lg text-xs font-bold border border-border bg-card hover:bg-accent cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              onClick={handleConfirmSend}
              disabled={isSending}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-primary text-white hover:bg-brand-primary/95 flex items-center gap-1.5 cursor-pointer"
            >
              {isSending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm & Send
            </button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
