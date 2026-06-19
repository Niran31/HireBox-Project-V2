"use client"

import React, { useEffect, useState } from "react"
import { Bot, Sparkles } from "lucide-react"

interface CompletionScreenProps {
  candidateName?: string
}

export function CompletionScreen({ candidateName }: CompletionScreenProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Delay text content to let the checkmark animation play first
    const timer = setTimeout(() => setShowContent(true), 1200)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Inline styles for SVG checkmark drawing animation */}
      <style dangerouslySetInnerHTML={{__html: `
        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #16A34A;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark-svg {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #fff;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #16A34A;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s forwards;
        }

        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }

        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }

        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 44px #16A34A; }
        }

        .completion-fade-in {
          opacity: 0;
          transform: translateY(12px);
          animation: fadeSlideUp 0.5s ease-out forwards;
          animation-delay: 1.2s;
        }

        @keyframes fadeSlideUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}} />

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-border rounded-2xl p-8 md:p-10 shadow-xl flex flex-col items-center transition-colors duration-300 space-y-0">

        {/* Animated Checkmark */}
        <div className="flex items-center justify-center mb-6">
          <svg className="checkmark-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        {/* Confetti burst ring (CSS only) */}
        <div className="completion-fade-in space-y-6 w-full flex flex-col items-center">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Interview Complete!
            </h1>
            <p className="text-sm text-brand-muted-text max-w-xs mx-auto leading-relaxed">
              {candidateName
                ? `Great job, ${candidateName}! Your responses have been securely submitted and will be reviewed by the hiring team.`
                : "Your responses have been securely submitted and will be reviewed by the hiring team."
              }
            </p>
          </div>

          {/* AI Assessment card */}
          <div className="bg-gradient-to-br from-brand-primary-bg to-blue-50 dark:from-brand-primary/5 dark:to-slate-900/60 p-5 rounded-xl border border-brand-primary/10 dark:border-brand-primary/20 text-xs w-full text-left space-y-3">
            <div className="flex items-center gap-2 font-bold text-brand-primary">
              <div className="h-7 w-7 rounded-lg bg-brand-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              AI Assessment Initialized
            </div>
            <p className="text-brand-muted-text leading-relaxed">
              Our automated grading engine has begun analyzing your responses against key competency criteria. The recruiter will receive your scorecard with detailed breakdowns shortly.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-1.5 text-brand-primary/70">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold">Scoring</span>
              </div>
              <div className="flex-1 bg-brand-primary/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-brand-primary h-full rounded-full w-1/4 animate-pulse" />
              </div>
              <span className="text-brand-muted-text font-bold text-[10px]">Processing...</span>
            </div>
          </div>

          {/* Thank you message */}
          <div className="text-xs font-bold text-brand-primary bg-brand-primary-bg dark:bg-brand-primary/10 px-4 py-2 rounded-full uppercase tracking-wider animate-pulse">
            You may close this window
          </div>
        </div>
      </div>

      {/* Bottom attribution */}
      <p className="mt-6 text-[10px] text-brand-muted-text font-medium">
        Powered by HireBox AI — Intelligent Recruitment Platform
      </p>
    </div>
  )
}
