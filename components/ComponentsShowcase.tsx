'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import Tag from '@/components/ui/Tag'
import Modal from '@/components/ui/Modal'

const ComponentsShowcase = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [tags, setTags] = useState(['React', 'TypeScript', 'Tailwind'])

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const addTag = () => {
    const newTag = `New Tag ${tags.length + 1}`
    setTags([...tags, newTag])
  }

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-transparent to-bg-accent/30">
      <div className="container mx-auto max-w-6xl">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">Component Library</span>
          </h2>
          <p className="text-xl text-primary-600 max-w-2xl mx-auto">
            Interactive showcase of our reusable UI components
          </p>
        </div>

        {/* Buttons Showcase */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-primary-800 mb-8 text-center">Buttons</h3>
          <div className="glass-morphism rounded-2xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Primary Buttons */}
              <div className="space-y-4">
                <h4 className="font-medium text-primary-700">Primary</h4>
                <div className="space-y-3">
                  <Button size="sm">Small Button</Button>
                  <Button size="md">Medium Button</Button>
                  <Button size="lg">Large Button</Button>
                  <Button loading>Loading</Button>
                </div>
              </div>

              {/* Secondary Buttons */}
              <div className="space-y-4">
                <h4 className="font-medium text-primary-700">Secondary</h4>
                <div className="space-y-3">
                  <Button variant="secondary" size="sm">Small</Button>
                  <Button variant="secondary" size="md">Medium</Button>
                  <Button variant="secondary" size="lg">Large</Button>
                  <Button variant="secondary" fullWidth>Full Width</Button>
                </div>
              </div>

              {/* Ghost Buttons */}
              <div className="space-y-4">
                <h4 className="font-medium text-primary-700">Ghost</h4>
                <div className="space-y-3">
                  <Button variant="ghost" size="sm">Small</Button>
                  <Button variant="ghost" size="md">Medium</Button>
                  <Button variant="ghost" size="lg">Large</Button>
                </div>
              </div>

              {/* Glass Buttons */}
              <div className="space-y-4">
                <h4 className="font-medium text-primary-700">Glass</h4>
                <div className="space-y-3">
                  <Button variant="glass" size="sm">Small</Button>
                  <Button variant="glass" size="md">Medium</Button>
                  <Button variant="glass" size="lg">Large</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards Showcase */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-primary-800 mb-8 text-center">Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Glass Card */}
            <Card variant="glass">
              <CardHeader>
                <h4 className="text-xl font-semibold text-primary-800">Glass Card</h4>
              </CardHeader>
              <CardContent>
                <p className="text-primary-600">
                  A beautiful glassmorphism card with backdrop blur and transparency effects.
                </p>
              </CardContent>
              <CardFooter>
                <Button size="sm" fullWidth>Learn More</Button>
              </CardFooter>
            </Card>

            {/* Solid Card */}
            <Card variant="solid">
              <CardHeader>
                <h4 className="text-xl font-semibold text-primary-800">Solid Card</h4>
              </CardHeader>
              <CardContent>
                <p className="text-primary-600">
                  A traditional solid card with clean borders and subtle shadows.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" size="sm" fullWidth>Learn More</Button>
              </CardFooter>
            </Card>

            {/* Gradient Card */}
            <Card variant="gradient">
              <CardHeader>
                <h4 className="text-xl font-semibold text-primary-800">Gradient Card</h4>
              </CardHeader>
              <CardContent>
                <p className="text-primary-700">
                  A gradient card with beautiful color transitions and modern appeal.
                </p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" size="sm" fullWidth>Learn More</Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Tags Showcase */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-primary-800 mb-8 text-center">Tags</h3>
          <div className="glass-morphism rounded-2xl p-8">
            <div className="space-y-6">
              {/* Different Variants */}
              <div>
                <h4 className="font-medium text-primary-700 mb-3">Variants</h4>
                <div className="flex flex-wrap gap-2">
                  <Tag variant="primary">Primary</Tag>
                  <Tag variant="secondary">Secondary</Tag>
                  <Tag variant="accent">Accent</Tag>
                  <Tag variant="success">Success</Tag>
                  <Tag variant="warning">Warning</Tag>
                  <Tag variant="error">Error</Tag>
                </div>
              </div>

              {/* Different Sizes */}
              <div>
                <h4 className="font-medium text-primary-700 mb-3">Sizes</h4>
                <div className="flex flex-wrap gap-2 items-center">
                  <Tag size="sm">Small</Tag>
                  <Tag size="md">Medium</Tag>
                  <Tag size="lg">Large</Tag>
                </div>
              </div>

              {/* Removable Tags */}
              <div>
                <h4 className="font-medium text-primary-700 mb-3">Interactive Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      variant="primary"
                      removable
                      onRemove={() => removeTag(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addTag}>
                    + Add Tag
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Showcase */}
        <div className="mb-16">
          <h3 className="text-2xl font-semibold text-primary-800 mb-8 text-center">Modal</h3>
          <div className="text-center">
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-primary-600">
            This is an example modal component with glassmorphism design and smooth animations.
          </p>
          <p className="text-primary-600">
            Features include:
          </p>
          <ul className="list-disc list-inside text-primary-600 space-y-1">
            <li>Backdrop blur effect</li>
            <li>Focus management</li>
            <li>Keyboard navigation (ESC to close)</li>
            <li>Click outside to close</li>
            <li>Smooth entrance animation</li>
          </ul>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

export default ComponentsShowcase