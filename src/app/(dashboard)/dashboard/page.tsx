import React from "react"
import { 
  Users, 
  Briefcase, 
  Video, 
  FileText,
  TrendingUp,
  Plus,
  ArrowUpRight,
  UserCheck,
  Calendar,
  AlertTriangle
} from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome back, Niranjan</h2>
          <p className="text-sm text-brand-muted-text">Here is what's happening with your recruitment pipelines today.</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer">
          <Plus className="h-4 w-4" />
          Create New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Stat 1 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand-muted-text">Active Jobs</span>
            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight">12</h3>
            <p className="text-xs text-brand-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+2 new this week</span>
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand-muted-text">Total Candidates</span>
            <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/45 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight">348</h3>
            <p className="text-xs text-brand-success flex items-center gap-1 mt-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+18% month-over-month</span>
            </p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand-muted-text">Interviews Conducted</span>
            <div className="h-9 w-9 rounded-lg bg-purple-100 dark:bg-purple-950/45 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Video className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight">84</h3>
            <p className="text-xs text-brand-muted-text flex items-center gap-1 mt-1">
              <span>92% completion rate</span>
            </p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-brand-muted-text">Suspicious Flag Alert</span>
            <div className="h-9 w-9 rounded-lg bg-rose-100 dark:bg-rose-950/45 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold tracking-tight">3</h3>
            <p className="text-xs text-brand-danger flex items-center gap-1 mt-1">
              <span>Integrity suspensions</span>
            </p>
          </div>
        </div>

      </div>

      {/* Main Grid: Pipeline and Alerts */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Pipeline (Col span 8) */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold tracking-tight">Top Candidates Pipeline</h3>
              <p className="text-sm text-brand-muted-text">Candidates with highest cumulative screening and interview scores.</p>
            </div>
            <button className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-0.5 cursor-pointer">
              View pipeline <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/60 text-xs text-brand-muted-text font-bold uppercase">
                  <th className="pb-3 font-semibold">Candidate</th>
                  <th className="pb-3 font-semibold">Applied Role</th>
                  <th className="pb-3 font-semibold text-right">Resume Match</th>
                  <th className="pb-3 font-semibold text-right">Interview Score</th>
                  <th className="pb-3 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm">
                
                {/* Row 1 */}
                <tr className="hover:bg-accent/10 transition-colors">
                  <td className="py-3.5 font-semibold">John Doe</td>
                  <td className="py-3.5 text-brand-muted-text">Senior Fullstack Engineer</td>
                  <td className="py-3.5 text-right text-brand-success font-semibold">94%</td>
                  <td className="py-3.5 text-right font-bold">91.5 / 100</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-brand-success">
                      Strong Hire
                    </span>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr className="hover:bg-accent/10 transition-colors">
                  <td className="py-3.5 font-semibold">Alice Smith</td>
                  <td className="py-3.5 text-brand-muted-text">DevOps Engineer</td>
                  <td className="py-3.5 text-right text-brand-primary font-semibold">88%</td>
                  <td className="py-3.5 text-right font-bold">85.0 / 100</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/40 px-2.5 py-0.5 text-xs font-semibold text-brand-primary">
                      Consider
                    </span>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr className="hover:bg-accent/10 transition-colors">
                  <td className="py-3.5 font-semibold">Devon Lane</td>
                  <td className="py-3.5 text-brand-muted-text">UI/UX Designer</td>
                  <td className="py-3.5 text-right text-brand-success font-semibold">96%</td>
                  <td className="py-3.5 text-right font-bold">82.3 / 100</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2.5 py-0.5 text-xs font-semibold text-brand-success">
                      Strong Hire
                    </span>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr className="hover:bg-accent/10 transition-colors">
                  <td className="py-3.5 font-semibold">Esther Howard</td>
                  <td className="py-3.5 text-brand-muted-text">Product Manager</td>
                  <td className="py-3.5 text-right text-brand-warning font-semibold">74%</td>
                  <td className="py-3.5 text-right font-bold">59.8 / 100</td>
                  <td className="py-3.5 text-right">
                    <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-950/40 px-2.5 py-0.5 text-xs font-semibold text-brand-warning">
                      Consider
                    </span>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule & Activities (Col span 4) */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight">Upcoming Interviews</h3>
            <p className="text-sm text-brand-muted-text">AI scheduled video interviews for today.</p>
          </div>

          <div className="space-y-4">
            
            {/* Event 1 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-slate-900/60">
              <Calendar className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Robert Fox</p>
                <p className="text-xs text-brand-muted-text">Frontend Engineer Candidate</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-brand-primary bg-brand-primary-bg dark:bg-brand-card-dark px-2 py-0.5 rounded">
                  2:30 PM - 3:00 PM
                </span>
              </div>
            </div>

            {/* Event 2 */}
            <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-slate-900/60">
              <Calendar className="h-5 w-5 text-brand-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Jane Cooper</p>
                <p className="text-xs text-brand-muted-text">Backend Lead Candidate</p>
                <span className="inline-block mt-2 text-[10px] font-bold text-brand-primary bg-brand-primary-bg dark:bg-brand-card-dark px-2 py-0.5 rounded">
                  4:00 PM - 4:30 PM
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
