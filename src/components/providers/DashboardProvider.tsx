"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

interface DashboardContextType {
  isCollapsed: boolean
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  isMobileOpen: boolean
  setIsMobileOpen: React.Dispatch<React.SetStateAction<boolean>>
  activePageTitle: string
  setActivePageTitle: React.Dispatch<React.SetStateAction<string>>
}

const DashboardContext = React.createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [activePageTitle, setActivePageTitle] = React.useState("Dashboard")
  const pathname = usePathname()

  // Auto-set page title based on path for convenience (user can override if needed)
  React.useEffect(() => {
    const segments = pathname.split("/").filter(Boolean)
    if (segments.length === 0) {
      setActivePageTitle("Dashboard")
    } else {
      const lastSegment = segments[segments.length - 1]
      // Capitalize and format
      const formattedTitle = lastSegment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
      setActivePageTitle(formattedTitle)
    }
    // Auto-close mobile sidebar drawer on navigation
    setIsMobileOpen(false)
  }, [pathname])

  return (
    <DashboardContext.Provider
      value={{
        isCollapsed,
        setIsCollapsed,
        isMobileOpen,
        setIsMobileOpen,
        activePageTitle,
        setActivePageTitle,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = React.useContext(DashboardContext)
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider")
  }
  return context
}
