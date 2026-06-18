"use client"

import React, { useState, useEffect } from "react"
import { DndContext, DragEndEvent } from "@dnd-kit/core"
import { useDroppable } from "@dnd-kit/core"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  MOCK_CANDIDATES, 
  MOCK_JOBS, 
  Candidate, 
  Job 
} from "@/lib/mock-data"
import { CandidateCard } from "@/components/candidates/CandidateCard"
import { CandidateDetailModal } from "@/components/candidates/CandidateDetailModal"
import { AddCandidateModal } from "@/components/candidates/AddCandidateModal"
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Kanban as KanbanIcon, 
  Table as TableIcon,
  ChevronRight,
  Filter,
  Eye,
  Trash2,
  Mail,
  MoreVertical,
  AlertTriangle,
  RotateCcw,
  Users
} from "lucide-react"

// Droppable Column Component
interface KanbanColumnProps {
  id: Candidate["stage"]
  title: string
  colorClass: string
  headerColorClass: string
  count: number
  children: React.ReactNode
  onAddClick?: () => void
}

function KanbanColumn({ id, title, colorClass, headerColorClass, count, children, onAddClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border border-border bg-slate-50/50 dark:bg-slate-900/40 p-4 min-h-[500px] max-h-[75vh] transition-colors",
        isOver ? "bg-brand-primary-bg/30 dark:bg-brand-card-dark/30 border-brand-primary" : ""
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/40 mb-4">
        <div className="flex items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", headerColorClass)} />
          <h4 className="font-bold text-sm text-foreground tracking-tight">{title}</h4>
          <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-xs font-bold text-brand-muted-text">
            {count}
          </span>
        </div>
        {id === "Applied" && onAddClick && (
          <button
            onClick={onAddClick}
            className="p-1 text-brand-muted-text hover:text-brand-primary hover:bg-accent rounded-md cursor-pointer transition-colors"
            title="Add candidate"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Column Cards Container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-border">
        {children}
      </div>
    </div>
  )
}

export default function CandidatesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score")
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban")
  
  // Modal states
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // Simulation loading 1.5s
  useEffect(() => {
    setCandidates(MOCK_CANDIDATES)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Drag and drop handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over) return

    const candidateId = active.id as string
    const targetStage = over.id as Candidate["stage"]

    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? { 
              ...c, 
              stage: targetStage,
              // Update status recommendation automatically for hires/rejects for convenience
              status: targetStage === "Hired" ? "Strong Hire" : targetStage === "Rejected" ? "Not Recommended" : c.status
            }
          : c
      )
    )
  }

  // Invite action
  const handleInvite = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, interviewStatus: "Completed" as const, interviewScore: Math.floor(Math.random() * 30) + 70 }
          : c
      )
    )
    alert("Interview invite dispatched! Candidate session generated.")
  }

  // Reject action
  const handleReject = (id: string) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, stage: "Rejected" as const, status: "Not Recommended" as const } : c
      )
    )
    setIsDetailOpen(false)
  }

  // Move stage dropdown select action
  const handleMoveStage = (id: string, stage: Candidate["stage"]) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === id
          ? { 
              ...c, 
              stage,
              status: stage === "Hired" ? "Strong Hire" : stage === "Rejected" ? "Not Recommended" : c.status
            }
          : c
      )
    )
    // Synchronize selectedCandidate view inside detailed panel
    setSelectedCandidate((prev) => prev ? { ...prev, stage } : null)
  }

  // Register candidate
  const handleAddCandidate = (newCand: Omit<Candidate, "id" | "date" | "status" | "interviewStatus">) => {
    const candidate: Candidate = {
      ...newCand,
      id: `cand-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      interviewStatus: "Pending",
    }
    setCandidates((prev) => [candidate, ...prev])
  }

  // Filters & Sorting logic
  const filteredCandidates = candidates
    .filter((c) => {
      const matchesJob = selectedJobId === "all" || c.jobId === selectedJobId
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesJob && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "date") return b.date.localeCompare(a.date)
      return 0
    })

  // Columns definition
  const columns: { id: Candidate["stage"]; title: string; colorClass: string; headerColorClass: string }[] = [
    { id: "Applied", title: "Applied", colorClass: "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60", headerColorClass: "bg-slate-400" },
    { id: "Screened", title: "Screened", colorClass: "border-blue-200 bg-blue-50/30 dark:border-blue-900/30 dark:bg-blue-950/15", headerColorClass: "bg-blue-500" },
    { id: "Interview", title: "Interview", colorClass: "border-purple-200 bg-purple-50/30 dark:border-purple-900/30 dark:bg-purple-950/15", headerColorClass: "bg-purple-500" },
    { id: "Offer", title: "Offer", colorClass: "border-amber-200 bg-amber-50/30 dark:border-amber-900/30 dark:bg-amber-950/15", headerColorClass: "bg-amber-500" },
    { id: "Hired", title: "Hired", colorClass: "border-emerald-200 bg-emerald-50/30 dark:border-emerald-900/30 dark:bg-emerald-950/15", headerColorClass: "bg-emerald-500" },
  ]

  const viewDetail = (cand: Candidate) => {
    setSelectedCandidate(cand)
    setIsDetailOpen(true)
  }

  // Loading Screen Skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-44 rounded-lg" />
            <Skeleton className="h-10 w-56 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3 rounded-xl border border-border p-4 bg-card h-[500px]">
              <Skeleton className="h-6 w-24 mb-4" />
              <Skeleton className="h-28 w-full rounded-xl" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Top Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Candidates Pipeline</h2>
          <p className="text-sm text-brand-muted-text">Manage recruitment progress, track interview logs, and drag stages.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Candidate
        </button>
      </div>

      {/* Filter and Sorting Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-y border-border/40 py-4">
        
        {/* Left Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-2xl">
          {/* Job Selector */}
          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full sm:w-56 rounded-lg border border-border bg-background pl-3 pr-8 py-2 text-sm font-medium text-foreground focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Jobs Listings</option>
              {MOCK_JOBS.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-brand-muted-text">
              <Filter className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Search box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search candidate by name..."
              className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-muted-text" />
          </div>
        </div>

        {/* Right Sort / Views Toggle */}
        <div className="flex items-center gap-4">
          
          {/* Sort selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-muted-text whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold text-foreground focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer"
            >
              <option value="score">Score</option>
              <option value="name">Name</option>
              <option value="date">Date</option>
            </select>
          </div>

          {/* View Toggles */}
          <div className="flex items-center rounded-lg border border-border p-1 bg-background/50">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "kanban"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-muted-text hover:text-foreground"
              )}
              title="Kanban Board View"
            >
              <KanbanIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-md transition-colors cursor-pointer",
                viewMode === "table"
                  ? "bg-brand-primary text-white shadow-sm"
                  : "text-brand-muted-text hover:text-foreground"
              )}
              title="Tabular List View"
            >
              <TableIcon className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Board content */}
      {viewMode === "kanban" ? (
        /* Drag-and-drop Kanban Board View */
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-5">
            {columns.map((col) => {
              const colCandidates = filteredCandidates.filter((c) => c.stage === col.id)
              return (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  title={col.title}
                  colorClass={col.colorClass}
                  headerColorClass={col.headerColorClass}
                  count={colCandidates.length}
                  onAddClick={() => setIsAddOpen(true)}
                >
                  {colCandidates.map((cand) => (
                    <CandidateCard
                      key={cand.id}
                      candidate={cand}
                      onClick={() => viewDetail(cand)}
                      onInvite={handleInvite}
                      onReject={handleReject}
                    />
                  ))}
                  {colCandidates.length === 0 && (
                    <div className="h-full min-h-[150px] flex items-center justify-center border border-dashed border-border/60 rounded-xl">
                      <span className="text-xs text-brand-muted-text">Drop here</span>
                    </div>
                  )}
                </KanbanColumn>
              )
            })}
          </div>
        </DndContext>
      ) : (
        /* Candidates Table View */
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm overflow-x-auto">
          {filteredCandidates.length === 0 ? (
            <div className="py-12 text-center text-brand-muted-text space-y-2">
              <Users className="h-12 w-12 mx-auto stroke-1" />
              <p className="font-semibold">No candidates match the filters</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 text-xs text-brand-muted-text font-bold uppercase">
                  <th className="pb-3">Candidate</th>
                  <th className="pb-3">Applied Role</th>
                  <th className="pb-3 text-right">Resume Score</th>
                  <th className="pb-3 text-right">Interview Status</th>
                  <th className="pb-3 text-right">Interview Score</th>
                  <th className="pb-3 text-right">Stage</th>
                  <th className="pb-3 text-right">Date Applied</th>
                  <th className="pb-3 text-right">Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {filteredCandidates.map((cand, index) => (
                  <tr 
                    key={cand.id} 
                    className={cn(
                      "hover:bg-accent/10 transition-colors cursor-pointer",
                      index % 2 === 1 ? "bg-slate-50/20 dark:bg-slate-800/20" : ""
                    )}
                    onClick={() => viewDetail(cand)}
                  >
                    <td className="py-3.5 font-semibold text-foreground">{cand.name}</td>
                    <td className="py-3.5 text-brand-muted-text">{cand.role}</td>
                    <td className="py-3.5 text-right font-bold text-brand-primary">{cand.score}%</td>
                    <td className="py-3.5 text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
                        cand.interviewStatus === "Completed" ? "bg-emerald-100 text-brand-success dark:bg-emerald-950/40" :
                        cand.interviewStatus === "Suspended" ? "bg-rose-100 text-brand-danger dark:bg-rose-950/40 animate-pulse" :
                        "bg-slate-100 text-slate-500 dark:bg-slate-800"
                      )}>
                        {cand.interviewStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-semibold text-foreground">
                      {cand.interviewScore ? `${cand.interviewScore} / 100` : "N/A"}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-foreground">{cand.stage}</td>
                    <td className="py-3.5 text-right text-brand-muted-text">{cand.date}</td>
                    <td className="py-3.5 text-right">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        cand.status === "Strong Hire" ? "bg-emerald-100 text-brand-success dark:bg-emerald-950/40" :
                        cand.status === "Consider" ? "bg-blue-100 text-brand-primary dark:bg-blue-950/40" :
                        cand.status === "Not Recommended" ? "bg-rose-100 text-brand-danger dark:bg-rose-950/40" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {cand.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Candidate Modal */}
      <AddCandidateModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAdd={handleAddCandidate}
      />

      {/* Candidate Profile Details Slide-Over sheet */}
      <CandidateDetailModal
        candidate={selectedCandidate}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onInvite={handleInvite}
        onMoveStage={handleMoveStage}
      />
      
    </div>
  )
}
