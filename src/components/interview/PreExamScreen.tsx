"use client"

import React, { useState, useRef } from "react"
import { 
  Camera, 
  Mic, 
  Wifi, 
  Volume2, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react"

interface PreExamScreenProps {
  role: string
  company: string
  onStart: (stream: MediaStream | null) => void
}

export function PreExamScreen({ role, company, onStart }: PreExamScreenProps) {
  const [webcamGranted, setWebcamGranted] = useState(false)
  const [micGranted, setMicGranted] = useState(false)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [isTesting, setIsTesting] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  const requestPermissions = async () => {
    setIsTesting(true)
    setPermissionError(null)
    try {
      // Request both audio and video
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      
      setWebcamGranted(true)
      setMicGranted(true)
      setMediaStream(stream)
      
      // Assign to video element for live preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      console.error("Error accessing camera/mic:", err)
      setPermissionError(
        "Could not access camera or microphone. Please make sure they are connected and you have granted permission in your browser settings."
      )
      setWebcamGranted(false)
      setMicGranted(false)
    } finally {
      setIsTesting(false)
    }
  }

  const handleStartClick = () => {
    if (webcamGranted && micGranted) {
      onStart(mediaStream)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-12 gap-0 transition-colors duration-300">
        
        {/* Left Panel: Camera preview & checklist (7 columns) */}
        <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border">
          <div>
            {/* Header / Logo */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-bold text-base shadow-md">
                H
              </div>
              <span className="font-sans font-bold tracking-tight text-base">
                Hire<span className="text-brand-primary">Box</span> AI
              </span>
            </div>

            <div className="space-y-2 mb-6">
              <span className="text-xs font-bold text-brand-primary bg-brand-primary-bg dark:bg-brand-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Pre-Interview Check
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight mt-1">
                You've been invited to interview
              </h2>
              <p className="text-sm text-brand-muted-text">
                For the role of <span className="font-semibold text-slate-900 dark:text-slate-100">{role}</span> at <span className="font-semibold text-slate-900 dark:text-slate-100">{company}</span>.
              </p>
            </div>

            {/* Webcam Live Preview Box */}
            <div className="relative aspect-video w-full rounded-xl bg-slate-100 dark:bg-slate-950 border border-border overflow-hidden flex items-center justify-center mb-6">
              {webcamGranted ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]" // mirror effect
                />
              ) : (
                <div className="text-center p-4 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 text-brand-muted-text flex items-center justify-center mx-auto">
                    <Camera className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Camera Preview Pending</p>
                    <p className="text-xs text-brand-muted-text max-w-xs mx-auto mt-0.5">
                      Grant webcam permissions using the button below to test your camera and unlock the interview.
                    </p>
                  </div>
                </div>
              )}

              {/* Status Indicator overlay */}
              {webcamGranted && (
                <div className="absolute top-3 right-3 bg-emerald-500/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  Live Preview
                </div>
              )}
            </div>

            {/* Hardware test buttons */}
            <div className="space-y-3">
              {!webcamGranted || !micGranted ? (
                <button
                  onClick={requestPermissions}
                  disabled={isTesting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-primary/90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  {isTesting ? "Accessing Hardware..." : "Test Camera & Microphone"}
                </button>
              ) : (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-lg flex items-start gap-2 text-xs">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hardware access granted.</span> Your camera and microphone are operating correctly. Feel free to adjust your position before beginning.
                  </div>
                </div>
              )}

              {permissionError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>{permissionError}</div>
                </div>
              )}
            </div>
          </div>

          <div className="text-[10px] text-brand-muted-text mt-4 flex items-center gap-1">
            <Info className="h-3.5 w-3.5" />
            Your feed is only used for proctoring checks and is secure.
          </div>
        </div>

        {/* Right Panel: Checklist & Rules (5 columns) */}
        <div className="md:col-span-5 p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col justify-between">
          <div className="space-y-6">
            
            {/* System Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text">
                System Checklist
              </h3>
              
              <div className="space-y-2.5">
                {/* Item 1: Webcam */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-border text-xs">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-brand-muted-text" />
                    <span className="font-medium">Webcam Permission</span>
                  </div>
                  {webcamGranted ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                      Ready <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-100 dark:fill-emerald-950" />
                    </span>
                  ) : (
                    <span className="text-amber-500 font-semibold flex items-center gap-1 text-[10px]">
                      Required
                    </span>
                  )}
                </div>

                {/* Item 2: Microphone */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-border text-xs">
                  <div className="flex items-center gap-2">
                    <Mic className="h-4 w-4 text-brand-muted-text" />
                    <span className="font-medium">Microphone Permission</span>
                  </div>
                  {micGranted ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                      Ready <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-100 dark:fill-emerald-950" />
                    </span>
                  ) : (
                    <span className="text-amber-500 font-semibold flex items-center gap-1 text-[10px]">
                      Required
                    </span>
                  )}
                </div>

                {/* Item 3: Connection */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-border text-xs">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4 text-brand-muted-text" />
                    <span className="font-medium">Stable Connection</span>
                  </div>
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    Online <CheckCircle2 className="h-3.5 w-3.5 fill-emerald-100 dark:fill-emerald-950" />
                  </span>
                </div>

                {/* Item 4: Environment */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-border text-xs">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-brand-muted-text" />
                    <span className="font-medium">Quiet Workspace</span>
                  </div>
                  <span className="text-brand-muted-text font-semibold flex items-center gap-1 text-[10px]">
                    Recommended
                  </span>
                </div>
              </div>
            </div>

            {/* Proctoring Rules */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted-text flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-brand-warning shrink-0" />
                Exam Security Rules
              </h3>
              
              <ul className="text-xs space-y-2 text-slate-600 dark:text-slate-400 pl-1 list-none">
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                  <span>Do not minimize the screen or change browser tabs. Tab switching triggers immediate security flags.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                  <span>Ensure your face is clearly visible at all times. Multiple people are not permitted in the video feed.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                  <span>Keep mobile devices away. AI algorithms monitor background phone patterns.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-primary mt-1.5 shrink-0" />
                  <span>The timer is running and cannot be paused once the interview is started.</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="mt-8 pt-4 border-t border-border/40">
            <button
              onClick={handleStartClick}
              disabled={!webcamGranted || !micGranted}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-brand-success px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 dark:hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none disabled:scale-100 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Start Interview
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
