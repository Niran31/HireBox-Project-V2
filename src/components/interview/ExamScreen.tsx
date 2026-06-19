"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import {
  Mic,
  MicOff,
  Video,
  ArrowRight,
  Shield,
  Clock,
  AlertTriangle,
  AlertOctagon,
  CheckCircle,
  HelpCircle,
  Send
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { cn } from "@/lib/utils"

interface Question {
  id: number
  text: string
  suggestedAnswer?: string[]
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 1,
    text: "Explain the main differences between Next.js React Server Components (RSC) and Client Components. When should you use each?",
    suggestedAnswer: [
      "In Next.js, React Server Components run exclusively on the server, ",
      "which means their dependency packages are not included in the client bundle, ",
      "greatly improving page loading speed and SEO optimization. ",
      "On the other hand, Client Components are rendered and hydrated on the browser, ",
      "allowing developers to add state hooks, event listeners, and browser APIs. ",
      "I recommend using Server Components by default to load data and static UI, ",
      "and opting into Client Components only when user interactivity is required."
    ]
  },
  {
    id: 2,
    text: "Describe a challenging technical bug you encountered in production. How did you diagnose and resolve it?",
    suggestedAnswer: [
      "Last year, our production database experienced sudden CPU spikes, ",
      "causing request latency to increase exponentially. ",
      "I analyzed database slow-query logs and set up APM tracking tools. ",
      "The culprit was an un-indexed query running inside a nested loop. ",
      "To resolve it, I added an index to the foreign key column ",
      "and refactored the fetch logic to query items in a single batch, ",
      "which restored our CPU usage back to normal baseline levels."
    ]
  },
  {
    id: 3,
    text: "How do you optimize the performance of a React application with a large dataset rendering dynamically?",
    suggestedAnswer: [
      "To render large datasets efficiently, I apply windowing techniques ",
      "using libraries like react-window to render only the visible items. ",
      "Additionally, I prevent unnecessary re-renders using React.memo, ",
      "useMemo for expensive calculations, and useCallback for event handlers. ",
      "I also defer loading off-screen content using lazy loading mechanisms ",
      "and throttle scroll event handlers to keep the main thread unblocked."
    ]
  },
  {
    id: 4,
    text: "Describe your experience with CI/CD pipelines and infrastructure-as-code tools like Terraform or AWS.",
    suggestedAnswer: [
      "I routinely construct CI/CD pipelines using GitHub Actions to automate linting, ",
      "type checking, unit tests, and Docker builds on pull requests. ",
      "For cloud infrastructure, I utilize Terraform configurations ",
      "to deploy secure, reproducible VPS clusters on AWS. ",
      "This approach maintains environment parity and prevents config drift."
    ]
  },
  {
    id: 5,
    text: "What is your approach to handling state management in large-scale Next.js applications?",
    suggestedAnswer: [
      "For global state, I prefer lightweight state solutions like Zustand or Jotai. ",
      "For data fetching, I rely on React Query to handle caching, stale state, and refetching. ",
      "I keep UI-state local to components wherever possible to minimize prop drilling, ",
      "and use React Context sparingly to avoid unnecessary full-tree re-renders."
    ]
  },
  {
    id: 6,
    text: "Explain the concept of Web Accessibility (a11y) and how you implement it in frontend development.",
    suggestedAnswer: [
      "Web accessibility ensures web products are fully usable by individuals with disabilities. ",
      "I write semantic HTML, use descriptive aria attributes, ",
      "and ensure focus states are clearly visible for keyboard navigations. ",
      "I regularly check color contrast ratios and test layouts using screen readers."
    ]
  },
  {
    id: 7,
    text: "How do you ensure security best practices are followed in api routing and database transactions?",
    suggestedAnswer: [
      "I ensure database calls use parameterized queries to prevent SQL injections. ",
      "For API routes, I set up rate limiting, sanitize input bodies, ",
      "and enforce role-based JWT auth tokens. ",
      "All sensitive tokens are stored in environment variables, never committed."
    ]
  },
  {
    id: 8,
    text: "Tell us about a time you had a conflict with a teammate or stakeholder. How did you handle it?",
    suggestedAnswer: [
      "In a previous sprint, a designer and I disagreed on code refactoring prioritizations. ",
      "Instead of arguing, I organized a quick sync and listened to their metrics. ",
      "We aligned by comparing user impact and agreed to compromise, ",
      "solving critical visual bugs first and refactoring code in the next sprint."
    ]
  }
]

interface ExamScreenProps {
  candidateName: string
  role: string
  timeLimit: number
  questions?: Question[] | null
  mediaStream: MediaStream | null
  onSubmit: (answers: Record<number, string>, proctorLog?: any[]) => void
}

type FaceStatus = "detected" | "not_visible" | "multiple"
type PhoneStatus = "no_phone" | "detected"
type TabStatus = "focused" | "blurred"

export function ExamScreen({ candidateName, role, timeLimit, questions, mediaStream, onSubmit }: ExamScreenProps) {
  const activeQuestions = questions && questions.length > 0 ? questions : MOCK_QUESTIONS

  // Question navigation states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState("")

  // Timers
  const [globalTimeLeft, setGlobalTimeLeft] = useState(timeLimit * 60)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(120) // 2 min per question

  // Proctor simulation state
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("detected")
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>("no_phone")
  const [tabStatus, setTabStatus] = useState<TabStatus>("focused")
  const [integrity, setIntegrity] = useState<"green" | "yellow" | "red">("green")
  const [violationLog, setViolationLog] = useState<Array<{ time: string; msg: string; severity: "info" | "warn" | "danger" }>>([])

  // Voice recording simulation state
  const [isRecording, setIsRecording] = useState(false)
  const voiceSnippetIndexRef = useRef(0)
  const voiceIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Confirm dialog state
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const currentQuestion = activeQuestions[currentQuestionIndex]

  // Initialize camera stream
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream
    }
  }, [mediaStream])

  // Global timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGlobalTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleForceSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Question-level timer
  useEffect(() => {
    setQuestionTimeLeft(120)
  }, [currentQuestionIndex])

  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion(true)
          return 120
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex])

  const addViolation = useCallback((msg: string, severity: "info" | "warn" | "danger") => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    setViolationLog(prev => [
      { time, msg, severity },
      ...prev.slice(0, 9) // keep last 10
    ])
  }, [])

  // Tab visibility detection (real proctoring)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabStatus("blurred")
        addViolation("Tab switch / minimize detected", "danger")
        setIntegrity("red")
      } else {
        setTabStatus("focused")
      }
    }
    document.addEventListener("visibilitychange", handleVisibility)
    return () => document.removeEventListener("visibilitychange", handleVisibility)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Capture webcam frame and send to Flask API for real proctoring analysis
  useEffect(() => {
    if (!mediaStream) return

    const interval = setInterval(async () => {
      if (!videoRef.current) return

      try {
        const video = videoRef.current
        const canvas = document.createElement("canvas")
        canvas.width = 320
        canvas.height = 240
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const base64Frame = canvas.toDataURL("image/jpeg", 0.6)

          // Get token from URL pathname
          const pathSegments = window.location.pathname.split("/")
          const tokenVal = pathSegments[pathSegments.length - 1]

          const res = await fetch("http://localhost:5000/api/interview/api/monitor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: base64Frame, token: tokenVal })
          })

          if (res.ok) {
            const data = await res.json()
            
            let nextFace: FaceStatus = "detected"
            let nextPhone: PhoneStatus = "no_phone"
            let nextIntegrity: "green" | "yellow" | "red" = "green"

            if (!data.face_detected) {
              nextFace = "not_visible"
              nextIntegrity = "yellow"
              addViolation("Face not visible in webcam feed", "warn")
            } else if (data.multiple_faces) {
              nextFace = "multiple"
              nextIntegrity = "red"
              addViolation("Multiple faces detected in webcam feed", "danger")
            }

            if (data.phone_detected) {
              nextPhone = "detected"
              nextIntegrity = "red"
              addViolation("Mobile phone usage detected by AI monitor", "danger")
            }

            setFaceStatus(nextFace)
            setPhoneStatus(nextPhone)
            
            if (nextIntegrity === "red" || tabStatus === "blurred") {
              setIntegrity("red")
            } else if (nextIntegrity === "yellow") {
              setIntegrity("yellow")
            } else {
              setIntegrity("green")
            }
          }
        }
      } catch (err) {
        console.error("Frame monitoring send error:", err)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [mediaStream, tabStatus, addViolation])




  // Voice recording transcriber simulation
  const toggleRecording = () => {
    if (isRecording) {
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current)
      setIsRecording(false)
    } else {
      setIsRecording(true)
      voiceSnippetIndexRef.current = 0

      const snippets = currentQuestion.suggestedAnswer
      if (!snippets || snippets.length === 0) {
        // No suggested answer — just toggle a "recording" indicator
        setTimeout(() => setIsRecording(false), 3000)
        return
      }

      voiceIntervalRef.current = setInterval(() => {
        if (voiceSnippetIndexRef.current < snippets.length) {
          const nextSnippet = snippets[voiceSnippetIndexRef.current]
          setCurrentAnswer(prev => prev + nextSnippet)
          voiceSnippetIndexRef.current += 1
        } else {
          if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current)
          setIsRecording(false)
        }
      }, 1200)
    }
  }

  // Cleanup voice interval
  useEffect(() => {
    return () => {
      if (voiceIntervalRef.current) clearInterval(voiceIntervalRef.current)
    }
  }, [])

  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value)
  }

  const handleNextQuestion = useCallback((timerExpired = false) => {
    // Stop recording if active
    if (voiceIntervalRef.current) {
      clearInterval(voiceIntervalRef.current)
      setIsRecording(false)
    }

    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer || (timerExpired ? "[No Answer — Timer Expired]" : "")
    }
    setAnswers(updatedAnswers)

    if (currentQuestionIndex < activeQuestions.length - 1) {
      const nextIdx = currentQuestionIndex + 1
      setCurrentQuestionIndex(nextIdx)
      setCurrentAnswer(updatedAnswers[activeQuestions[nextIdx].id] || "")
    } else {
      // Final question — trigger confirm dialog
      setShowConfirmSubmit(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, currentAnswer, currentQuestion, currentQuestionIndex, activeQuestions])

  const handleConfirmSubmit = () => {
    setShowConfirmSubmit(false)
    const finalAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer || ""
    }
    onSubmit(finalAnswers, violationLog.map(v => ({ time: v.time, event: v.msg, type: v.severity })))
  }

  const handleForceSubmit = () => {
    const finalAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer || "[No Answer — Time Expired]"
    }
    onSubmit(finalAnswers, violationLog.map(v => ({ time: v.time, event: v.msg, type: v.severity })))
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const isTimeCritical = globalTimeLeft < 60
  const isQuestionTimeCritical = questionTimeLeft < 30
  const isLastQuestion = currentQuestionIndex === activeQuestions.length - 1
  const progressPercentage = ((currentQuestionIndex + 1) / activeQuestions.length) * 100

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">

      {/* Sticky Exam Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-lg border-b border-border/60 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
            H
          </div>
          <span className="font-sans font-bold tracking-tight text-sm hidden sm:inline">
            Hire<span className="text-brand-primary">Box</span>
          </span>
          <span className="text-[9px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-bold px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/30 uppercase tracking-wider">
            Exam Live
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Candidate name */}
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold leading-none">{candidateName}</p>
            <p className="text-[10px] text-brand-muted-text font-medium">{role}</p>
          </div>

          {/* Global timer */}
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-extrabold shadow-sm",
            isTimeCritical
              ? "bg-rose-50 dark:bg-rose-950/30 text-brand-danger border-rose-200 dark:border-rose-900/30 animate-pulse"
              : "bg-slate-100 dark:bg-slate-800 text-foreground border-border"
          )}>
            <Clock className="h-3.5 w-3.5 shrink-0" />
            <span>{formatTime(globalTimeLeft)}</span>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid md:grid-cols-12 gap-5">

        {/* === LEFT COLUMN: Question & Answer (8 cols) === */}
        <div className="md:col-span-8 flex flex-col gap-5">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-5 flex-1 flex flex-col">

            {/* Progress bar and counters */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-brand-primary uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {activeQuestions.length}
                </span>
                <span className={cn(
                  "flex items-center gap-1",
                  isQuestionTimeCritical ? "text-brand-danger animate-pulse" : "text-brand-muted-text"
                )}>
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(questionTimeLeft)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-brand-primary h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>

              {/* Question number pills */}
              <div className="flex gap-1 flex-wrap pt-1">
                {activeQuestions.map((q, i) => (
                  <span
                    key={q.id}
                    className={cn(
                      "h-6 w-6 flex items-center justify-center rounded-md text-[10px] font-bold transition-all",
                      i === currentQuestionIndex
                        ? "bg-brand-primary text-white shadow-sm"
                        : i < currentQuestionIndex
                          ? "bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30"
                          : "bg-slate-100 dark:bg-slate-800 text-brand-muted-text border border-border"
                    )}
                  >
                    {i < currentQuestionIndex ? "✓" : i + 1}
                  </span>
                ))}
              </div>
            </div>

            {/* Question text */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary-bg dark:bg-brand-primary/10 px-2.5 py-0.5 rounded">
                <HelpCircle className="h-3 w-3" /> Technical Question
              </span>
              <h1 className="text-lg md:text-xl font-bold tracking-tight leading-snug">
                {currentQuestion.text}
              </h1>
            </div>

            {/* Answer textarea */}
            <div className="space-y-2 flex-1 flex flex-col">
              <div className="flex justify-between text-xs font-bold text-brand-muted-text">
                <label htmlFor="answer-input">Your Response</label>
                <span>{currentAnswer.length} / 2000</span>
              </div>

              <div className="relative flex-1">
                <textarea
                  id="answer-input"
                  rows={8}
                  maxLength={2000}
                  value={currentAnswer}
                  onChange={handleAnswerChange}
                  placeholder="Type your detailed answer here... or use Voice Dictate below to simulate spoken answers."
                  className="w-full h-full min-h-[200px] rounded-xl border border-border bg-background p-4 text-sm leading-relaxed focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none shadow-inner transition-colors"
                />

                {/* Voice recording overlay */}
                {isRecording && (
                  <div className="absolute inset-0 bg-white/40 dark:bg-slate-950/40 backdrop-blur-[1px] pointer-events-none rounded-xl flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-brand-danger/30 shadow-lg flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-danger animate-ping" />
                      <span className="text-xs font-bold text-brand-danger">Transcribing speech...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls: Voice & Next */}
            <div className="flex justify-between items-center pt-1">
              <button
                type="button"
                onClick={toggleRecording}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-bold shadow-sm transition-all cursor-pointer",
                  isRecording
                    ? "bg-rose-500 hover:bg-rose-600 text-white border-rose-600 animate-pulse"
                    : "bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-border"
                )}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop" : "Voice Dictate"}
              </button>

              <button
                onClick={() => handleNextQuestion(false)}
                disabled={!currentAnswer.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                {isLastQuestion ? (
                  <>Submit Interview <Send className="h-4 w-4" /></>
                ) : (
                  <>Next Question <ArrowRight className="h-4 w-4" /></>
                )}
              </button>
            </div>
          </div>

          {/* Security notice bar */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Proctoring Active</strong> — Tab switches, screen changes, and multiple faces trigger security flags. Stay on this tab.
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN: Proctor Panel (4 cols) === */}
        <div className="md:col-span-4 space-y-5 order-first md:order-last">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-4 shadow-sm space-y-4 sticky top-20">

            {/* Panel header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/40">
              <h2 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1.5">
                <Video className="h-4 w-4" /> Proctor Feed
              </h2>
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  integrity === "green" && "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]",
                  integrity === "yellow" && "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.55)]",
                  integrity === "red" && "bg-rose-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {integrity === "green" && "Good"}
                  {integrity === "yellow" && "Warning"}
                  {integrity === "red" && "Alert"}
                </span>
              </div>
            </div>

            {/* Webcam */}
            <div className={cn(
              "relative w-full aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-950 overflow-hidden transition-all duration-300 border-2",
              integrity === "green" && "border-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
              integrity === "yellow" && "border-amber-500/80 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
              integrity === "red" && "border-rose-500/80 shadow-[0_0_8px_rgba(239,68,68,0.5)] animate-pulse"
            )}>
              {mediaStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-brand-danger p-3">
                  <AlertTriangle className="h-8 w-8 stroke-1 animate-pulse" />
                  <p className="text-xs font-bold mt-1">No Camera</p>
                </div>
              )}
              {/* Scan line */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/5 to-transparent pointer-events-none animate-pulse" />
            </div>

            {/* Detection indicators */}
            <div className="space-y-2">
              {/* Face */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs bg-slate-50/50 dark:bg-slate-900/40">
                <span className="font-semibold text-brand-muted-text">Face Tracker</span>
                {faceStatus === "detected" && (
                  <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded text-[10px]">
                    Detected ✓
                  </span>
                )}
                {faceStatus === "not_visible" && (
                  <span className="text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/30 px-2 py-0.5 rounded text-[10px] animate-pulse">
                    Not Visible ⚠
                  </span>
                )}
                {faceStatus === "multiple" && (
                  <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 px-2 py-0.5 rounded text-[10px] animate-bounce">
                    Multiple ✗
                  </span>
                )}
              </div>

              {/* Device */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs bg-slate-50/50 dark:bg-slate-900/40">
                <span className="font-semibold text-brand-muted-text">Device Monitor</span>
                {phoneStatus === "no_phone" ? (
                  <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded text-[10px]">
                    Clear ✓
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 px-2 py-0.5 rounded text-[10px] animate-bounce">
                    Phone ✗
                  </span>
                )}
              </div>

              {/* Tab focus */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs bg-slate-50/50 dark:bg-slate-900/40">
                <span className="font-semibold text-brand-muted-text">Tab Focus</span>
                {tabStatus === "focused" ? (
                  <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 px-2 py-0.5 rounded text-[10px]">
                    Focused ✓
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/30 px-2 py-0.5 rounded text-[10px] animate-pulse">
                    Switched ✗
                  </span>
                )}
              </div>
            </div>

            {/* Live Security Logs */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-brand-muted-text">
                Security Log
              </h3>
              <div className="min-h-[80px] max-h-[110px] overflow-y-auto border border-border rounded-lg p-2 bg-slate-50 dark:bg-slate-950 text-[10px] font-mono space-y-1 scrollbar-thin">
                {violationLog.length === 0 ? (
                  <p className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> No events logged
                  </p>
                ) : (
                  violationLog.map((log, index) => (
                    <p
                      key={index}
                      className={cn(
                        "flex items-start gap-1 leading-snug",
                        log.severity === "danger" ? "text-rose-500 font-bold" : "text-amber-500 font-semibold"
                      )}
                    >
                      {log.severity === "danger"
                        ? <AlertOctagon className="h-3 w-3 mt-0.5 shrink-0" />
                        : <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
                      }
                      <span>[{log.time}] {log.msg}</span>
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Submit Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="h-12 w-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
                <Send className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-extrabold tracking-tight">Submit Interview?</h2>
              <p className="text-xs text-brand-muted-text">
                You have answered {Object.keys(answers).length + (currentAnswer.trim() ? 1 : 0)} of {activeQuestions.length} questions. This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-border text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 px-4 py-2.5 rounded-lg bg-brand-primary text-white text-xs font-bold shadow hover:bg-brand-primary/90 transition-colors cursor-pointer"
              >
                Confirm Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
