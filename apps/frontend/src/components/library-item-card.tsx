'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { Download, Edit, Trash2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { FileTypeIcon } from '@/components/file-type-icon'
import { useLibraryStore } from '@/store/library-store'
import { LibraryItem } from '@/types/library'
import { cn } from '@/lib/utils'

interface LibraryItemCardProps {
  item: LibraryItem
  isSelected: boolean
  onSelect: (id: string) => void
  onEdit: (item: LibraryItem) => void
  onDelete: (item: LibraryItem) => void
}

export function LibraryItemCard({ 
  item, 
  isSelected, 
  onSelect, 
  onEdit, 
  onDelete 
}: LibraryItemCardProps) {
  const [showActions, setShowActions] = useState(false)
  const { deleteItem } = useLibraryStore()

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusColor = (status: LibraryItem['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'processing':
        return 'secondary'
      case 'uploading':
        return 'outline'
      case 'failed':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const handleDelete = async () => {
    await deleteItem(item.id)
    onDelete(item)
  }

  return (
    <Card 
      className={cn(
        'group relative hover:shadow-md transition-all duration-200',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => onSelect(item.id)}
              className="mt-1"
            />
            <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
              {item.thumbnailUrl ? (
                <Image 
                  src={item.thumbnailUrl} 
                  alt={item.filename}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <FileTypeIcon mimeType={item.mimeType} />
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusColor(item.status)}>
              {item.status}
            </Badge>
            
            {showActions && (
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(item.downloadUrl, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => window.open(item.downloadUrl, '_blank')}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium text-sm truncate" title={item.originalName}>
            {item.originalName}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatFileSize(item.size)}</span>
            <span>{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
          </div>

          {item.status === 'uploading' && item.progress !== undefined && (
            <div className="space-y-1">
              <Progress value={item.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {item.progress}% uploaded
              </p>
            </div>
          )}

          {item.status === 'processing' && (
            <div className="space-y-1">
              <Progress value={undefined} className="h-2 animate-pulse" />
              <p className="text-xs text-muted-foreground text-center">
                Processing...
              </p>
            </div>
          )}

          {item.status === 'failed' && item.errorMessage && (
            <p className="text-xs text-destructive">
              {item.errorMessage}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}