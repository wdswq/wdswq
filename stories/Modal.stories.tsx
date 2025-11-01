import type { Meta, StoryObj } from '@storybook/react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useState } from 'react'

const meta: Meta<typeof Modal> = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

const ModalTemplate = (args: any) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal
        {...args}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className="space-y-4">
          <p className="text-primary-600">
            This is the modal content. You can put any content here.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export const Default: Story = {
  render: ModalTemplate,
  args: {
    title: 'Modal Title',
    size: 'md',
  },
}

export const Small: Story = {
  render: ModalTemplate,
  args: {
    title: 'Small Modal',
    size: 'sm',
  },
}

export const Large: Story = {
  render: ModalTemplate,
  args: {
    title: 'Large Modal',
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  render: ModalTemplate,
  args: {
    title: 'Extra Large Modal',
    size: 'xl',
  },
}

export const NoCloseButton: Story = {
  render: ModalTemplate,
  args: {
    title: 'No Close Button',
    showCloseButton: false,
  },
}

export const NoBackdropClose: Story = {
  render: ModalTemplate,
  args: {
    title: 'No Backdrop Close',
    closeOnBackdropClick: false,
  },
}