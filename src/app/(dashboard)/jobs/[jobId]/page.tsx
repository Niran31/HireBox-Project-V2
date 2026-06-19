"use client"

import React, { useState, useEffect, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, ApiCandidate, ApiJob } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import {
  MOCK_JOBS,
  MOCK_CANDIDATES
} from "@/lib/mock-data"
import {
  Briefcase,
  MapPin,
  Calendar,
  Users,
  Award,
  Video,
  FileText,
  Clock,
  Search,
  Filter,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Shield,
  Edit3,
  UploadCloud,
  FileCode,
  CheckCircle,
  Loader2,
  Mail,
  AlertTriangle,
  FileCheck
} from "lucide-react"
import { CreateJobModal } from "@/components/jobs/CreateJobModal"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface JobDetailPageProps {
  params: Promise<{ jobId: string }> | { jobId: string }
}

interface UploadQueueItem {
  id: string
  filename: string
  status: "Parsing..." | "Ranked ✓" | "Failed"
  score?: number
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const resolvedParams = params instanceof Promise ? use(params) : params
  const jobId = resolvedParams?.jobId

  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<"candidates" | "details">("candidates")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [sortBy, setSortBy] = useState<"score" | "name" | "date">("score")
  
  // Simulated processing uploads state
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([])
  const [localAddedCandidates, setLocalAddedCandidates] = useState<ApiCandidate[]>([])

  // Modal states
  const [configuringCandidate, setConfiguringCandidate] = useState<ApiCandidate | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // React Query: Get jobs list
  const { data: jobs = [], isLoading: isJobsLoading, isError: isJobsError } = useQuery({
    queryKey: ["jobs"],
    queryFn: api.getJobs,
    retry: false
  })

  // React Query: Get candidates for this job
  const { data: candidates = [], isLoading: isCandidatesLoading } = useQuery({
    queryKey: ["candidates", jobId],
    queryFn: () => api.getCandidates(jobId),
    retry: false,
    refetchInterval: (query) => {
      const currentCandidates = query.state.data as ApiCandidate[] | undefined
      const hasProcessing = currentCandidates?.some(
        c => c.processing_status === 'pending' || c.processing_status === 'processing'
      )
      return hasProcessing ? 2000 : false
    }
  })

  // Mutation for uploading files to backend
  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => api.uploadResumes(jobId!, files),
    onMutate: (files) => {
      const newItems: UploadQueueItem[] = files.map((file, idx) => ({
        id: `upload-${Date.now()}-${idx}`,
        filename: file.name,
        status: "Parsing..."
      }))
      setUploadQueue(newItems)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates", jobId] })
      toast.success("Resumes uploaded successfully. Parsing in the background!")
      setTimeout(() => {
        setUploadQueue([])
      }, 3000)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload resumes.")
      setUploadQueue([])
    }
  })


  // Mutation: update job status (Active/Closed)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: "Active" | "Closed" }) =>
      api.updateJob(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job status updated successfully!")
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update job status.")
    }
  })

  // Mutation: update job configurations
  const updateJobMutation = useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: Partial<ApiJob> }) =>
      api.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast.success("Job details updated successfully!")
      setIsEditModalOpen(false)
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save job configurations.")
    }
  })

  // Alert on lookup connection error
  useEffect(() => {
    if (isJobsError) {
      toast.error("Failed to connect to Flask API server.", {
        description: "Verify that your Flask backend is running on http://localhost:5000"
      })
    }
  }, [isJobsError])

  const isLoading = isJobsLoading || isCandidatesLoading

  // Real data mappings (no mock fallbacks)
  const currentJob = jobs.find(j => j.id.toString() === jobId?.toString())
  const displayCandidates = candidates || []

  if (isLoading || !currentJob) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[200px] md:col-span-2 rounded-xl" />
          <Skeleton className="h-[200px] rounded-xl" />
        </div>
      </div>
    )
  }

  // Toggle status handler
  const handleToggleStatus = () => {
    const nextStatus = currentJob.status === "Active" ? "Closed" : "Active"
    updateStatusMutation.mutate({ id: currentJob.id, status: nextStatus })
  }

  // Real file drop uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    uploadMutation.mutate(Array.from(files))
  }

  // Filtering & Sorting candidate cards
  const filteredCandidates = displayCandidates
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase())
      let matchesStatus = true
      if (selectedStatus === "Pending") matchesStatus = c.interviewStatus === "Pending"
      else if (selectedStatus === "Completed") matchesStatus = c.interviewStatus === "Completed"
      else if (selectedStatus === "Failed") matchesStatus = c.interviewStatus === "Suspended"
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "date") return b.date.localeCompare(a.date)
      return 0
    })

  // Stats summaries
  const totalApplicants = displayCandidates.length
  const topCandidateScore = displayCandidates.length > 0 
    ? Math.max(...displayCandidates.map(c => c.score))
    : 0
  const interviewsSent = displayCandidates.filter(c => c.interviewStatus !== "Pending").length

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100 animate-fade-in">
      
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-bg px-2.5 py-0.5 text-[10px] font-bold text-brand-primary dark:bg-brand-card-dark">
              {currentJob.department}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <MapPin className="h-2.5 w-2.5" />
              {currentJob.location}
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {currentJob.type}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{currentJob.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Switch Toggle */}
          <div className="flex items-center gap-2 border border-border bg-card px-3.5 py-2 rounded-lg dark:bg-slate-900 shadow-sm">
            <button
              onClick={handleToggleStatus}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                currentJob.status === "Active" ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  currentJob.status === "Active" ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-xs font-bold">
              Status: {currentJob.status === "Active" ? "Active" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm dark:bg-slate-900 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-brand-muted-text font-bold uppercase tracking-wider">Total Candidates</p>
            <p className="text-lg font-extrabold mt-0.5">{totalApplicants}</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-brand-muted-text font-bold uppercase tracking-wider">Top Match Score</p>
            <p className="text-lg font-extrabold mt-0.5">{topCandidateScore}%</p>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex items-center gap-3 dark:bg-slate-900">
          <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Video className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-brand-muted-text font-bold uppercase tracking-wider">Interviews configured</p>
            <p className="text-lg font-extrabold mt-0.5">{interviewsSent}</p>
          </div>
        </div>
      </div>

      {/* Tabs headers */}
      <div className="border-b border-border/40">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("candidates")}
            className={cn(
              "pb-3.5 text-sm font-bold border-b-2 px-1 transition-colors cursor-pointer",
              activeTab === "candidates"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-muted-text hover:text-foreground"
            )}
          >
            Candidates List ({displayCandidates.length})
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={cn(
              "pb-3.5 text-sm font-bold border-b-2 px-1 transition-colors cursor-pointer",
              activeTab === "details"
                ? "border-brand-primary text-brand-primary"
                : "border-transparent text-brand-muted-text hover:text-foreground"
            )}
          >
            Job Configurations
          </button>
        </div>
      </div>

      {/* TAB CONTENT DISPLAY */}
      {activeTab === "candidates" ? (
        <div className="space-y-6">
          
          {/* UPLOAD resumes card */}
          <div className="rounded-xl border-2 border-dashed border-border bg-card p-6 shadow-sm dark:bg-slate-900 text-center space-y-4">
            <div className="max-w-md mx-auto space-y-3.5">
              <UploadCloud className="h-10 w-10 mx-auto text-brand-primary" />
              <div>
                <p className="font-bold text-sm">Drag and drop applicant resumes here</p>
                <p className="text-xs text-brand-muted-text mt-0.5">Supports PDF and DOCX files. Multiple files selection active.</p>
              </div>
              <div className="relative">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="resume-file-input"
                />
                <label
                  htmlFor="resume-file-input"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary-bg dark:bg-brand-card-dark text-brand-primary px-4 py-2 text-xs font-bold hover:opacity-90 cursor-pointer"
                >
                  Browse Files
                </label>
              </div>
            </div>

            {/* Simulated background processing queue list */}
            {uploadQueue.length > 0 && (
              <div className="max-w-xl mx-auto border border-border rounded-lg bg-slate-50 dark:bg-slate-950 p-4 space-y-3 text-left">
                <p className="text-[10px] font-bold text-brand-muted-text uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 animate-pulse" /> Extraction processing logs
                </p>
                <div className="divide-y divide-border/40 max-h-[150px] overflow-y-auto pr-1">
                  {uploadQueue.map(item => (
                    <div key={item.id} className="py-2 flex justify-between items-center text-xs">
                      <span className="font-medium truncate max-w-[250px]">{item.filename}</span>
                      <span className="flex items-center gap-1.5 font-bold">
                        {item.status === "Parsing..." ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-primary" />
                            <span className="text-brand-primary">Parsing...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-3.5 w-3.5 text-brand-success" />
                            <span className="text-brand-success">Scored: {item.score}%</span>
                          </>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filtering candidate strip */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-border/40 pb-4">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 max-w-xl">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidate by name..."
                  className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600 transition-colors"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-brand-muted-text" />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer dark:bg-slate-800 dark:border-slate-600 transition-colors"
              >
                <option value="all">All Candidates</option>
                <option value="Pending">Pending Invite</option>
                <option value="Completed">Completed Exams</option>
                <option value="Failed">Suspended Logs</option>
              </select>
            </div>

            {/* Sorting */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-brand-muted-text whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-bold focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none cursor-pointer dark:bg-slate-950"
              >
                <option value="score">Match Score</option>
                <option value="name">Alphabetical</option>
                <option value="date">Date Added</option>
              </select>
            </div>
          </div>

          {/* Candidates list cards layout */}
          {filteredCandidates.length === 0 ? (
            <div className="py-16 text-center text-brand-muted-text space-y-2.5 border border-dashed border-border rounded-xl bg-card dark:bg-slate-900">
              <Users className="h-10 w-10 mx-auto stroke-1" />
              <div>
                <p className="font-semibold text-lg">No candidates found</p>
                <p className="text-sm">Upload applicant resumes above to extract and rank them.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCandidates.map(cand => {
                // Circular progress meter calculations
                const radius = 18
                const circ = 2 * Math.PI * radius
                const dashoffset = circ - (cand.score / 100) * circ

                return (
                  <div key={cand.id} className="rounded-xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition-shadow dark:bg-slate-900 flex flex-col justify-between h-full">
                    <div>
                      {/* Name / Avatar Row */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-brand-primary-bg text-brand-primary flex items-center justify-center font-black text-xs uppercase dark:bg-brand-card-dark">
                            {cand.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm">{cand.name}</h4>
                            <p className="text-[10px] text-brand-muted-text leading-tight mt-0.5">{cand.email}</p>
                          </div>
                        </div>

                        {/* Match circular gauge */}
                        <div className="relative h-10 w-10 flex items-center justify-center select-none">
                          <svg className="h-full w-full -rotate-90">
                            <circle
                              className="stroke-slate-100 dark:stroke-slate-800"
                              strokeWidth="3"
                              fill="transparent"
                              r={radius}
                              cx="20"
                              cy="20"
                            />
                            <circle
                              className={cn(
                                "transition-all duration-300",
                                cand.score >= 75 ? "stroke-emerald-500" : cand.score >= 50 ? "stroke-amber-500" : "stroke-rose-500"
                              )}
                              strokeWidth="3"
                              strokeDasharray={circ}
                              strokeDashoffset={dashoffset}
                              strokeLinecap="round"
                              fill="transparent"
                              r={radius}
                              cx="20"
                              cy="20"
                            />
                          </svg>
                          <span className={cn(
                            "absolute text-[10px] font-black",
                            cand.score >= 75 ? "text-emerald-500" : cand.score >= 50 ? "text-amber-500" : "text-rose-500"
                          )}>
                            {cand.score}%
                          </span>
                        </div>
                      </div>

                      {/* Skills tags */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {cand.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-brand-muted-text">
                            {skill}
                          </span>
                        ))}
                        {cand.skills.length > 3 && (
                          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[9px] font-bold text-brand-muted-text">
                            +{cand.skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stage status buttons */}
                    <div className="border-t border-border/40 pt-4 flex items-center justify-between">
                      {/* Interview status badge */}
                      <span className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border",
                        cand.interviewStatus === "Completed" && "bg-emerald-50 border-emerald-100/30 text-brand-success dark:bg-emerald-950/20",
                        cand.interviewStatus === "Suspended" && "bg-rose-50 border-rose-100/30 text-brand-danger dark:bg-rose-950/20",
                        cand.interviewStatus === "Pending" && cand.stage === "Interview" && "bg-blue-50 border-blue-100/30 text-brand-primary dark:bg-blue-950/20",
                        cand.interviewStatus === "Pending" && cand.stage !== "Interview" && "bg-slate-100 border-slate-200 text-brand-muted-text dark:bg-slate-800 dark:border-slate-700"
                      )}>
                        {cand.interviewStatus}
                      </span>

                      {/* Dynamic Action Button */}
                      {cand.interviewStatus === "Completed" ? (
                        <Link
                          href="/reports"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-success hover:underline cursor-pointer"
                        >
                          <FileCheck className="h-3.5 w-3.5" /> View Report
                        </Link>
                      ) : cand.interviewStatus === "Suspended" ? (
                        <Link
                          href="/reports"
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-danger hover:underline cursor-pointer"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" /> View Report
                        </Link>
                      ) : cand.stage === "Interview" ? (
                        <span className="text-[11px] font-bold text-brand-muted-text flex items-center gap-1 select-none">
                          <Clock className="h-3.5 w-3.5" /> Invite Sent
                        </span>
                      ) : (
                        <button
                          onClick={() => router.push(`/interviews/configure/${cand.id}`)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-primary hover:underline border-none bg-transparent cursor-pointer"
                        >
                          <Mail className="h-3.5 w-3.5" /> Configure Invite
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      ) : (
        /* TAB CONTENT DETAILS */
        <div className="grid gap-6 md:grid-cols-3 items-start">
          
          {/* Left Block: Description requirements */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Description card */}
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold tracking-tight">Job Description</h3>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent hover:text-foreground cursor-pointer text-brand-muted-text flex items-center gap-1 text-xs font-bold"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Job
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                {currentJob.description}
              </p>
            </div>

            {/* Skills lists cards */}
            <div className="grid gap-6 sm:grid-cols-2">
              
              {/* Required Skills */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Required Tech Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentJob.requiredSkills?.map(skill => (
                    <span key={skill} className="rounded-full bg-brand-primary-bg dark:bg-brand-card-dark px-3 py-1 text-xs font-semibold text-brand-primary">
                      {skill}
                    </span>
                  )) || <span className="text-xs text-brand-muted-text">None specified.</span>}
                </div>
              </div>

              {/* Nice to have */}
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm dark:bg-slate-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">
                  Nice-to-Have Skills
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentJob.niceToHaveSkills?.map(skill => (
                    <span key={skill} className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {skill}
                    </span>
                  )) || <span className="text-xs text-brand-muted-text">None specified.</span>}
                </div>
              </div>

            </div>

          </div>

          {/* Right Block: Interview config */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm dark:bg-slate-900 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-2">
              <Shield className="h-4.5 w-4.5" /> Proctoring Configurations
            </h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between border-b border-border/40 pb-3">
                <span className="text-brand-muted-text">Experience Level</span>
                <span className="text-foreground font-extrabold uppercase">{currentJob.experienceLevel || "Senior"}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-3">
                <span className="text-brand-muted-text">Questions count</span>
                <span className="text-foreground font-extrabold">{currentJob.questionCount || 8} Questions</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-3">
                <span className="text-brand-muted-text">Allowed duration</span>
                <span className="text-foreground font-extrabold">{currentJob.timeLimit || 15} minutes</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-3">
                <span className="text-brand-muted-text">Question Topics</span>
                <span className="text-foreground font-extrabold truncate max-w-[150px]">
                  {currentJob.questionTypes?.join(", ") || "Technical, Behavioral"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-brand-muted-text">Webcam Proctoring</span>
                <span className={cn(
                  "inline-flex items-center gap-0.5 rounded px-2 py-0.5 text-[10px] font-bold border",
                  currentJob.proctoringEnabled !== false 
                    ? "bg-emerald-50 border-emerald-100 text-brand-success" 
                    : "bg-slate-100 border-slate-200 text-brand-muted-text"
                )}>
                  {currentJob.proctoringEnabled !== false ? "ENABLED" : "DISABLED"}
                </span>
              </div>
            </div>
          </div>

        </div>
      )}



      {/* Edit Job Modal Form */}
      <CreateJobModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        editingJob={currentJob as any}
        onSave={(updatedJob) => updateJobMutation.mutate({ id: currentJob.id, data: updatedJob })}
      />

    </div>
  )
}
