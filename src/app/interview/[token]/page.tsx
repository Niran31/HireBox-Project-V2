"use client"

import React, { useState, useEffect, use } from "react"
import { MOCK_CANDIDATES, MOCK_JOBS } from "@/lib/mock-data"
import { PreExamScreen } from "@/components/interview/PreExamScreen"
import { ExamScreen } from "@/components/interview/ExamScreen"
import { CompletionScreen } from "@/components/interview/CompletionScreen"

interface InterviewPageProps {
  params: Promise<{ token: string }> | { token: string }
}

export default function InterviewPage({ params }: InterviewPageProps) {
  // Safe resolution of params for both Next.js 14 and Next.js 15+ (Promise)
  const resolvedParams = params instanceof Promise ? use(params) : params
  const token = resolvedParams?.token

  const [screen, setScreen] = useState<"pre-exam" | "exam" | "completed">("pre-exam")
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  // Candidate details
  const [candidateName, setCandidateName] = useState("Jane Doe")
  const [role, setRole] = useState("Senior Fullstack Engineer")
  const [company, setCompany] = useState("HireBox AI")
  const [timeLimit, setTimeLimit] = useState(15) // minutes

  // Look up candidate and corresponding job specs
  useEffect(() => {
    if (token) {
      const candidate = MOCK_CANDIDATES.find((c) => c.id === token)
      if (candidate) {
        setCandidateName(candidate.name)
        setRole(candidate.role)
        
        // Find job specifications
        const job = MOCK_JOBS.find((j) => j.id === candidate.jobId)
        if (job) {
          setTimeLimit(job.timeLimit || 15)
        }
      }
    }
  }, [token])

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
    console.log("Exam submitted for token:", token, "Answers:", answers)
    
    // Stop camera immediately to turn off webcam indicator light
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop())
      setMediaStream(null)
    }
    
    setScreen("completed")
  }

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
