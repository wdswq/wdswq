'use client'

import { cn } from '@/lib/utils'
import { HTMLAttributes, forwardRef } from 'react'
import { X } from 'lucide-react'

export interface TagProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
  removable?: boolean
  onRemove?: () => void
}

const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    removable = false,
    onRemove,
    children,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200'
    
    const variants = {
      primary: 'bg-primary-100 text-primary-800 border border-primary-200',
      secondary: 'bg-glass-light text-primary-700 border border-white/20',
      accent: 'bg-gradient-to-r from-accent-blue to-accent-purple text-white',
      success: 'bg-green-100 text-green-800 border border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      error: 'bg-red-100 text-red-800 border border-red-200'
    }

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    }

    return (
      <span
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
        {removable && (
          <button
            onClick={onRemove}
            className="ml-2 hover:opacity-70 transition-opacity focus-ring rounded-full p-0.5"
            aria-label="Remove tag"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </span>
    )
  }
)

Tag.displayName = 'Tag'

export default Tag