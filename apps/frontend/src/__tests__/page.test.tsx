import { render, screen } from '@testing-library/react'
import Home from '@/app/page'

describe('Home Page', () => {
  it('renders welcome message', () => {
    render(<Home />)
    expect(screen.getByText('Welcome to Frontend App')).toBeInTheDocument()
  })

  it('renders navigation cards', () => {
    render(<Home />)
    expect(screen.getByText('Library')).toBeInTheDocument()
    expect(screen.getByText('Upload')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })

  it('has working links to other pages', () => {
    render(<Home />)
    expect(screen.getByText('Go to Library →')).toHaveAttribute('href', '/library')
    expect(screen.getByText('Upload Content →')).toHaveAttribute('href', '/upload')
    expect(screen.getByText('Manage Settings →')).toHaveAttribute('href', '/settings')
  })
})