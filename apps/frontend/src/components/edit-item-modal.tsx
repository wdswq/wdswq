'use client'

import { useState, useEffect } from 'react'
import { X, Tag, Folder, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useLibraryStore } from '@/store/library-store'
import { LibraryItem } from '@/types/library'

interface EditItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: LibraryItem | null
}

const CATEGORIES = ['Documents', 'Images', 'Videos', 'Audio', 'Archives', 'Code', 'Other']
const COMMON_TAGS = ['work', 'personal', 'important', 'draft', 'final', 'archive']

export function EditItemModal({ isOpen, onClose, item }: EditItemModalProps) {
  const { updateItemMetadata } = useLibraryStore()
  const [filename, setFilename] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [customTag, setCustomTag] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (item) {
      setFilename(item.originalName)
      setCategory(item.category)
      setTags(item.tags)
    }
  }, [item])

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags(prev => [...prev, customTag.trim()])
      setCustomTag('')
    }
  }

  const handleSave = async () => {
    if (!item) return

    setIsLoading(true)
    try {
      await updateItemMetadata(item.id, {
        originalName: filename,
        category,
        tags
      })
      handleClose()
    } catch (error) {
      console.error('Failed to update item:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFilename('')
    setCategory('')
    setTags([])
    setCustomTag('')
    setIsLoading(false)
    onClose()
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Edit File</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* File Info */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.originalName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.type} • {(item.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="text-sm font-medium mb-2 block">Filename</label>
            <Input
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center space-x-2">
              <Folder className="h-4 w-4" />
              <span>Category</span>
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium mb-2 block flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Tags</span>
            </label>
            <div className="space-y-3">
              {/* Common Tags */}
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant={tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              {/* Custom Tag Input */}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add custom tag..."
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                  className="flex-1"
                />
                <Button onClick={handleAddCustomTag} size="sm" variant="outline">
                  Add
                </Button>
              </div>

              {/* Selected Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}