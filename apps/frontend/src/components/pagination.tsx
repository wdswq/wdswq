'use client'

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PaginationInfo } from '@/types/library'

interface PaginationProps {
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({ pagination, onPageChange, className }: PaginationProps) {
  const { page, totalPages, total } = pagination

  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page - delta && i <= page + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  const visiblePages = getVisiblePages()

  return (
    <div className={cn('flex items-center justify-between space-x-2', className)}>
      <div className="text-sm text-muted-foreground">
        Showing {total > 0 ? ((page - 1) * pagination.limit + 1) : 0} to{' '}
        {Math.min(page * pagination.limit, total)} of {total} results
      </div>
      
      <div className="flex items-center space-x-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center space-x-1"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="flex items-center space-x-1">
          {visiblePages.map((pageNum, index) => (
            <div key={index}>
              {pageNum === '...' ? (
                <Button variant="outline" size="sm" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant={page === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onPageChange(pageNum as number)}
                  className="min-w-[2.5rem]"
                >
                  {pageNum}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="flex items-center space-x-1"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}