'use client'

import { useState } from 'react'
import { 
  LayoutDashboard, 
  Palette, 
  Box, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react'

const SidePanel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: Palette, label: 'Theme', active: false },
    { icon: Box, label: 'Components', active: false },
    { icon: Layers, label: 'Layouts', active: false },
    { icon: FileText, label: 'Documentation', active: false },
    { icon: Sparkles, label: 'Animations', active: false },
    { icon: Zap, label: 'Utilities', active: false },
  ]

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-glass-light backdrop-blur-md border-r border-white/20 transition-all duration-300 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      } lg:block hidden`}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-primary-500 text-white rounded-full p-1.5 hover:bg-primary-600 transition-colors duration-200 focus-ring"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 mt-8">
          <ul className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon
              return (
                <li key={index}>
                  <button
                    className={`w-full flex items-center px-3 py-3 rounded-lg transition-all duration-200 focus-ring ${
                      item.active
                        ? 'bg-primary-500 text-white shadow-glow'
                        : 'text-primary-700 hover:bg-glass-medium hover:text-primary-600'
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Bottom Section */}
        {!isCollapsed && (
          <div className="border-t border-white/20 pt-4 mt-4">
            <div className="glass-morphism rounded-lg p-3">
              <p className="text-xs text-primary-600 font-medium">Theme Status</p>
              <p className="text-xs text-primary-500 mt-1">Light Mode Active</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}

export default SidePanel