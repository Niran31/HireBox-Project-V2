"use client"

import React, { useState } from "react"
import { Candidate, MOCK_JOBS } from "@/lib/mock-data"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AddCandidateModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (candidate: Omit<Candidate, "id" | "date" | "status" | "interviewStatus">) => void
}

export function AddCandidateModal({ open, onOpenChange, onAdd }: AddCandidateModalProps) {
  const [name, setName] = useState("")
  const [role, setRole] = useState("")
  const [jobId, setJobId] = useState(MOCK_JOBS[0]?.id || "")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [score, setScore] = useState(80)
  const [skills, setSkills] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email) {
      alert("Name and Email are required.")
      return
    }

    // Find role title based on selected jobId
    const selectedJob = MOCK_JOBS.find(j => j.id === jobId)
    const finalRole = selectedJob ? selectedJob.title : role || "Job Applicant"

    onAdd({
      name,
      role: finalRole,
      jobId,
      email,
      phone: phone || "+1 555 010 0000",
      score: Number(score) || 75,
      stage: "Applied",
      skills: skills ? skills.split(",").map(s => s.trim()) : ["Teamwork"],
    })

    // Reset Form
    setName("")
    setEmail("")
    setPhone("")
    setScore(80)
    setSkills("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 border border-border p-6 rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight">Add New Candidate</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Candidate Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600"
            />
          </div>

          {/* Job Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Applying For</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none font-medium dark:bg-slate-800 dark:border-slate-600"
            >
              {MOCK_JOBS.map((job) => (
                <option key={job.id} value={job.id}>
                  {job.title}
                </option>
              ))}
            </select>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 555 000 0000"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Resume Score */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Resume Match %</label>
              <input
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600"
              />
            </div>

            {/* Skills */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Skills (comma separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, AWS"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none dark:bg-slate-800 dark:border-slate-600"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-3 border-t border-border/40">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary/95 cursor-pointer"
            >
              Add Candidate
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
