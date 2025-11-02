'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { useLibraryStore } from '@/store/library-store'
import { LibraryItem } from '@/types/library'

interface DeleteItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: LibraryItem | null
}

export function DeleteItemModal({ isOpen, onClose, item }: DeleteItemModalProps) {
  const { deleteItem, isLoading } = useLibraryStore()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!item) return

    setIsDeleting(true)
    try {
      await deleteItem(item.id)
      onClose()
    } catch (error) {
      console.error('Failed to delete item:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setIsDeleting(false)
    onClose()
  }

  if (!item) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>Delete File</span>
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this file? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Info */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="space-y-2">
              <p className="font-medium">{item.originalName}</p>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Type: {item.type}</p>
                <p>Size: {(item.size / 1024 / 1024).toFixed(2)} MB</p>
                <p>Uploaded: {new Date(item.createdAt).toLocaleDateString()}</p>
              </div>
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block bg-background px-2 py-1 text-xs rounded border"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Warning:</p>
                <p>
                  This will permanently delete the file and all its associated data. 
                  Any links to this file will no longer work.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose} 
            disabled={isDeleting || isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting || isLoading}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete File'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}