"use client"

import React, { useState, useEffect } from "react"
import { ApiCandidate, api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  X, 
  Trash2, 
  Plus, 
  Sparkles, 
  Clock, 
  Mail, 
  CheckCircle2, 
  Copy, 
  Check, 
  Loader2 
} from "lucide-react"
import { toast } from "sonner"

interface ConfigureInterviewModalProps {
  candidate: ApiCandidate | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function ConfigureInterviewModal({
  candidate,
  open,
  onOpenChange,
  onSuccess,
}: ConfigureInterviewModalProps) {
  const [candidateEmail, setCandidateEmail] = useState("")
  const [timeLimit, setTimeLimit] = useState(30)
  const [questions, setQuestions] = useState<string[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Success states
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [createdLink, setCreatedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Reset states when candidate changes or modal opens
  useEffect(() => {
    if (candidate && open) {
      setCandidateEmail(candidate.email || "")
      setTimeLimit(30)
      setQuestions([])
      setCreatedToken(null)
      setCreatedLink(null)
      setCopied(false)
      loadDefaultOrAIQuestions()
    }
  }, [candidate, open])

  const loadDefaultOrAIQuestions = async () => {
    if (!candidate) return
    setIsLoadingQuestions(true)
    try {
      // Attempt to load from Flask API
      const aiQuestions = await api.generateQuestions(candidate.id)
      if (aiQuestions && aiQuestions.length > 0) {
        setQuestions(aiQuestions)
      } else {
        throw new Error("Empty questions returned")
      }
    } catch (err) {
      console.warn("Using local questions generator (Flask offline or error):", err)
      // Fallback: Generate role-specific mockup questions
      const role = candidate.role?.toLowerCase() || ""
      if (role.includes("devops") || role.includes("systems")) {
        setQuestions([
          "Describe how you manage container orchestration in a multi-region deployment. What are the key failure modes?",
          "How do you automate CI/CD pipelines to ensureZero-Downtime deployments? Explain your roll-back strategy.",
          "What is your approach to handling secrets and configuration variables in infrastructure-as-code scripts (e.g. Terraform)?",
          "Explain a situation where a production service suffered a resource exhaustion crash. How did you identify and prevent it?",
          "How do you monitor container logs and telemetry metrics across a kubernetes cluster?"
        ])
      } else if (role.includes("design") || role.includes("ui") || role.includes("ux")) {
        setQuestions([
          "What is your methodology for establishing and documenting design system tokens in Figma?",
          "Describe a scenario where user testing data conflicted with the client's design request. How did you resolve it?",
          "How do you optimize interactive layout features for mobile layouts vs desktop viewports?",
          "Explain the key principles you focus on when designing for WCAG web accessibility standards.",
          "Walk me through your process of creating wireframes and translating them into interactive high-fidelity prototypes."
        ])
      } else if (role.includes("product") || role.includes("manager")) {
        setQuestions([
          "How do you prioritize your product roadmap when balancing customer requests against engineering debt?",
          "Describe your process for translating user feedback into actionable agile user stories and requirements.",
          "What key metrics do you track on product release feeds to evaluate post-launch success?",
          "Tell me about a time you had to align engineering and marketing teams on a delayed release timeline.",
          "How do you run scrum sprint planning ceremonies to ensure clear deliverables?"
        ])
      } else {
        // Engineering/Default
        setQuestions([
          "Explain the difference between Next.js React Server Components (RSC) and Client Components. When should you use each?",
          "How do you optimize the performance of a React application with a large dataset rendering dynamically?",
          "Describe a challenging database performance bottleneck or slow query you resolved in production.",
          "How do you manage cross-origin request policies (CORS) in a modern web client-server integration?",
          "Tell me about a time you had to align technical debt reduction with product shipping deadlines. How did you communicate with stakeholders?"
        ])
      }
    } finally {
      setIsLoadingQuestions(false)
    }
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, ""])
  }

  const handleQuestionChange = (index: number, val: string) => {
    const updated = [...questions]
    updated[index] = val
    setQuestions(updated)
  }

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) {
      toast.warning("At least one question is required.")
      return
    }
    setQuestions(questions.filter((_, idx) => idx !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!candidate) return

    const filteredQuestions = questions.map(q => q.trim()).filter(Boolean)
    if (filteredQuestions.length === 0) {
      toast.error("Please add at least one question.")
      return
    }

    if (!candidateEmail.trim()) {
      toast.error("Candidate email is required to send invitations.")
      return
    }

    setIsSubmitting(true)
    try {
      // Send configuration to Flask API
      const result = await api.createInterview(candidate.id, {
        time_limit: timeLimit,
        questions: filteredQuestions,
        candidate_email: candidateEmail
      })
      
      if (result && result.token) {
        setCreatedToken(result.token)
        setCreatedLink(result.interviewLink || `${window.location.origin}/interview/${result.token}`)
        toast.success("Interview configured! Link generated.")
      } else {
        throw new Error("No token returned")
      }
    } catch (err: any) {
      console.error("Failed to configure interview invitation:", err)
      toast.error(err.message || "Failed to configure interview invitation.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyLink = () => {
    if (!createdLink) return
    navigator.clipboard.writeText(createdLink)
    setCopied(true)
    toast.success("Secure link copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFinishedClose = () => {
    onOpenChange(false)
    onSuccess() // Refresh page lists
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 border border-border p-6 rounded-xl overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <DialogHeader className="border-b border-border/40 pb-4">
          <DialogTitle className="text-lg font-bold tracking-tight">
            {createdToken ? "Interview Configured!" : `Configure Interview: ${candidate?.name}`}
          </DialogTitle>
        </DialogHeader>

        {createdToken ? (
          /* SUCCESS STATE PANEL */
          <div className="flex-1 overflow-y-auto py-6 flex flex-col items-center justify-center text-center space-y-5 animate-fade-in">
            <div className="h-16 w-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-brand-success flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">Secure Invite Link Generated</h3>
              <p className="text-sm text-brand-muted-text mt-1 max-w-md">
                Share this secure URL with <strong>{candidate?.name}</strong> to initiate the AI proctored screening exam.
              </p>
            </div>

            <div className="w-full max-w-lg flex items-center gap-2 border border-border bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg">
              <input
                type="text"
                value={createdLink || ""}
                readOnly
                className="flex-1 bg-transparent font-mono text-xs text-brand-muted-text border-none focus:outline-none"
              />
              <button
                onClick={copyLink}
                className="shrink-0 p-2 rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            <button
              onClick={handleFinishedClose}
              className="px-5 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
            >
              Back to Candidates Board
            </button>
          </div>
        ) : (
          /* INPUT FORM STATE */
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 flex flex-col space-y-6">
            
            {/* Grid Settings */}
            <div className="grid gap-5 sm:grid-cols-2">
              
              {/* Candidate email input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" /> Candidate Invitation Email
                </label>
                <input
                  type="email"
                  value={candidateEmail}
                  onChange={(e) => setCandidateEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-950 transition-colors"
                />
              </div>

              {/* Time limit selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  min={5}
                  max={180}
                  required
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-950 transition-colors"
                />
              </div>

            </div>

            {/* Questions lists */}
            <div className="space-y-3.5 border-t border-border/40 pt-4 flex-1 flex flex-col">
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-brand-primary" /> Technical Exam Questions
                  </h4>
                  <p className="text-[10px] text-brand-muted-text mt-0.5">AI-suggested questions based on the applicant's resume and job requirements.</p>
                </div>
                
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  disabled={isLoadingQuestions}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline bg-transparent border-none cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Question
                </button>
              </div>

              {isLoadingQuestions ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-brand-muted-text flex-1">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
                  <p className="text-xs font-semibold">Generating candidate screening questions...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 flex-1">
                  {questions.map((q, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <div className="flex-1">
                        <textarea
                          value={q}
                          onChange={(e) => handleQuestionChange(idx, e.target.value)}
                          placeholder="Enter question text..."
                          required
                          rows={2}
                          className="w-full rounded-lg border border-border bg-background p-2.5 text-xs focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-950 transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="p-2 text-brand-muted-text hover:text-brand-danger rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
                        title="Delete question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

            </div>

            {/* Footer Buttons */}
            <div className="border-t border-border/40 pt-4 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-border bg-card hover:bg-accent cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isLoadingQuestions}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm & Generate Link
              </button>
            </div>

          </form>
        )}

      </DialogContent>
    </Dialog>
  )
}
