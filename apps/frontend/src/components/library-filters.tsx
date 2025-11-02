'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useLibraryStore } from '@/store/library-store'
import { type LibraryFilters } from '@/types/library'

interface LibraryFiltersProps {
  onFiltersChange: (filters: LibraryFilters) => void
}

const CATEGORIES = ['Documents', 'Images', 'Videos', 'Audio', 'Archives', 'Code', 'Other']
const TYPES = ['PDF', 'JPG', 'PNG', 'MP4', 'MP3', 'ZIP', 'DOC', 'XLS', 'TXT']
const STATUSES = ['uploading', 'processing', 'completed', 'failed'] as const
const COMMON_TAGS = ['work', 'personal', 'important', 'draft', 'final', 'archive']

export function LibraryFilters({ onFiltersChange }: LibraryFiltersProps) {
  const { filters, setFilters } = useLibraryStore()
  const [isExpanded, setIsExpanded] = useState(false)
  const [customTag, setCustomTag] = useState('')

  const handleSearchChange = (value: string) => {
    const newFilters = { ...filters, search: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTypeToggle = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type]
    
    const newFilters = { ...filters, types: newTypes }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleStatusToggle = (status: typeof STATUSES[number]) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status]
    
    const newFilters = { ...filters, status: newStatuses }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag]
    
    const newFilters = { ...filters, tags: newTags }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !filters.tags.includes(customTag.trim())) {
      const newTags = [...filters.tags, customTag.trim()]
      const newFilters = { ...filters, tags: newTags }
      setFilters(newFilters)
      onFiltersChange(newFilters)
      setCustomTag('')
    }
  }

  const clearAllFilters = () => {
    const newFilters: LibraryFilters = {
      search: '',
      categories: [],
      tags: [],
      types: [],
      status: []
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const hasActiveFilters = !!(
    filters.search ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.types.length > 0 ||
    filters.status.length > 0
  )

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1">
              {filters.categories.length + filters.tags.length + filters.types.length + filters.status.length}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearAllFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filter Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Categories */}
            <div>
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Badge
                    key={category}
                    variant={filters.categories.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleCategoryToggle(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="font-medium mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <Badge
                    key={status}
                    variant={filters.status.includes(status) ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => handleStatusToggle(status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <h3 className="font-medium mb-3">File Types</h3>
              <div className="flex flex-wrap gap-2">
                {TYPES.map((type) => (
                  <Badge
                    key={type}
                    variant={filters.types.includes(type) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTypeToggle(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h3 className="font-medium mb-3">Tags</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                {/* Custom tag input */}
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Add custom tag..."
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                    className="flex-1"
                  />
                  <Button onClick={handleAddCustomTag} size="sm">
                    Add
                  </Button>
                </div>

                {/* Selected tags */}
                {filters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {filters.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}