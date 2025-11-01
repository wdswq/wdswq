import type { Meta, StoryObj } from '@storybook/react'
import Card, { CardHeader, CardContent, CardFooter } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

const meta: Meta<typeof Card> = {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['glass', 'solid', 'gradient'],
    },
    hover: {
      control: 'boolean',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Glass: Story = {
  args: {
    variant: 'glass',
    children: (
      <>
        <CardHeader>
          <h3 className="text-xl font-semibold text-primary-800">Glass Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-primary-600">
            This is a glassmorphism card with backdrop blur and transparency effects.
          </p>
        </CardContent>
        <CardFooter>
          <Button size="sm" fullWidth>Action</Button>
        </CardFooter>
      </>
    ),
  },
}

export const Solid: Story = {
  args: {
    variant: 'solid',
    children: (
      <>
        <CardHeader>
          <h3 className="text-xl font-semibold text-primary-800">Solid Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-primary-600">
            This is a traditional solid card with clean borders and subtle shadows.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="secondary" size="sm" fullWidth>Action</Button>
        </CardFooter>
      </>
    ),
  },
}

export const Gradient: Story = {
  args: {
    variant: 'gradient',
    children: (
      <>
        <CardHeader>
          <h3 className="text-xl font-semibold text-primary-800">Gradient Card</h3>
        </CardHeader>
        <CardContent>
          <p className="text-primary-700">
            This is a gradient card with beautiful color transitions and modern appeal.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="ghost" size="sm" fullWidth>Action</Button>
        </CardFooter>
      </>
    ),
  },
}

export const NoHover: Story = {
  args: {
    variant: 'glass',
    hover: false,
    children: (
      <>
        <CardHeader>
          <h3 className="text-xl font-semibold text-primary-800">No Hover Effect</h3>
        </CardHeader>
        <CardContent>
          <p className="text-primary-600">
            This card doesn't have hover effects.
          </p>
        </CardContent>
      </>
    ),
  },
}