"use client"

import React from "react"
import { Bot, CheckCircle } from "lucide-react"

export function CompletionScreen() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 animate-fade-in text-center">
      {/* Inline styles for custom drawing checkmark animation */}
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

        .checkmark {
          width: 80px;
          height: 80px;
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
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 40px #16A34A;
          }
        }
      `}} />

      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-border rounded-2xl p-8 md:p-10 shadow-xl space-y-8 flex flex-col items-center transition-colors duration-300">
        
        {/* Animated Checkmark Wrapper */}
        <div className="flex items-center justify-center">
          <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Interview Submitted!
          </h1>
          <p className="text-sm text-brand-muted-text max-w-sm">
            Your responses have been recorded and will be reviewed by the hiring team.
          </p>
        </div>

        {/* Recruiter notice card */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-border text-xs text-brand-muted-text space-y-2.5 w-full text-left">
          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Bot className="h-4 w-4 text-brand-primary shrink-0" />
            AI Assessment Initialized
          </div>
          <p className="leading-relaxed">
            Our automated grading engine has begun processing your answers against key skill criteria. The final scorecard will be visible on the recruiter dashboard shortly.
          </p>
        </div>

        {/* Close Window Instruction */}
        <div className="text-xs font-bold text-brand-primary bg-brand-primary-bg dark:bg-brand-primary/10 px-3.5 py-1.5 rounded-full uppercase tracking-wider animate-pulse">
          You may close this window
        </div>
      </div>
    </div>
  )
}
