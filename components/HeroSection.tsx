'use client'

import { ArrowRight, Sparkles, Zap, Layers } from 'lucide-react'

const HeroSection = () => {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center px-4 pt-16">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          {/* Animated Badge */}
          <div className="inline-flex items-center glass-morphism rounded-full px-4 py-2 mb-8 animate-fade-in">
            <Sparkles className="h-4 w-4 text-primary-500 mr-2" />
            <span className="text-sm font-medium text-primary-700">
              Futuristic UI Theme System
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Beautiful</span>
            <br />
            <span className="text-primary-800">UI Components</span>
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-primary-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            A modern, accessible, and responsive UI theme built with Tailwind CSS. 
            Features glassmorphism, gradients, and smooth animations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="button-primary group">
              Get Started
              <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="button-secondary">
              View Documentation
            </button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="card-glass text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Reusable Components
              </h3>
              <p className="text-primary-600 text-sm">
                Modular and accessible components for rapid development
              </p>
            </div>

            <div className="card-glass text-center group">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Glassmorphism Design
              </h3>
              <p className="text-primary-600 text-sm">
                Modern frosted glass effects with beautiful blur and transparency
              </p>
            </div>

            <div className="card-glass text-center group">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Smooth Animations
              </h3>
              <p className="text-primary-600 text-sm">
                Fluid transitions and micro-interactions throughout
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection