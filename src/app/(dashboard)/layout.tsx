"use client"

import React from "react"
import { DashboardProvider } from "@/components/providers/DashboardProvider"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-zinc-50/50 dark:bg-slate-950 font-sans transition-colors duration-300">
        
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Right side container */}
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {/* Top Sticky Navbar */}
          <Navbar />

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            <div className="mx-auto max-w-7xl w-full h-full">
              {children}
            </div>
          </main>
        </div>

      </div>
    </DashboardProvider>
  )
}
