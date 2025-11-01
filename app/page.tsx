'use client'

import Header from '@/components/Header'
import SidePanel from '@/components/SidePanel'
import HeroSection from '@/components/HeroSection'
import FeaturesSection from '@/components/FeaturesSection'
import ComponentsShowcase from '@/components/ComponentsShowcase'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <SidePanel />
        <main className="flex-1 lg:ml-64">
          <HeroSection />
          <FeaturesSection />
          <ComponentsShowcase />
          <Footer />
        </main>
      </div>
    </div>
  )
}