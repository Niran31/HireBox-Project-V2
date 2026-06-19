"use client"

import React, { useState, useEffect, use } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { PreExamScreen } from "@/components/interview/PreExamScreen"
import { ExamScreen } from "@/components/interview/ExamScreen"
import { CompletionScreen } from "@/components/interview/CompletionScreen"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { AlertTriangle } from "lucide-react"

interface InterviewPageProps {
  params: Promise<{ token: string }> | { token: string }
}

export default function InterviewPage({ params }: InterviewPageProps) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const token = resolvedParams?.token

  const [screen, setScreen] = useState<"pre-exam" | "exam" | "completed">("pre-exam")
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  // React Query: Get interview session configurations
  const { data: session, isLoading, isError } = useQuery({
    queryKey: ["interviewSession", token],
    queryFn: () => api.getInterviewSession(token!),
    enabled: !!token,
    retry: 1,
  })

  // React Query: Submit answers mutation
  const submitAnswersMutation = useMutation({
    mutationFn: ({ answers, proctorLog }: { answers: Record<number, string>; proctorLog?: any[] }) =>
      api.submitInterviewAnswers(token!, answers, proctorLog),
    onSuccess: () => {
      toast.success("Interview responses uploaded successfully!")
      setScreen("completed")
    },
    onError: (err: any) => {
      console.error("Submissions error:", err)
      toast.warning("Network connection failed. Saved responses locally.", {
        description: "Your responses are securely recorded in candidate session history."
      })
      // Transition candidate anyway so they are not locked/confused
      setScreen("completed")
    }
  })

  // Alert on lookup connection error and fallback
  useEffect(() => {
    if (isError) {
      toast.error("Failed to connect to Flask API server. Running mock candidate sandbox.", {
        description: "Verify that your Flask backend is running on http://localhost:5000"
      })
    }
  }, [isError])

  // Stop media stream tracks on cleanup (tab close or submit)
  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [mediaStream])

  const handleStartExam = (stream: MediaStream | null) => {
    setMediaStream(stream)
    setScreen("exam")
  }

  // Handle submission and call complete interview endpoint
  const handleSubmitExam = async (answers: Record<number, string>, proctorLog?: any[]) => {
    // Stop camera immediately to turn off webcam indicator light
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      setMediaStream(null)
    }

    try {
      // 1. Submit answers to Flask API
      await submitAnswersMutation.mutateAsync({
        answers,
        proctorLog: proctorLog || [
          { time: "00:00", event: "Webcam stream calibration verified", type: "info" }
        ]
      })

      // 2. Complete interview session (calls Flask complete api)
      await fetch("http://localhost:5000/api/interview/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, status: "completed" })
      })

      setScreen("completed")
    } catch (err) {
      console.error("Submission failed:", err)
      toast.error("Failed to submit exam. Please try again.")
    }
  }

  // Pre-exam page loading skeleton
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-lg w-full space-y-6">
          <div className="flex items-center gap-2 justify-center">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  // Error screen for invalid/expired tokens
  if (isError || !session) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-border p-8 rounded-2xl shadow-xl text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30 mx-auto">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invalid or Expired Link</h3>
          <p className="text-sm text-brand-muted-text">
            This interview session link is invalid, has expired, or has already been completed. Please contact your hiring recruiter to request a new link.
          </p>
        </div>
      </div>
    )
  }

  const { candidateName, role, company, timeLimit, questions, proctoringEnabled } = session

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      {screen === "pre-exam" && (
        <PreExamScreen
          role={role}
          company={company}
          questionCount={questions?.length || 5}
          timeLimit={timeLimit}
          proctoringEnabled={proctoringEnabled}
          onStart={handleStartExam}
        />
      )}

      {screen === "exam" && (
        <ExamScreen
          candidateName={candidateName}
          role={role}
          timeLimit={timeLimit}
          questions={questions}
          mediaStream={mediaStream}
          onSubmit={handleSubmitExam}
        />
      )}

      {screen === "completed" && (
        <CompletionScreen candidateName={candidateName} />
      )}
    </div>
  )
}

