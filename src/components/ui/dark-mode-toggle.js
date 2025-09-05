'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function DarkModeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="w-9 h-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800/60">
        <div className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 p-0 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-slate-700 dark:text-slate-300" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 dark:text-slate-300" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
