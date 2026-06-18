"use client"

import * as React from "react"
import { useDashboard } from "@/components/providers/DashboardProvider"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Sidebar } from "@/components/layout/Sidebar"
import { 
  Bell, 
  Search, 
  Menu,
  ChevronDown,
  User,
  CreditCard,
  LogOut,
  Bot
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

export function Navbar() {
  const { activePageTitle, isMobileOpen, setIsMobileOpen } = useDashboard()

  // Detect Cmd+K/Ctrl+K key presses for search shortcut demonstration
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        alert("Global Search Command Triggered!")
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border/40 bg-white/80 dark:bg-slate-900/80 px-6 backdrop-blur-md">
      
      {/* Left: Hamburger (Mobile) + Title (Dynamic) */}
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Sheet Trigger */}
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground hover:bg-accent md:hidden cursor-pointer">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px]">
            <Sidebar mobile={true} />
          </SheetContent>
        </Sheet>

        {/* Dynamic Page Title */}
        <h1 className="font-sans font-bold tracking-tight text-lg sm:text-xl text-foreground">
          {activePageTitle}
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        
        {/* Global Search Button */}
        <button 
          onClick={() => alert("Global Search Command Triggered!")}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-brand-muted-text border border-border rounded-lg bg-background hover:bg-accent cursor-pointer transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Search...</span>
          <kbd className="pointer-events-none select-none rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-brand-muted-text opacity-100">
            ⌘K
          </kbd>
        </button>

        {/* Mobile Search Button (Icon Only) */}
        <button 
          onClick={() => alert("Global Search Command Triggered!")}
          className="flex sm:hidden h-9 w-9 items-center justify-center rounded-lg text-brand-muted-text hover:bg-accent hover:text-foreground cursor-pointer"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-brand-muted-text hover:bg-accent hover:text-foreground cursor-pointer transition-all">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-brand-danger border-2 border-white dark:border-slate-900 animate-pulse" />
        </button>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        <div className="h-6 w-px bg-border/60 mx-1" />

        {/* User Account Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-all cursor-pointer">
              <div className="h-8 w-8 rounded-full bg-brand-primary text-white flex items-center justify-center font-bold text-xs shadow-md shadow-brand-primary/10">
                NS
              </div>
              <ChevronDown className="hidden sm:inline h-4 w-4 text-brand-muted-text" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 bg-white dark:bg-slate-900 border border-border rounded-lg shadow-lg">
            <DropdownMenuLabel className="font-semibold text-xs text-brand-muted-text uppercase tracking-wider px-3 py-2">
              My Account
            </DropdownMenuLabel>
            
            <div className="px-3 py-2 border-b border-border/40">
              <p className="text-sm font-semibold">Niranjan S</p>
              <p className="text-xs text-brand-muted-text truncate">niranjan@example.com</p>
            </div>
            
            <DropdownMenuSeparator className="bg-border/40" />
            
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-accent rounded-md">
              <User className="h-4 w-4 text-brand-muted-text" />
              <span>Profile</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 text-sm cursor-pointer hover:bg-accent rounded-md">
              <CreditCard className="h-4 w-4 text-brand-muted-text" />
              <span>Billing & Plan</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-border/40" />
            
            <DropdownMenuItem className="flex items-center gap-2 px-3 py-2.5 text-sm text-brand-danger hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer rounded-md">
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
      </div>
    </header>
  )
}
