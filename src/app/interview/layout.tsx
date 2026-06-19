import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "HireBox AI — Interview Session",
  description: "AI-proctored candidate screening exam portal. Complete your interview questions within the time limit.",
}

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  )
}
