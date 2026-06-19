"use client"

import React, { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, ApiJob } from "@/lib/api"
import { JobCard } from "@/components/jobs/JobCard"
import { CreateJobModal } from "@/components/jobs/CreateJobModal"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { 
  Plus, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Search,
  CheckCircle,
  AlertTriangle
} from "lucide-react"

// Alias for compatibility
type Job = ApiJob

export default function JobsPage() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState("")

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  // React Query fetch jobs
  const { data: jobs = [], isLoading, isError } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
  })

  // Mutations
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, currentStatus }: { id: string | number; currentStatus: string }) => {
      const nextStatus = currentStatus === "Active" ? "Closed" : "Active"
      return api.updateJob(id, { status: nextStatus as any })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job status toggled successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update job status.")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: api.deleteJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job posting deleted successfully.")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to delete job posting.")
    }
  })

  const createMutation = useMutation({
    mutationFn: api.createJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("New job opening created successfully!")
      setIsModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post new job opening.")
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<Job> }) => api.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job listing updated successfully!")
      setIsModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save job changes.")
    }
  })

  // Status toggle handler
  const handleStatusToggle = (id: string) => {
    const targetJob = jobs.find(j => j.id.toString() === id.toString())
    if (targetJob) {
      toggleStatusMutation.mutate({ id, currentStatus: targetJob.status })
    }
  }

  // Delete handler
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this job posting? All applicants will be unlinked.")) {
      deleteMutation.mutate(id)
    }
  }

  // Open edit modal
  const handleEditClick = (job: Job) => {
    // Cast type to fit component spec
    setEditingJob(job)
    setIsModalOpen(true)
  }

  // Open create modal
  const handleCreateClick = () => {
    setEditingJob(null)
    setIsModalOpen(true)
  }

  // Save / Post handler (works for both edit and create)
  const handleSaveJob = (jobData: Omit<Job, "candidates" | "topScore" | "created">) => {
    if (editingJob) {
      // Edit
      updateMutation.mutate({ id: editingJob.id, data: jobData })
    } else {
      // Create
      createMutation.mutate(jobData)
    }
  }

  // Stats calculations
  const totalJobsCount = jobs.length
  const activeJobsCount = jobs.filter(j => j.status === "Active").length
  const candidatesThisMonth = jobs.reduce((acc, curr) => acc + curr.candidates, 0)
  
  const totalScores = jobs.map(j => j.topScore)
  const avgTopScore = totalScores.length > 0 
    ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
    : 0

  // Filter jobs based on search
  const filteredJobs = jobs.filter(j =>
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
    j.location.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Loading Skeleton screen
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
        
        {/* Stats Strip Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>

        <Skeleton className="h-10 w-64 rounded-lg" />

        {/* Jobs Cards Grid Skeletons */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Jobs Listings</h2>
          <p className="text-sm text-brand-muted-text">Coordinate job configurations, candidate assessments, and details.</p>
        </div>
        <button
          onClick={handleCreateClick}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer animate-fade-in"
        >
          <Plus className="h-4 w-4" />
          Post New Job
        </button>
      </div>

      {/* Stats Strip Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Stat 1 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-brand-muted-text font-bold uppercase tracking-wider">Total Positions</p>
            <p className="text-lg font-extrabold mt-0.5">{totalJobsCount}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-brand-muted-text font-bold uppercase tracking-wider">Active Openings</p>
            <p className="text-lg font-extrabold mt-0.5">{activeJobsCount}</p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-brand-muted-text font-bold uppercase tracking-wider">Total Applicants</p>
            <p className="text-lg font-extrabold mt-0.5">{candidatesThisMonth}</p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-brand-muted-text font-bold uppercase tracking-wider">Average Screen Score</p>
            <p className="text-lg font-extrabold mt-0.5">{avgTopScore}%</p>
          </div>
        </div>

      </div>

      {/* Filtering Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search jobs by title, location or department..."
          className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600 transition-colors"
        />
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-muted-text" />
      </div>

      {/* Jobs Cards Grid */}
      {filteredJobs.length === 0 ? (
        <div className="py-16 text-center text-brand-muted-text space-y-3 border border-dashed border-border rounded-xl bg-card dark:bg-slate-900">
          <Briefcase className="h-12 w-12 mx-auto stroke-1" />
          <div>
            <p className="font-semibold text-lg">No job openings found</p>
            <p className="text-sm">Click "Post New Job" to begin hiring candidates.</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job as any} // Cast for component compat
              onStatusToggle={handleStatusToggle}
              onEdit={handleEditClick as any}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Multi-step Create / Edit Job Modal */}
      <CreateJobModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveJob as any}
        editingJob={editingJob as any}
      />
      
    </div>
  )
}
