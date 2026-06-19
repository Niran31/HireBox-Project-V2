"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { api } from "@/lib/api"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Bot, Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextRoute = searchParams.get("next") || "/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Clear previous errors when typing
  useEffect(() => {
    if (error) setError(null)
  }, [email, password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Fetch JWT via proxy route (which sets httpOnly cookie for middleware)
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe })
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.message || "Invalid username/email or password.")
      }

      const data = await res.json()
      
      // Store JWT in localStorage for front-end API headers
      api.setToken(data.token)

      // Redirect to next path or default dashboard
      router.push(nextRoute)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Network error. Make sure Flask server is running.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-brand-primary/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-96 w-96 rounded-full bg-brand-primary/5 blur-3xl" />

      {/* Floating Theme Controller */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-2xl border border-border/40 shadow-xl shadow-slate-100/50 dark:shadow-slate-950/50">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-lg shadow-brand-primary/20">
            <Bot className="h-6 w-6 animate-pulse" />
          </div>
          <h2 className="mt-4 text-3xl font-sans font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome to Hire<span className="text-brand-primary">Box</span>
          </h2>
          <p className="mt-2 text-sm text-brand-muted-text">
            Sign in to manage your AI candidate pipelines
          </p>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/20 p-4 border border-rose-200/50 dark:border-rose-800/30 flex gap-3 text-sm text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Username or Email
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="recruiter@hirebox.ai"
                  className="block w-full pl-10 pr-3 py-2.5 bg-zinc-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-brand-primary hover:underline">
                  Forgot Password?
                </a>
              </div>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-zinc-50 dark:bg-slate-800/50 border border-border/60 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary bg-zinc-50 dark:bg-slate-800/50"
              />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                Remember me
              </span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-brand-primary hover:bg-brand-primary/95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary cursor-pointer disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-brand-primary/10"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-slate-950">
        <div className="h-8 w-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

