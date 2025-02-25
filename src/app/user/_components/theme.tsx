'use client'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

export default function ThemeSettings() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Appearance</h2>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
            {theme === 'dark' ? (
              <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          <div>
            <Label htmlFor="dark-mode">Dark Mode</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
          </div>
        </div>
        <Switch id="dark-mode" checked={theme === 'dark'} onCheckedChange={toggleTheme} />
      </div>
    </div>
  )
}
