'use client'

import { 
  Smartphone, 
  Monitor, 
  Tablet, 
  Eye, 
  Keyboard, 
  MousePointer,
  Palette,
  Code,
  Zap
} from 'lucide-react'

const FeaturesSection = () => {
  const features = [
    {
      icon: Smartphone,
      title: 'Mobile First',
      description: 'Responsive design that works seamlessly across all devices',
      gradient: 'from-accent-blue to-accent-purple'
    },
    {
      icon: Monitor,
      title: 'Desktop Optimized',
      description: 'Enhanced experience for larger screens with spacious layouts',
      gradient: 'from-accent-purple to-accent-pink'
    },
    {
      icon: Tablet,
      title: 'Tablet Ready',
      description: 'Perfect adaptation for tablet and medium-sized screens',
      gradient: 'from-accent-pink to-accent-green'
    },
    {
      icon: Eye,
      title: 'High Contrast',
      description: 'WCAG compliant color combinations for better readability',
      gradient: 'from-primary-300 to-primary-500'
    },
    {
      icon: Keyboard,
      title: 'Keyboard Navigation',
      description: 'Full keyboard accessibility with visible focus indicators',
      gradient: 'from-primary-500 to-primary-700'
    },
    {
      icon: MousePointer,
      title: 'Focus Management',
      description: 'Smart focus trapping and logical tab order',
      gradient: 'from-primary-700 to-primary-900'
    },
    {
      icon: Palette,
      title: 'Custom Theme',
      description: 'Tailwind-based color palette with light theme optimization',
      gradient: 'from-accent-blue to-primary-500'
    },
    {
      icon: Code,
      title: 'Developer Friendly',
      description: 'Clean, semantic HTML5 with TypeScript support',
      gradient: 'from-accent-green to-accent-blue'
    },
    {
      icon: Zap,
      title: 'Performance',
      description: 'Optimized animations and minimal JavaScript footprint',
      gradient: 'from-accent-pink to-accent-purple'
    }
  ]

  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-primary-600 max-w-2xl mx-auto">
            Built with modern web standards and best practices in mind
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="card-glass group cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Icon Container */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-primary-800 mb-3 group-hover:text-primary-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-primary-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Effect */}
                <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-1 bg-gradient-to-r from-transparent via-primary-300 to-transparent"></div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="glass-morphism-heavy rounded-2xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-primary-800 mb-4">
              Ready to get started?
            </h3>
            <p className="text-primary-600 mb-6">
              Explore our component library and start building beautiful interfaces today.
            </p>
            <button className="button-primary">
              Browse Components
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection