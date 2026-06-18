"use client"

import React, { useState, useEffect, useRef } from "react"
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
  Bot
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { cn } from "@/lib/utils"

interface Question {
  id: number
  text: string
  suggestedAnswer: string[] // snippet-by-snippet for voice simulation
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
  timeLimit: number // in minutes
  mediaStream: MediaStream | null
  onSubmit: (answers: Record<number, string>) => void
}

type FaceStatus = "detected" | "not_visible" | "multiple"
type PhoneStatus = "no_phone" | "detected"

export function ExamScreen({ candidateName, role, timeLimit, mediaStream, onSubmit }: ExamScreenProps) {
  // Question navigation states
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState("")
  
  // Timers
  const [globalTimeLeft, setGlobalTimeLeft] = useState(timeLimit * 60)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(120) // 2 minutes per question
  
  // Proctor simulation state
  const [faceStatus, setFaceStatus] = useState<FaceStatus>("detected")
  const [phoneStatus, setPhoneStatus] = useState<PhoneStatus>("no_phone")
  const [integrity, setIntegrity] = useState<"green" | "yellow" | "red">("green")
  const [violationLog, setViolationLog] = useState<string[]>([])

  // Voice recording simulation state
  const [isRecording, setIsRecording] = useState(false)
  const voiceSnippetIndexRef = useRef(0)
  const voiceIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const currentQuestion = MOCK_QUESTIONS[currentQuestionIndex]

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
  }, [])

  // Question-level timer
  useEffect(() => {
    // Reset question timer when changing question
    setQuestionTimeLeft(120)
  }, [currentQuestionIndex])

  useEffect(() => {
    const timer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion(true) // force next
          return 120
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [currentQuestionIndex])

  // Proctor simulation every 3 seconds
  useEffect(() => {
    const proctorInterval = setInterval(() => {
      const rand = Math.random()
      
      let nextFace: FaceStatus = "detected"
      let nextPhone: PhoneStatus = "no_phone"
      let nextIntegrity: "green" | "yellow" | "red" = "green"
      let logMsg = ""

      if (rand < 0.08) {
        nextFace = "not_visible"
        nextIntegrity = "yellow"
        logMsg = "Face not visible in frame"
      } else if (rand >= 0.08 && rand < 0.12) {
        nextFace = "multiple"
        nextIntegrity = "red"
        logMsg = "Multiple people detected in feed"
      } else if (rand >= 0.12 && rand < 0.16) {
        nextPhone = "detected"
        nextIntegrity = "red"
        logMsg = "Unauthorized device detected"
      }

      setFaceStatus(nextFace)
      setPhoneStatus(nextPhone)
      setIntegrity(nextIntegrity)
      
      if (logMsg) {
        setViolationLog(prev => [
          `[${new Date().toLocaleTimeString()}] Warning: ${logMsg}`,
          ...prev.slice(0, 4) // keep last 5
        ])
      }
    }, 3000)

    return () => clearInterval(proctorInterval)
  }, [])

  // Voice recording transcriber simulation
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current)
      }
      setIsRecording(false)
    } else {
      // Start recording
      setIsRecording(true)
      voiceSnippetIndexRef.current = 0
      
      const snippets = currentQuestion.suggestedAnswer
      
      voiceIntervalRef.current = setInterval(() => {
        if (voiceSnippetIndexRef.current < snippets.length) {
          const nextSnippet = snippets[voiceSnippetIndexRef.current]
          setCurrentAnswer(prev => prev + nextSnippet)
          voiceSnippetIndexRef.current += 1
        } else {
          // Finished all snippets, stop recording
          if (voiceIntervalRef.current) {
            clearInterval(voiceIntervalRef.current)
          }
          setIsRecording(false)
        }
      }, 1500)
    }
  }

  // Cleanup voice interval
  useEffect(() => {
    return () => {
      if (voiceIntervalRef.current) {
        clearInterval(voiceIntervalRef.current)
      }
    }
  }, [])

  // Update text state when answer updates
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentAnswer(e.target.value)
  }

  const handleNextQuestion = (timerExpired = false) => {
    // Stop recording if active
    if (isRecording && voiceIntervalRef.current) {
      clearInterval(voiceIntervalRef.current)
      setIsRecording(false)
    }

    // Save current answer
    const updatedAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer || (timerExpired ? "[No Answer - Timer Expired]" : "")
    }
    setAnswers(updatedAnswers)

    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      // Load next answer if exists
      setCurrentAnswer(answers[MOCK_QUESTIONS[currentQuestionIndex + 1].id] || "")
    } else {
      // Final question submit
      onSubmit(updatedAnswers)
    }
  }

  const handleForceSubmit = () => {
    const finalAnswers = {
      ...answers,
      [currentQuestion.id]: currentAnswer || "[No Answer - Time Expired]"
    }
    onSubmit(finalAnswers)
  }

  // Format timer string (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      
      {/* Minimal Sticky Nav Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-b border-border/60 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-base shadow-sm">
            H
          </div>
          <span className="font-sans font-bold tracking-tight text-base hidden sm:inline">
            Hire<span className="text-brand-primary">Box</span> AI
          </span>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-brand-muted-text font-bold px-2 py-0.5 rounded border border-border">
            Exam Session
          </span>
        </div>
        
        {/* Candidate Information & Theme controls */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-xs font-bold">{candidateName}</p>
            <p className="text-[10px] text-brand-muted-text font-medium">{role}</p>
          </div>
          <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 text-brand-danger px-3 py-1.5 rounded-lg border border-rose-100 dark:border-rose-900/30 text-xs font-extrabold shadow-sm animate-pulse">
            <Clock className="h-4 w-4 shrink-0" />
            <span>Time Left: {formatTime(globalTimeLeft)}</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Panel Content Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid md:grid-cols-12 gap-6">
        
        {/* Left Side: Question block (70% or 8 columns) */}
        <div className="md:col-span-8 flex flex-col justify-between space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-5 md:p-6 shadow-sm space-y-6">
            
            {/* Progress and indicator */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-brand-primary uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}
                </span>
                <span className="text-brand-muted-text flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-brand-muted-text" />
                  This question: {formatTime(questionTimeLeft)}
                </span>
              </div>
              
              {/* Progress Line */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-brand-primary h-full rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary-bg dark:bg-brand-primary/10 px-2.5 py-0.5 rounded">
                <HelpCircle className="h-3 w-3" /> Technical Question
              </span>
              <h1 className="text-lg md:text-xl font-bold tracking-tight leading-snug">
                {currentQuestion.text}
              </h1>
            </div>

            {/* Response Form Textarea */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-brand-muted-text">
                <label htmlFor="answer-input">Your Answer Response</label>
                <span>{currentAnswer.length} / 2000 characters</span>
              </div>
              
              <div className="relative">
                <textarea
                  id="answer-input"
                  rows={8}
                  maxLength={2000}
                  value={currentAnswer}
                  onChange={handleAnswerChange}
                  placeholder="Type your detailed answer here... (Tip: You can also use the voice dictate button below to simulate speaking your answer)"
                  className="w-full rounded-xl border border-border bg-background p-4 text-sm leading-relaxed focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none resize-none shadow-inner transition-colors"
                />

                {/* Voice recording overlay indicator */}
                {isRecording && (
                  <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-[1px] pointer-events-none rounded-xl flex items-center justify-center">
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-border shadow-md flex items-center gap-2 animate-bounce">
                      <span className="h-2.5 w-2.5 rounded-full bg-brand-danger animate-ping" />
                      <span className="text-xs font-bold">Voice Input active: Transcribing speech...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls panel: Voice input & next button */}
            <div className="flex justify-between items-center pt-2">
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
                {isRecording ? <MicOff className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                {isRecording ? "Stop Dictating" : "Voice Dictate"}
              </button>

              <button
                onClick={() => handleNextQuestion(false)}
                disabled={!currentAnswer.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-brand-primary/95 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                {currentQuestionIndex === MOCK_QUESTIONS.length - 1 ? "Submit Interview" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

          </div>

          {/* Secure disclaimer */}
          <div className="bg-blue-50 dark:bg-blue-950/25 border border-blue-100 dark:border-blue-900/30 p-3.5 rounded-lg flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
            <Shield className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Security Notice:</span> Tab switching, minimizes, or screen adjustments will log security events. Please remain on this tab until final submission.
            </div>
          </div>
        </div>

        {/* Right Side: Proctor Camera Preview & Live Alerts (30% or 4 columns) */}
        <div className="md:col-span-4 space-y-6 order-first md:order-last">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-xl p-5 shadow-sm space-y-5">
            
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1.5">
                <Video className="h-4 w-4" />
                Live Proctor Feed
              </h2>
              
              {/* Integrity status dot */}
              <div className="flex items-center gap-1.5">
                <span className={cn(
                  "h-2 w-2 rounded-full",
                  integrity === "green" && "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]",
                  integrity === "yellow" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.55)]",
                  integrity === "red" && "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                )} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  {integrity === "green" && "Integrity Good"}
                  {integrity === "yellow" && "Review Warning"}
                  {integrity === "red" && "Violation Alert"}
                </span>
              </div>
            </div>

            {/* Webcam Stream Box */}
            <div className="relative w-full aspect-[4/3] rounded-lg bg-slate-100 dark:bg-slate-950 border border-border overflow-hidden flex items-center justify-center max-w-[280px] mx-auto md:max-w-none">
              {mediaStream ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="text-center p-3 text-brand-danger">
                  <AlertTriangle className="h-8 w-8 mx-auto stroke-1 animate-pulse" />
                  <p className="text-xs font-bold mt-1">No Camera Connection</p>
                </div>
              )}
              
              {/* Scan overlay grid line */}
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-brand-primary/5 to-transparent pointer-events-none animate-pulse" />
            </div>

            {/* AI Proctor Indicators */}
            <div className="space-y-2.5">
              {/* Indicator 1: Face detection */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs bg-slate-50/50 dark:bg-slate-900/40">
                <span className="font-semibold text-brand-muted-text">Face Tracker</span>
                {faceStatus === "detected" && (
                  <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                    Face Detected ✓
                  </span>
                )}
                {faceStatus === "not_visible" && (
                  <span className="text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/45 border border-amber-100 dark:border-amber-900/30 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    Face Not Visible ⚠
                  </span>
                )}
                {faceStatus === "multiple" && (
                  <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/45 border border-rose-100 dark:border-rose-900/30 px-2 py-0.5 rounded flex items-center gap-1 animate-bounce">
                    Multiple People ✗
                  </span>
                )}
              </div>

              {/* Indicator 2: Phone detection */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border border-border text-xs bg-slate-50/50 dark:bg-slate-900/40">
                <span className="font-semibold text-brand-muted-text">Device Monitor</span>
                {phoneStatus === "no_phone" ? (
                  <span className="text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/45 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                    No Phone ✓
                  </span>
                ) : (
                  <span className="text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/45 border border-rose-100 dark:border-rose-900/30 px-2 py-0.5 rounded flex items-center gap-1 animate-bounce">
                    Phone Detected ✗
                  </span>
                )}
              </div>
            </div>

            {/* Live Violation Logs */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-brand-muted-text">
                Live Security Logs (Mocked)
              </h3>
              
              <div className="min-h-[90px] max-h-[120px] overflow-y-auto border border-border rounded-lg p-2.5 bg-slate-50 dark:bg-slate-950 text-[10px] font-mono space-y-1.5 scrollbar-thin">
                {violationLog.length === 0 ? (
                  <p className="text-emerald-500 font-bold flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> No security events logged
                  </p>
                ) : (
                  violationLog.map((log, index) => {
                    const isRed = log.includes("Multiple") || log.includes("device")
                    return (
                      <p 
                        key={index} 
                        className={cn(
                          isRed ? "text-rose-500 font-bold" : "text-amber-500 font-semibold",
                          "leading-normal flex items-start gap-1"
                        )}
                      >
                        {isRed ? <AlertOctagon className="h-3 w-3 mt-0.5 shrink-0" /> : <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />}
                        <span>{log}</span>
                      </p>
                    )
                  })
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
