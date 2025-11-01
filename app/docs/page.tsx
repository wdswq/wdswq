'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Code, Palette, Zap, Eye, Keyboard, Smartphone } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card, { CardContent } from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState('overview')

  const navigation = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'theme', label: 'Theme Configuration', icon: Palette },
    { id: 'components', label: 'Components', icon: Code },
    { id: 'accessibility', label: 'Accessibility', icon: Keyboard },
    { id: 'responsive', label: 'Responsive Design', icon: Smartphone },
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-primary-800 mb-4">Overview</h2>
              <p className="text-primary-600 leading-relaxed">
                This UI theme implementation provides a comprehensive design system built with Tailwind CSS, 
                featuring glassmorphism effects, custom gradients, and smooth animations. The theme is optimized 
                for accessibility and responsive design across all devices.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  'Custom color palette with light theme',
                  'Glassmorphism utilities and components',
                  'Smooth animations and transitions',
                  'Responsive navigation and layouts',
                  'WCAG compliant accessibility',
                  'TypeScript support',
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                    <span className="text-primary-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Quick Start</h3>
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <code className="text-sm text-primary-800">
                  npm install<br />
                  npm run dev
                </code>
              </div>
            </div>
          </div>
        )

      case 'theme':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-primary-800 mb-4">Theme Configuration</h2>
              <p className="text-primary-600 leading-relaxed">
                The theme is configured through Tailwind CSS with custom colors, gradients, and utilities.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Color Palette</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-primary-700 mb-2">Primary Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    <Tag variant="primary">#E3F2FD (50)</Tag>
                    <Tag variant="primary">#64B5F6 (300)</Tag>
                    <Tag variant="primary">#2196F3 (500)</Tag>
                    <Tag variant="primary">#0D47A1 (900)</Tag>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-primary-700 mb-2">Accent Colors</h4>
                  <div className="flex flex-wrap gap-2">
                    <Tag variant="accent">#00BCD4</Tag>
                    <Tag variant="success">#4CAF50</Tag>
                    <Tag variant="warning">#FFC107</Tag>
                    <Tag variant="error">#F44336</Tag>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Glassmorphism</h3>
              <p className="text-primary-600 mb-4">
                Glass effects are available through utility classes and component variants.
              </p>
              <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
                <code className="text-sm text-primary-800">
                  .glass-morphism<br />
                  .glass-morphism-heavy<br />
                  backdrop-blur-md
                </code>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Animations</h3>
              <p className="text-primary-600 mb-4">
                Custom animations for smooth interactions and micro-animations.
              </p>
              <div className="flex flex-wrap gap-2">
                <Tag>fade-in</Tag>
                <Tag>slide-up</Tag>
                <Tag>scale-in</Tag>
                <Tag>float</Tag>
                <Tag>glow</Tag>
              </div>
            </div>
          </div>
        )

      case 'components':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-primary-800 mb-4">Components</h2>
              <p className="text-primary-600 leading-relaxed">
                Reusable UI components built with accessibility and responsive design in mind.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary-800 mb-3">Button</h3>
                  <p className="text-primary-600 mb-4">Multiple variants and sizes with loading states.</p>
                  <div className="space-y-2">
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary-800 mb-3">Card</h3>
                  <p className="text-primary-600 mb-4">Glass, solid, and gradient variants with hover effects.</p>
                  <div className="flex gap-2">
                    <Tag variant="primary">Glass</Tag>
                    <Tag variant="secondary">Solid</Tag>
                    <Tag variant="accent">Gradient</Tag>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary-800 mb-3">Tag</h3>
                  <p className="text-primary-600 mb-4">Colorful tags with removable functionality.</p>
                  <div className="flex gap-2">
                    <Tag variant="success" removable>Success</Tag>
                    <Tag variant="warning" removable>Warning</Tag>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-primary-800 mb-3">Modal</h3>
                  <p className="text-primary-600 mb-4">Accessible modal with focus management.</p>
                  <Button size="sm">Open Modal</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      case 'accessibility':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-primary-800 mb-4">Accessibility</h2>
              <p className="text-primary-600 leading-relaxed">
                Built with WCAG guidelines and best practices for inclusive design.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Features</h3>
              <div className="space-y-4">
                {[
                  {
                    title: 'Keyboard Navigation',
                    description: 'Full keyboard support with visible focus indicators and logical tab order.',
                  },
                  {
                    title: 'Screen Reader Support',
                    description: 'Semantic HTML5 with proper ARIA labels and descriptions.',
                  },
                  {
                    title: 'Color Contrast',
                    description: 'WCAG AA compliant color combinations for better readability.',
                  },
                  {
                    title: 'Focus Management',
                    description: 'Smart focus trapping in modals and proper focus restoration.',
                  },
                  {
                    title: 'Responsive Text',
                    description: 'Text scales properly across different viewport sizes.',
                  },
                ].map((feature, index) => (
                  <Card key={index} variant="glass">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-primary-800 mb-2">{feature.title}</h4>
                      <p className="text-primary-600 text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Testing</h3>
              <p className="text-primary-600">
                Components are tested with accessibility tools and keyboard navigation to ensure 
                they meet modern accessibility standards.
              </p>
            </div>
          </div>
        )

      case 'responsive':
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-primary-800 mb-4">Responsive Design</h2>
              <p className="text-primary-600 leading-relaxed">
                Mobile-first approach with breakpoints for all device sizes.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Breakpoints</h3>
              <div className="space-y-2">
                {[
                  { name: 'Mobile', size: '< 768px', description: 'Single column, stacked navigation' },
                  { name: 'Tablet', size: '768px - 1024px', description: 'Two-column layouts, adapted navigation' },
                  { name: 'Desktop', size: '> 1024px', description: 'Multi-column, full navigation panel' },
                ].map((breakpoint, index) => (
                  <Card key={index} variant="glass">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-primary-800">{breakpoint.name}</h4>
                          <p className="text-primary-600 text-sm">{breakpoint.size}</p>
                        </div>
                        <p className="text-primary-600 text-sm">{breakpoint.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-primary-800 mb-4">Navigation</h3>
              <p className="text-primary-600 mb-4">
                The navigation system adapts based on screen size:
              </p>
              <ul className="space-y-2 text-primary-600">
                <li>• Mobile: Hamburger menu with slide-down navigation</li>
                <li>• Tablet: Collapsible sidebar with toggle functionality</li>
                <li>• Desktop: Fixed sidebar with full navigation options</li>
              </ul>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 glass-morphism border-r border-white/20 min-h-screen p-6">
          <h2 className="text-xl font-bold gradient-text mb-6">Documentation</h2>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-left focus-ring ${
                    activeSection === item.id
                      ? 'bg-primary-500 text-white'
                      : 'text-primary-700 hover:bg-glass-medium'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-3" />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <div className="mt-8 pt-8 border-t border-white/20">
            <Link href="/" className="flex items-center text-primary-600 hover:text-primary-500 transition-colors">
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Back to Home
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DocsPage