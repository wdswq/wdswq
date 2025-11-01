'use client'

import { useAppStore } from '@/lib/store'

export default function SettingsPage() {
  const { theme, setTheme } = useAppStore()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your application preferences.
        </p>
      </div>

      <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <div className="mt-2 space-x-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-2 rounded-md border ${
                    theme === 'light'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-2 rounded-md border ${
                    theme === 'dark'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-border hover:bg-accent'
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Account</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="your@email.com"
                disabled
              />
            </div>
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Your Name"
                disabled
              />
            </div>
          </div>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Frontend App v1.0.0</p>
            <p>Built with Next.js 14, TypeScript, and Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  )
}