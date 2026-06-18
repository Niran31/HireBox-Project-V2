import React from "react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { 
  Users, 
  Briefcase, 
  Video, 
  Award, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  Bot
} from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/25">
              <Bot className="h-5 w-5" />
            </div>
            <span className="font-sans font-bold tracking-tight text-xl">
              Hire<span className="text-brand-primary">Box</span>
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-brand-primary-bg px-2 py-0.5 text-xs font-semibold text-brand-primary dark:bg-brand-card-dark dark:text-brand-primary">
              SaaS v2.0
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-brand-muted-text">
            <a href="#" className="hover:text-foreground transition-colors">Dashboard</a>
            <a href="#" className="hover:text-foreground transition-colors">Jobs</a>
            <a href="#" className="hover:text-foreground transition-colors">Interviews</a>
            <a href="#" className="hover:text-foreground transition-colors">Analytics</a>
          </nav>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="hidden sm:inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
              Recruiter Portal
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-20 lg:py-28">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-primary/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-brand-primary-bg/20 dark:bg-brand-primary/5 blur-3xl" />

          <div className="container mx-auto px-6 text-center lg:text-left">
            <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
              <div className="space-y-6 lg:col-span-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-primary-bg px-3 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-card-dark/80">
                  <Sparkles className="h-3 w-3" />
                  <span>Next-Generation AI Screening</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Hire the best talent <br />
                  <span className="bg-gradient-to-r from-brand-primary to-blue-500 bg-clip-text text-transparent">
                    10x faster with AI.
                  </span>
                </h1>
                
                <p className="text-lg text-brand-muted-text max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  An enterprise-ready SaaS recruiting platform combining automated resume analysis, semantic ranking, and interactive AI-proctored video assessments.
                </p>

                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-6 py-3 font-semibold text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 font-semibold hover:bg-accent hover:text-accent-foreground hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
                    Book a Demo
                  </button>
                </div>
              </div>

              {/* Dynamic Interactive Dashboard Preview Card */}
              <div className="lg:col-span-6">
                <div className="relative mx-auto max-w-xl rounded-xl border border-border bg-card p-6 shadow-2xl transition-all hover:shadow-brand-primary/5">
                  <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-4">
                    <div>
                      <h3 className="font-bold tracking-tight text-lg">Senior Fullstack Engineer</h3>
                      <p className="text-xs text-brand-muted-text flex items-center gap-1 mt-0.5">
                        <Briefcase className="h-3 w-3" />
                        Engineering Department • 14 Applicants
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-primary-bg px-2.5 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-card-dark">
                      Active
                    </span>
                  </div>

                  {/* Applicants List Mockup */}
                  <div className="space-y-3">
                    {/* Candidate 1 */}
                    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background/50 p-3 hover:bg-accent/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary-bg text-brand-primary font-bold text-sm dark:bg-brand-card-dark">
                          JD
                        </div>
                        <div>
                          <p className="font-semibold text-sm">John Doe</p>
                          <p className="text-xs text-brand-muted-text">john.doe@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-brand-success flex items-center justify-end gap-1">
                            <Zap className="h-3 w-3 fill-current" />
                            94% Match
                          </p>
                          <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-semibold text-brand-success">
                            Completed
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-brand-muted-text group-hover:text-foreground transition-all group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Candidate 2 */}
                    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background/50 p-3 hover:bg-accent/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 font-bold text-sm dark:bg-yellow-950/30 dark:text-yellow-500">
                          AS
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Alice Smith</p>
                          <p className="text-xs text-brand-muted-text">alice.s@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-brand-primary flex items-center justify-end gap-1">
                            <Zap className="h-3 w-3 fill-current" />
                            88% Match
                          </p>
                          <span className="inline-flex items-center rounded-full bg-brand-primary-bg px-2 py-0.5 text-[10px] font-semibold text-brand-primary dark:bg-brand-card-dark">
                            In Progress
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-brand-muted-text group-hover:text-foreground transition-all group-hover:translate-x-0.5" />
                      </div>
                    </div>

                    {/* Candidate 3 */}
                    <div className="flex items-center justify-between rounded-xl border border-border/80 bg-background/50 p-3 hover:bg-accent/30 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold text-sm dark:bg-rose-950/30 dark:text-rose-500">
                          RJ
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Richard Johnson</p>
                          <p className="text-xs text-brand-muted-text">r.johnson@example.com</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-brand-danger flex items-center justify-end gap-1">
                            <Zap className="h-3 w-3 fill-current" />
                            42% Match
                          </p>
                          <span className="inline-flex items-center rounded-full bg-rose-100 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-semibold text-brand-danger">
                            Suspended
                          </span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-brand-muted-text group-hover:text-foreground transition-all group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-brand-muted-text border-t border-border/60 pt-4">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Updated 2m ago</span>
                    <a href="#" className="font-semibold text-brand-primary hover:underline flex items-center gap-0.5">
                      View All Candidates <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="py-20 bg-muted/30 border-y border-border/40">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tight">Full-Cycle Recruitment Automation</h2>
              <p className="text-brand-muted-text">Everything you need to source, rank, proctor, and evaluate technical candidates seamlessly.</p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="font-bold tracking-tight text-lg mb-2">Resume Parsing</h3>
                <p className="text-sm text-brand-muted-text leading-relaxed font-normal">
                  Automatic metadata extraction from PDF and DOCX files using local regex and advanced LLM matching fallbacks.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="font-bold tracking-tight text-lg mb-2">Semantic Ranking</h3>
                <p className="text-sm text-brand-muted-text leading-relaxed font-normal">
                  Batch ranking scores powered by Gemini, matching candidate experience and skills directly to your Job Description.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                <div className="h-12 w-12 rounded-lg bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6" />
                </div>
                <h3 className="font-bold tracking-tight text-lg mb-2">Smart Proctoring</h3>
                <p className="text-sm text-brand-muted-text leading-relaxed font-normal">
                  Real-time face tracking and mobile phone detection powered by a custom YOLOv8 model directly inside the browser session.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all">
                <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="font-bold tracking-tight text-lg mb-2">AI-Driven Grading</h3>
                <p className="text-sm text-brand-muted-text leading-relaxed font-normal">
                  Comprehensive performance cards, transcripts, emotion profiles, speech speed markers, and executive feedback summaries.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-brand-muted-text">
          <p>© {new Date().getFullYear()} HireBox Corporation. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
            <a href="#" className="hover:text-foreground">Support</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
