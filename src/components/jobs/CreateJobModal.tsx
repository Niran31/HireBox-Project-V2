"use client"

import React, { useState, useEffect } from "react"
import { Job } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  X, 
  Briefcase, 
  Settings, 
  FileText, 
  Bot, 
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check
} from "lucide-react"

interface CreateJobModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (job: Omit<Job, "candidates" | "topScore" | "created">) => void
  editingJob: Job | null
}

export function CreateJobModal({ open, onOpenChange, onSave, editingJob }: CreateJobModalProps) {
  const [step, setStep] = useState(1)

  // Step 1 States: Details
  const [title, setTitle] = useState("")
  const [department, setDepartment] = useState<Job["department"]>("Engineering")
  const [type, setType] = useState<Job["type"]>("Full-time")
  const [location, setLocation] = useState("")
  const [salaryMin, setSalaryMin] = useState<string>("")
  const [salaryMax, setSalaryMax] = useState<string>("")
  const [currency, setCurrency] = useState("USD")

  // Step 2 States: Description & Skills
  const [description, setDescription] = useState("")
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [reqSkillInput, setReqSkillInput] = useState("")
  const [niceSkills, setNiceSkills] = useState<string[]>([])
  const [niceSkillInput, setNiceSkillInput] = useState("")
  const [experienceLevel, setExperienceLevel] = useState<"Entry" | "Mid" | "Senior" | "Lead">("Mid")

  // Step 3 States: Interview Config
  const [questionCount, setQuestionCount] = useState(8)
  const [questionTypes, setQuestionTypes] = useState<string[]>(["Technical", "Behavioral"])
  const [timeLimit, setTimeLimit] = useState(15)
  const [proctoringEnabled, setProctoringEnabled] = useState(true)
  const [showPreviews, setShowPreviews] = useState(false)

  // Errors validation states
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  // Populate data if editing
  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title)
      setDepartment(editingJob.department)
      setType(editingJob.type)
      setLocation(editingJob.location)
      setSalaryMin(editingJob.salaryMin?.toString() || "")
      setSalaryMax(editingJob.salaryMax?.toString() || "")
      setCurrency(editingJob.currency || "USD")
      setDescription(editingJob.description || "")
      setRequiredSkills(editingJob.requiredSkills || [])
      setNiceSkills(editingJob.niceToHaveSkills || [])
      setExperienceLevel(editingJob.experienceLevel || "Mid")
      setQuestionCount(editingJob.questionCount || 8)
      setQuestionTypes(editingJob.questionTypes || ["Technical", "Behavioral"])
      setTimeLimit(editingJob.timeLimit || 15)
      setProctoringEnabled(editingJob.proctoringEnabled ?? true)
    } else {
      // Reset
      setTitle("")
      setDepartment("Engineering")
      setType("Full-time")
      setLocation("")
      setSalaryMin("")
      setSalaryMax("")
      setCurrency("USD")
      setDescription("")
      setRequiredSkills([])
      setNiceSkills([])
      setExperienceLevel("Mid")
      setQuestionCount(8)
      setQuestionTypes(["Technical", "Behavioral"])
      setTimeLimit(15)
      setProctoringEnabled(true)
    }
    setStep(1)
    setErrors({})
    setShowPreviews(false)
  }, [editingJob, open])

  // Handle Required Skill Tag submission on Enter
  const handleAddReqSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const val = reqSkillInput.trim()
      if (val && !requiredSkills.includes(val)) {
        setRequiredSkills([...requiredSkills, val])
        setReqSkillInput("")
      }
    }
  }

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill))
  }

  // Handle Nice-to-have Skill Tag submission on Enter
  const handleAddNiceSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const val = niceSkillInput.trim()
      if (val && !niceSkills.includes(val)) {
        setNiceSkills([...niceSkills, val])
        setNiceSkillInput("")
      }
    }
  }

  const handleRemoveNiceSkill = (skill: string) => {
    setNiceSkills(niceSkills.filter(s => s !== skill))
  }

  // Handle Question Type checkboxes
  const handleTypeCheckbox = (type: string) => {
    if (questionTypes.includes(type)) {
      setQuestionTypes(questionTypes.filter(t => t !== type))
    } else {
      setQuestionTypes([...questionTypes, type])
    }
  }

  // Step Validation logic
  const validateStep = (currentStep: number) => {
    const newErrors: { [key: string]: string } = {}
    
    if (currentStep === 1) {
      if (!title.trim()) newErrors.title = "Job Title is required."
      if (!location.trim()) newErrors.location = "Job Location is required."
    } else if (currentStep === 2) {
      if (!description.trim() || description.length < 20) {
        newErrors.description = "A comprehensive job description (min 20 characters) is required."
      }
      if (requiredSkills.length === 0) {
        newErrors.requiredSkills = "Add at least one required skill tag."
      }
    } else if (currentStep === 3) {
      if (questionTypes.length === 0) {
        newErrors.questionTypes = "Select at least one interview question type."
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handlePost = () => {
    if (validateStep(3)) {
      onSave({
        id: editingJob?.id || "",
        title,
        status: editingJob?.status || "Active",
        department,
        location,
        type,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        currency,
        description,
        requiredSkills,
        niceToHaveSkills: niceSkills,
        experienceLevel,
        questionCount,
        questionTypes,
        timeLimit,
        proctoringEnabled,
      })
      onOpenChange(false)
    }
  }

  // Mock Question Previews
  const mockQuestions = [
    "Explain your experience with Next.js, Server Components, and App Router architectures.",
    "Describe a challenging bug you debugged in production and how you handled the resolution.",
    "How do you organize CSS style guides and Tailwind utility tokens in large-scale projects?",
    "Why are you interested in joining the HireBox platform development team?",
    "How do you approach code reviews when there are architectural disagreements?"
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-white dark:bg-slate-900 border border-border p-6 rounded-xl overflow-y-auto max-h-[85vh]">
        <DialogHeader className="border-b border-border/40 pb-4">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {editingJob ? "Edit Job Posting" : "Post a New Job"}
          </DialogTitle>
          
          {/* Progress Steps Indicator */}
          <div className="flex items-center justify-between mt-4 max-w-sm mx-auto">
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"
              }`}>1</span>
              <span className="text-xs font-semibold">Details</span>
            </div>
            <div className="h-0.5 w-12 bg-border" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"
              }`}>2</span>
              <span className="text-xs font-semibold">Description</span>
            </div>
            <div className="h-0.5 w-12 bg-border" />
            <div className="flex items-center gap-2">
              <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? "bg-brand-primary text-white" : "bg-slate-100 text-slate-500"
              }`}>3</span>
              <span className="text-xs font-semibold">Interview</span>
            </div>
          </div>
        </DialogHeader>

        {/* Multi-step Form Content */}
        <div className="py-4 space-y-4">
          
          {/* STEP 1: Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Job Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Architect"
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary ${
                    errors.title ? "border-brand-danger" : "border-border"
                  }`}
                />
                {errors.title && <p className="text-[10px] text-brand-danger font-bold">{errors.title}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Department *</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none font-medium focus:ring-1 focus:ring-brand-primary"
                  >
                    {["Engineering", "Design", "Marketing", "Sales", "HR", "Finance", "Other"].map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none font-medium focus:ring-1 focus:ring-brand-primary"
                  >
                    {["Full-time", "Part-time", "Contract", "Remote"].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Location *</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. New York, NY or remote"
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary ${
                    errors.location ? "border-brand-danger" : "border-border"
                  }`}
                />
                {errors.location && <p className="text-[10px] text-brand-danger font-bold">{errors.location}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Salary Range (Optional)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="Min Salary"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <span className="text-brand-muted-text">to</span>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="Max Salary"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="rounded-lg border border-border bg-background px-2.5 py-2 text-sm outline-none font-semibold focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Description & Skills */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Job Description *</label>
                  <span className="text-[10px] text-brand-muted-text font-medium">Supports markdown styles</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide core roles, goals, and day-to-day requirements..."
                  rows={5}
                  className={`w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-primary font-sans leading-relaxed ${
                    errors.description ? "border-brand-danger" : "border-border"
                  }`}
                />
                {errors.description && <p className="text-[10px] text-brand-danger font-bold">{errors.description}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Required Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Required Skills *</label>
                  <input
                    type="text"
                    value={reqSkillInput}
                    onChange={(e) => setReqSkillInput(e.target.value)}
                    onKeyDown={handleAddReqSkill}
                    placeholder="Type skill & press Enter"
                    className={`w-full rounded-lg border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-primary ${
                      errors.requiredSkills ? "border-brand-danger" : "border-border"
                    }`}
                  />
                  {errors.requiredSkills && <p className="text-[10px] text-brand-danger font-bold">{errors.requiredSkills}</p>}
                  
                  {/* Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {requiredSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 bg-brand-primary-bg text-brand-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {skill}
                        <X className="h-3 w-3 cursor-pointer hover:text-brand-danger" onClick={() => handleRemoveReqSkill(skill)} />
                      </span>
                    ))}
                  </div>
                </div>

                {/* Nice to have Tags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Nice-to-Have Skills</label>
                  <input
                    type="text"
                    value={niceSkillInput}
                    onChange={(e) => setNiceSkillInput(e.target.value)}
                    onKeyDown={handleAddNiceSkill}
                    placeholder="Type skill & press Enter"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {niceSkills.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {skill}
                        <X className="h-3 w-3 cursor-pointer hover:text-brand-danger" onClick={() => handleRemoveNiceSkill(skill)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none font-medium focus:ring-1 focus:ring-brand-primary"
                >
                  {["Entry", "Mid", "Senior", "Lead"].map(level => (
                    <option key={level} value={level}>{level} Level</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Interview Config */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* Question Count Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-brand-muted-text">
                  <span>Number of Questions</span>
                  <span className="text-brand-primary font-black">{questionCount}</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-brand-primary h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 cursor-pointer"
                />
              </div>

              {/* Question Types checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text block">Question Evaluation Types *</label>
                {errors.questionTypes && <p className="text-[10px] text-brand-danger font-bold mb-1">{errors.questionTypes}</p>}
                
                <div className="grid grid-cols-2 gap-3">
                  {["Technical", "Behavioral", "Situational", "Culture Fit"].map(qt => {
                    const checked = questionTypes.includes(qt)
                    return (
                      <button
                        type="button"
                        key={qt}
                        onClick={() => handleTypeCheckbox(qt)}
                        className={`flex items-center justify-between border rounded-lg p-3 text-xs font-bold text-left transition-all cursor-pointer ${
                          checked 
                            ? "border-brand-primary bg-brand-primary-bg dark:bg-brand-card-dark text-brand-primary" 
                            : "border-border hover:bg-accent/40"
                        }`}
                      >
                        <span>{qt}</span>
                        {checked && <Check className="h-4 w-4" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Time Limits */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">Time Limit Per Question</label>
                  <select
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    {[5, 10, 15, 20].map(time => (
                      <option key={time} value={time}>{time} Minutes</option>
                    ))}
                  </select>
                </div>

                {/* Enable Proctoring switch */}
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-muted-text block">AI Proctoring checks</label>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setProctoringEnabled(!proctoringEnabled)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none",
                        proctoringEnabled ? "bg-brand-primary" : "bg-slate-300 dark:bg-slate-700"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                          proctoringEnabled ? "translate-x-4" : "translate-x-0"
                        )}
                      />
                    </button>
                    <span className="text-xs font-semibold text-brand-muted-text">
                      {proctoringEnabled ? "Camera active (webcam check)" : "Camera deactivated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview button */}
              <div className="border-t border-border/40 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreviews(!showPreviews)}
                  className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-brand-primary bg-brand-primary-bg dark:bg-brand-card-dark py-2 px-3 rounded-lg hover:opacity-90 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 animate-spin-slow" />
                  <span>{showPreviews ? "Hide Generated Questions" : "Preview Generated Questions"}</span>
                </button>

                {showPreviews && (
                  <div className="mt-3 p-3 bg-zinc-50 dark:bg-slate-900/60 rounded-xl space-y-2 border border-border/60 max-h-[150px] overflow-y-auto">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1">
                      <Bot className="h-3.5 w-3.5" />
                      <span>Gemini AI Generated Pipeline (Preview)</span>
                    </p>
                    <ul className="text-xs space-y-2 divide-y divide-border/40 pt-1">
                      {mockQuestions.slice(0, Math.min(questionCount, 5)).map((q, qidx) => (
                        <li key={qidx} className="pt-2 first:pt-0 text-brand-muted-text truncate leading-relaxed">
                          Q{qidx + 1}: {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Modal Navigation Buttons */}
        <div className="border-t border-border/40 pt-4 flex justify-between items-center mt-4">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-accent cursor-pointer"
            >
              Cancel
            </button>
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/95 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePost}
                className="rounded-lg bg-brand-primary px-5 py-2 text-sm font-semibold text-white shadow hover:bg-brand-primary/95 cursor-pointer"
              >
                {editingJob ? "Save Changes" : "Post Job"}
              </button>
            )}
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}
