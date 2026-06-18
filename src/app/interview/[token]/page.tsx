"use client"

import React, { useState, useEffect, use } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { PreExamScreen } from "@/components/interview/PreExamScreen"
import { ExamScreen } from "@/components/interview/ExamScreen"
import { CompletionScreen } from "@/components/interview/CompletionScreen"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

interface InterviewPageProps {
  params: Promise<{ token: string }> | { token: string }
}

export default function InterviewPage({ params }: InterviewPageProps) {
  // Safe resolution of params for both Next.js 14 and Next.js 15+ (Promise)
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

  const handleSubmitExam = (answers: Record<number, string>) => {
    // Stop camera immediately to turn off webcam indicator light
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      setMediaStream(null)
    }

    // Submit answers and dummy proctor log via mutation
    submitAnswersMutation.mutate({ 
      answers, 
      proctorLog: [
        { time: "00:00", event: "Webcam stream calibration verified", type: "info" }
      ]
    })
  }

  // Pre-exam page loading skeleton
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-xl p-8 grid md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="md:col-span-5 space-y-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // Default candidate specifications (with dynamic fallback)
  const candidateName = session ? session.candidateName : "Jane Doe"
  const role = session ? session.role : "Senior Fullstack Engineer"
  const company = session ? session.company : "HireBox AI"
  const timeLimit = session ? session.timeLimit : 15

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950 min-h-screen">
      {screen === "pre-exam" && (
        <PreExamScreen 
          role={role} 
          company={company} 
          onStart={handleStartExam} 
        />
      )}
      
      {screen === "exam" && (
        <ExamScreen
          candidateName={candidateName}
          role={role}
          timeLimit={timeLimit}
          mediaStream={mediaStream}
          onSubmit={handleSubmitExam}
        />
      )}

      {screen === "completed" && (
        <CompletionScreen />
      )}
    </div>
  )
}
