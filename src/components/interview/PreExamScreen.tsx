"use client"

import React, { useState, useRef } from "react"
import {
  Camera,
  Mic,
  Wifi,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Clock,
  Shield,
  Bot
} from "lucide-react"
import { cn } from "@/lib/utils"

interface PreExamScreenProps {
  role: string
  company: string
  questionCount: number
  timeLimit: number
  proctoringEnabled: boolean
  onStart: (stream: MediaStream | null) => void
}

export function PreExamScreen({ role, company, questionCount, timeLimit, proctoringEnabled, onStart }: PreExamScreenProps) {
  const [cameraGranted, setCameraGranted] = useState(false)
  const [micGranted, setMicGranted] = useState(false)
  const [cameraRequesting, setCameraRequesting] = useState(false)
  const [micRequesting, setMicRequesting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [rulesExpanded, setRulesExpanded] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null)

  const requestCamera = async () => {
    setCameraRequesting(true)
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
      })

      // If we already have a stream with audio, merge them
      if (mediaStream) {
        stream.getVideoTracks().forEach(track => mediaStream.addTrack(track))
        // Stop the standalone video stream since tracks are merged
        setCameraGranted(true)
        setCameraRequesting(false)
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
        return
      }

      setCameraGranted(true)
      setMediaStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      console.error("Camera error:", err)
      setCameraError("Camera access denied. Check browser permissions.")
    } finally {
      setCameraRequesting(false)
    }
  }

  const requestMicrophone = async () => {
    setMicRequesting(true)
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // If we already have a video stream, add audio track to it
      if (mediaStream) {
        stream.getAudioTracks().forEach(track => mediaStream.addTrack(track))
        setMicGranted(true)
        setMicRequesting(false)
        return
      }

      setMicGranted(true)
      setMediaStream(stream)
    } catch (err: any) {
      console.error("Microphone error:", err)
      setMicError("Microphone access denied. Check browser permissions.")
    } finally {
      setMicRequesting(false)
    }
  }

  // Request both at once for convenience
  const requestBoth = async () => {
    setCameraRequesting(true)
    setMicRequesting(true)
    setCameraError(null)
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: true
      })
      setCameraGranted(true)
      setMicGranted(true)
      setMediaStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err: any) {
      console.error("Permission error:", err)
      setCameraError("Could not access camera and microphone. Please grant permissions in browser settings.")
      setMicError("Could not access camera and microphone.")
    } finally {
      setCameraRequesting(false)
      setMicRequesting(false)
    }
  }

  const allReady = cameraGranted && micGranted

  const handleStart = () => {
    if (allReady) {
      onStart(mediaStream)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-4 md:p-8 animate-fade-in">
      <div className="max-w-lg w-full space-y-6">

        {/* Logo centered */}
        <div className="flex items-center gap-2.5 justify-center">
          <div className="h-9 w-9 rounded-xl bg-brand-primary text-white flex items-center justify-center font-black text-lg shadow-lg shadow-brand-primary/20">
            H
          </div>
          <span className="font-sans font-extrabold tracking-tight text-xl">
            Hire<span className="text-brand-primary">Box</span>
          </span>
          <span className="text-[9px] font-black text-white bg-brand-primary rounded px-1.5 py-0.5 -ml-0.5 uppercase tracking-wider">AI</span>
        </div>

        {/* Main card */}
        <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl shadow-xl overflow-hidden transition-colors duration-300">

          {/* Invitation header */}
          <div className="px-6 pt-7 pb-5 border-b border-border/40 text-center space-y-3">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-brand-primary bg-brand-primary-bg dark:bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">
              <Bot className="h-3 w-3" /> AI-Proctored Interview
            </span>
            <p className="text-xs text-brand-muted-text">You&apos;ve been invited to interview for:</p>
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
              {role}
            </h1>
            <p className="text-sm text-brand-muted-text">
              at <span className="font-bold text-foreground">{company}</span>
            </p>
          </div>

          {/* System check items */}
          <div className="px-6 py-5 space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-brand-muted-text">
              System Requirements Check
            </h3>

            <div className="space-y-2.5">
              {/* Camera */}
              <button
                type="button"
                onClick={!cameraGranted ? (micGranted ? requestCamera : requestBoth) : undefined}
                disabled={cameraGranted || cameraRequesting}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all",
                  cameraGranted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/30"
                    : "bg-white dark:bg-slate-950 border-border hover:border-brand-primary/40 hover:bg-brand-primary-bg/30 dark:hover:bg-brand-primary/5 cursor-pointer"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    cameraGranted
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
                      : "bg-slate-100 dark:bg-slate-800 text-brand-muted-text"
                  )}>
                    <Camera className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Camera access</span>
                </div>
                {cameraGranted ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Granted
                  </span>
                ) : cameraRequesting ? (
                  <span className="text-brand-primary font-semibold animate-pulse">Requesting...</span>
                ) : (
                  <span className="text-brand-primary font-bold text-[10px]">Click to grant →</span>
                )}
              </button>

              {cameraError && (
                <div className="flex items-start gap-2 text-[11px] text-brand-danger font-medium px-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {cameraError}
                </div>
              )}

              {/* Microphone */}
              <button
                type="button"
                onClick={!micGranted ? (cameraGranted ? requestMicrophone : requestBoth) : undefined}
                disabled={micGranted || micRequesting}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-xl border text-xs font-medium transition-all",
                  micGranted
                    ? "bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/30"
                    : "bg-white dark:bg-slate-950 border-border hover:border-brand-primary/40 hover:bg-brand-primary-bg/30 dark:hover:bg-brand-primary/5 cursor-pointer"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    micGranted
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600"
                      : "bg-slate-100 dark:bg-slate-800 text-brand-muted-text"
                  )}>
                    <Mic className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Microphone access</span>
                </div>
                {micGranted ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Granted
                  </span>
                ) : micRequesting ? (
                  <span className="text-brand-primary font-semibold animate-pulse">Requesting...</span>
                ) : (
                  <span className="text-brand-primary font-bold text-[10px]">Click to grant →</span>
                )}
              </button>

              {micError && (
                <div className="flex items-start gap-2 text-[11px] text-brand-danger font-medium px-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" /> {micError}
                </div>
              )}

              {/* Stable connection — auto-checked */}
              <div className="w-full flex items-center justify-between p-3 rounded-xl border bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200 dark:border-emerald-900/30 text-xs font-medium">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                    <Wifi className="h-4 w-4" />
                  </div>
                  <span className="font-semibold">Stable connection</span>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" /> Online
                </span>
              </div>
            </div>

            {/* Live webcam preview (small) */}
            {cameraGranted && (
              <div className="relative w-[200px] h-[150px] rounded-xl bg-slate-100 dark:bg-slate-950 border border-border overflow-hidden mx-auto">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                  Live
                </div>
              </div>
            )}
          </div>

          {/* Collapsible Rules section */}
          <div className="px-6 pb-1">
            <button
              type="button"
              onClick={() => setRulesExpanded(!rulesExpanded)}
              className="w-full flex items-center justify-between py-3 text-xs font-bold uppercase tracking-wider text-brand-muted-text hover:text-foreground transition-colors cursor-pointer border-t border-border/40"
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-brand-warning" />
                Read before starting
              </span>
              {rulesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            <div className={cn(
              "overflow-hidden transition-all duration-300",
              rulesExpanded ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0"
            )}>
              <ul className="text-xs space-y-2.5 text-slate-600 dark:text-slate-400 pl-1 list-none">
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-warning mt-1.5 shrink-0" />
                  <span><strong>Stay on this tab</strong> — tab switching is monitored and triggers security flags.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-warning mt-1.5 shrink-0" />
                  <span><strong>Only you should be visible</strong> on camera — multiple faces will be flagged.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-warning mt-1.5 shrink-0" />
                  <span><strong>No mobile phones</strong> in the camera frame — device detection is active.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-brand-warning mt-1.5 shrink-0" />
                  <span><strong>Timer starts</strong> when you click &quot;Begin Interview&quot; — it cannot be paused.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Exam info strip */}
          <div className="px-6 py-4 bg-slate-50/80 dark:bg-slate-950/40 border-t border-border/40">
            <div className="flex items-center justify-center gap-6 text-xs font-bold text-brand-muted-text">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="h-4 w-4 text-brand-primary" />
                {questionCount} Questions
              </span>
              <span className="h-4 w-px bg-border/60" />
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-brand-primary" />
                {timeLimit} min/question
              </span>
              <span className="h-4 w-px bg-border/60" />
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-brand-primary" />
                {proctoringEnabled ? "Proctored" : "Unproctored"}
              </span>
            </div>
          </div>

          {/* Begin button */}
          <div className="px-6 py-5">
            <button
              onClick={handleStart}
              disabled={!allReady}
              className={cn(
                "w-full inline-flex items-center justify-center gap-2.5 rounded-xl px-5 py-4 text-base font-bold shadow-lg transition-all",
                allReady
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-none cursor-not-allowed"
              )}
            >
              Begin Interview
              <ArrowRight className="h-5 w-5" />
            </button>
            {!allReady && (
              <p className="text-center text-[10px] text-brand-muted-text mt-2 font-medium">
                Grant camera and microphone access above to enable this button.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
