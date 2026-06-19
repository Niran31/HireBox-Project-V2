"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { api } from "@/lib/api"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Video,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bot
} from "lucide-react"

interface SidebarItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  active: boolean
  collapsed: boolean
}

function SidebarItem({ icon: Icon, label, href, active, collapsed }: SidebarItemProps) {
  const content = (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
        active
          ? "bg-brand-primary text-white shadow-md shadow-brand-primary/10"
          : "text-brand-muted-text hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="transition-opacity duration-300 truncate">{label}</span>}
    </Link>
  )

  if (collapsed) {
    return (
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="font-semibold bg-slate-900 text-white dark:bg-white dark:text-slate-900">
          {label}
        </TooltipContent>
      </Tooltip>
    )
  }

  return content
}

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isCollapsed, setIsCollapsed } = useDashboard()


  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" })
    } catch (e) {
      console.error("Logout cookie clear failed:", e)
    }
    api.clearToken()
    router.push("/login")
    router.refresh()
  }

  const collapsed = mobile ? false : isCollapsed

  const navigation = [
    {
      title: "Main",
      items: [
        { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        { label: "Jobs", icon: Briefcase, href: "/jobs" },
        { label: "Candidates", icon: Users, href: "/candidates" },
        { label: "Interviews", icon: Video, href: "/interviews" },
      ],
    },
    {
      title: "Reports",
      items: [
        { label: "Analytics", icon: BarChart3, href: "/analytics" },
        { label: "Reports", icon: FileText, href: "/reports" },
      ],
    },
    {
      title: "Settings",
      items: [
        { label: "Settings", icon: Settings, href: "/settings" },
      ],
    },
  ]

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        mobile
          ? "flex flex-col h-full bg-white dark:bg-slate-900 w-full"
          : "hidden md:flex flex-col h-screen border-r border-border/40 transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 shrink-0",
        !mobile && (collapsed ? "w-[72px]" : "w-[260px]")
      )}
    >
      {/* Sidebar Header / Logo */}
      {collapsed ? (
        <div className="flex h-16 items-center justify-center border-b border-border/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/20">
            <Bot className="h-5 w-5" />
          </div>
        </div>
      ) : (
        <div className="flex h-16 items-center gap-2 px-6 border-b border-border/40">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary text-white shadow-md shadow-brand-primary/20">
            <Bot className="h-5 w-5" />
          </div>
          <span className="font-sans font-bold tracking-tight text-lg">
            Hire<span className="text-brand-primary">Box</span>
          </span>
          <span className="rounded-full bg-brand-primary-bg px-1.5 py-0.5 text-[10px] font-bold text-brand-primary dark:bg-brand-card-dark">
            AI
          </span>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
        {navigation.map((group) => (
          <div key={group.title} className="space-y-2">
            {!collapsed && (
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-brand-muted-text px-3">
                {group.title}
              </h4>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={isActive(item.href)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-border/40 p-4 bg-background/50 space-y-4">
        {/* User Profile */}
        <div className={cn("flex items-center gap-3", collapsed ? "justify-center" : "")}>
          <div className="relative">
            <div className="h-9 w-9 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-sm shadow-md shadow-brand-primary/10">
              NS
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Niranjan S</p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-brand-muted-text truncate">Growth Plan</span>
                <span className="h-1 w-1 rounded-full bg-brand-muted-text" />
                <span className="text-[9px] font-extrabold uppercase text-brand-primary bg-brand-primary-bg dark:bg-brand-card-dark px-1.5 py-0.5 rounded">
                  Growth
                </span>
              </div>
            </div>
          )}

          {!collapsed && (
            <button 
              onClick={handleLogout}
              className="p-1.5 text-brand-muted-text hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapse Toggle */}
        {!mobile && (
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            {collapsed ? (
              <button
                onClick={() => setIsCollapsed(false)}
                className="mx-auto p-1.5 text-brand-muted-text hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                title="Expand Sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <>
                <span className="text-[10px] text-brand-muted-text">Collapse Menu</span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1.5 text-brand-muted-text hover:text-foreground hover:bg-accent rounded-lg transition-colors cursor-pointer"
                  title="Collapse Sidebar"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
