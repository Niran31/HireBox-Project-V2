"use client"

import React, { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { CandidateReport } from "@/components/reports/CandidateReport"
import { Skeleton } from "@/components/ui/skeleton"

interface ReportDetailPageProps {
  params: Promise<{ interviewId: string }> | { interviewId: string }
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const interviewId = resolvedParams?.interviewId
  const router = useRouter()

  // Fetch candidates to find candidate by interviewId (candidate ID)
  const { data: candidates = [], isLoading: isCandidatesLoading } = useQuery({
    queryKey: ["candidates"],
    queryFn: () => api.getCandidates(),
    retry: false,
  })

  // Find candidate by interviewId (candidate ID)
  const candidate = candidates.find((c) => c.id.toString() === interviewId)

  if (isCandidatesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-6 w-48" />
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

  if (!candidate) {
    return (
      <div className="py-16 text-center text-slate-500 dark:text-slate-400 space-y-3">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Report Not Found</h2>
        <p className="text-sm">We couldn&apos;t find an assessment scorecard for candidate ID &ldquo;{interviewId}&rdquo;.</p>
        <button
          onClick={() => router.push("/reports")}
          className="mt-4 px-4 py-2 rounded-lg bg-brand-primary text-white font-semibold hover:bg-brand-primary/95 transition-all"
        >
          Go Back to Reports List
        </button>
      </div>
    )
  }

  return (
    <CandidateReport
      candidate={candidate}
      onBack={() => router.push("/reports")}
    />
  )
}
