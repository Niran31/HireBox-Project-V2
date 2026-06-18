"use client"

import React, { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { api, ApiAnalytics } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  BarChart3,
  TrendingUp,
  Percent,
  ShieldCheck,
  Briefcase,
  Users,
  Award,
  AlertTriangle
} from "lucide-react"

// Rich mockup dataset for fallback mapping
const MOCK_ANALYTICS: ApiAnalytics = {
  dropOffFunnel: [
    { stage: "Applied", count: 142, percentage: 100 },
    { stage: "Screened", count: 98, percentage: 69 },
    { stage: "Interviewed", count: 54, percentage: 38 },
    { stage: "Offered", count: 38, percentage: 26 },
    { stage: "Hired", count: 16, percentage: 11 }
  ],
  scoreDistribution: [
    { label: "90% - 100% (Grade A)", count: 18 },
    { label: "80% - 89% (Grade B)", count: 34 },
    { label: "70% - 79% (Grade C)", count: 28 },
    { label: "60% - 69% (Grade D)", count: 14 },
    { label: "Below 60% (Fail)", count: 8 }
  ],
  integrityBreakdown: [
    { label: "Secure (Clean)", count: 82, color: "bg-emerald-500 text-emerald-500" },
    { label: "Minor Flag warnings", count: 12, color: "bg-amber-500 text-amber-500" },
    { label: "Suspended (Cheating)", count: 6, color: "bg-rose-500 text-rose-500" }
  ],
  departmentAverages: [
    { department: "Engineering", avgScore: 85, candidatesCount: 78 },
    { department: "Design", avgScore: 92, candidatesCount: 19 },
    { department: "Product Management", avgScore: 78, candidatesCount: 34 },
    { department: "QA Automation", avgScore: 81, candidatesCount: 15 }
  ]
}

export default function AnalyticsPage() {
  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    isError: isAnalyticsError
  } = useQuery({
    queryKey: ["analytics"],
    queryFn: api.getAnalytics,
    retry: false
  })

  useEffect(() => {
    if (isAnalyticsError) {
      toast.error("Failed to connect to Flask API server. Using mock fallback details.", {
        description: "Verify that your Flask backend is running on http://localhost:5000"
      })
    }
  }, [isAnalyticsError])

  const isLoading = isAnalyticsLoading && !isAnalyticsError
  const displayData = analytics || MOCK_ANALYTICS

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[350px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
          <Skeleton className="h-[250px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Circular gauge parameter calculation for Donut Chart
  let totalIntegrityCount = displayData.integrityBreakdown.reduce((sum, item) => sum + item.count, 0)
  if (totalIntegrityCount === 0) totalIntegrityCount = 1

  let accumulatedPercentage = 0
  const donutSlices = displayData.integrityBreakdown.map((slice) => {
    const percentage = (slice.count / totalIntegrityCount) * 100
    const startPercentage = accumulatedPercentage
    accumulatedPercentage += percentage
    return {
      ...slice,
      percentage,
      startPercentage
    }
  })

  // Calculations for score bar scaling
  const maxScoreCount = Math.max(...displayData.scoreDistribution.map(s => s.count), 1)

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Header Block */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-sm text-brand-muted-text">Monitor overall scoring distributions, applicant funnel conversions, and AI proctor integrity metrics.</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        
        {/* Funnel conversion widget */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2 mb-6">
              <Percent className="h-4.5 w-4.5 text-brand-primary" /> Hiring Pipeline Conversion Funnel
            </h3>
            
            <div className="space-y-4">
              {displayData.dropOffFunnel.map((item, idx) => {
                // Width gets narrower down the funnel
                const funnelWidth = `${item.percentage}%`
                return (
                  <div key={item.stage} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{item.stage}</span>
                      <span className="text-brand-muted-text font-mono">
                        {item.count} Candidates ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-7 w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex">
                      <div 
                        className={cn(
                          "h-full rounded-lg transition-all duration-500 flex items-center justify-end px-3 text-[10px] font-black text-white shadow-inner",
                          idx === 0 && "bg-blue-600",
                          idx === 1 && "bg-blue-500",
                          idx === 2 && "bg-purple-500",
                          idx === 3 && "bg-amber-500",
                          idx === 4 && "bg-emerald-500"
                        )}
                        style={{ width: funnelWidth }}
                      >
                        {item.percentage >= 15 ? `${item.percentage}%` : ""}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Score distribution histogram */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2 mb-6">
              <BarChart3 className="h-4.5 w-4.5 text-purple-500" /> Screening Score Distribution
            </h3>

            <div className="space-y-4">
              {displayData.scoreDistribution.map((item) => {
                const percentageOfMax = (item.count / maxScoreCount) * 100
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                      <span className="font-mono text-brand-primary">{item.count} candidates</span>
                    </div>
                    <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentageOfMax}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Proctoring integrity pie/donut */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2 mb-4">
              <ShieldCheck className="h-4.5 w-4.5 text-brand-success" /> Proctoring Security Overview
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
              {/* Donut graphic */}
              <div className="relative h-36 w-36 flex items-center justify-center">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    className="stroke-slate-100 dark:stroke-slate-800"
                    strokeWidth="12"
                    fill="transparent"
                    r="52"
                    cx="72"
                    cy="72"
                  />
                  {donutSlices.map((slice, idx) => {
                    // Dash calculations
                    const radius = 52
                    const circ = 2 * Math.PI * radius
                    const dashoffset = circ - (slice.percentage / 100) * circ
                    const rotate = (slice.startPercentage / 100) * 360
                    
                    return (
                      <circle
                        key={idx}
                        className={cn(
                          "transition-all duration-500",
                          idx === 0 && "stroke-emerald-500",
                          idx === 1 && "stroke-amber-500",
                          idx === 2 && "stroke-rose-500"
                        )}
                        strokeWidth="12"
                        strokeDasharray={circ}
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        r={radius}
                        cx="72"
                        cy="72"
                        style={{
                          transformOrigin: "72px 72px",
                          transform: `rotate(${rotate}deg)`
                        }}
                      />
                    )
                  })}
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black">{displayData.integrityBreakdown[0]?.count}%</span>
                  <span className="text-[8px] text-brand-muted-text font-bold uppercase tracking-wider">Clean Sessions</span>
                </div>
              </div>

              {/* Legends details */}
              <div className="space-y-3.5 w-full sm:w-auto">
                {displayData.integrityBreakdown.map((item, idx) => (
                  <div key={item.label} className="flex items-center gap-2.5 text-xs font-semibold">
                    <span className={cn(
                      "h-3.5 w-3.5 rounded-md",
                      idx === 0 && "bg-emerald-500",
                      idx === 1 && "bg-amber-500",
                      idx === 2 && "bg-rose-500"
                    )} />
                    <div className="flex-1 flex justify-between gap-6">
                      <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                      <span className="font-bold text-foreground font-mono">{item.count}%</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Department summaries list */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2 mb-4">
              <TrendingUp className="h-4.5 w-4.5 text-amber-500" /> Scoring by Department
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-brand-muted-text font-bold pb-2">
                    <th className="pb-3">Department</th>
                    <th className="pb-3 text-center">Applicants</th>
                    <th className="pb-3 text-right">Avg Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-sm">
                  {displayData.departmentAverages.map((dept) => (
                    <tr key={dept.department} className="hover:bg-accent/10 transition-colors">
                      <td className="py-3.5 font-semibold text-foreground">{dept.department}</td>
                      <td className="py-3.5 text-center text-brand-muted-text font-medium">{dept.candidatesCount}</td>
                      <td className="py-3.5 text-right font-extrabold text-brand-primary font-mono">{dept.avgScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
