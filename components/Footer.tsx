'use client'

import { Github, Twitter, Linkedin, Mail } from 'lucide-react'

const Footer = () => {
  const socialLinks = [
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ]

  return (
    <footer className="glass-morphism border-t border-white/20 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold gradient-text mb-4">UI Theme</h3>
            <p className="text-primary-600 mb-6 max-w-md">
              A modern, accessible UI theme system built with Next.js and Tailwind CSS. 
              Features glassmorphism design and smooth animations.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="text-primary-600 hover:text-primary-500 transition-colors focus-ring rounded-lg p-2"
                    aria-label={social.label}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-primary-800 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#home" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#features" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="/docs" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#components" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Components
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-primary-800 mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Storybook
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="text-primary-600 hover:text-primary-500 transition-colors">
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-primary-600 text-sm">
              © 2024 UI Theme Implementation. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-primary-600 hover:text-primary-500 text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-primary-600 hover:text-primary-500 text-sm transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer