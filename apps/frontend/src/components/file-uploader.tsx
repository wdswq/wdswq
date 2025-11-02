'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useLibraryStore } from '@/store/library-store'
import { UploadFile } from '@/types/library'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onUploadComplete?: () => void
}

const CATEGORIES = ['Documents', 'Images', 'Videos', 'Audio', 'Archives', 'Code', 'Other']
const COMMON_TAGS = ['work', 'personal', 'important', 'draft', 'final', 'archive']

export function FileUploader({ onUploadComplete }: FileUploaderProps) {
  const { uploadQueue, uploadFiles, removeFromUploadQueue } = useLibraryStore()
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [customTag, setCustomTag] = useState('')

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false
  })

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags(prev => [...prev, customTag.trim()])
      setCustomTag('')
    }
  }

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleRemoveUploadFile = (uploadFile: UploadFile) => {
    removeFromUploadQueue(uploadFile.id)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return
    
    await uploadFiles(selectedFiles, selectedTags, selectedCategory)
    setSelectedFiles([])
    setSelectedTags([])
    setSelectedCategory('')
    onUploadComplete?.()
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusColor = (status: UploadFile['status']) => {
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
        return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            )}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Selection */}
      {selectedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Selected Files ({selectedFiles.length})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles([])}
              >
                Clear All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tag Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {COMMON_TAGS.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
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

                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
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

            {/* File List */}
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button onClick={handleUpload} className="w-full" disabled={selectedFiles.length === 0}>
              Upload {selectedFiles.length} File{selectedFiles.length !== 1 ? 's' : ''}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadQueue.map((uploadFile) => (
              <div key={uploadFile.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{uploadFile.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(uploadFile.file.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusColor(uploadFile.status)}>
                      {uploadFile.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveUploadFile(uploadFile)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {uploadFile.status === 'uploading' && (
                  <div className="space-y-1">
                    <Progress value={uploadFile.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground text-center">
                      {uploadFile.progress}% uploaded
                    </p>
                  </div>
                )}
                
                {uploadFile.status === 'processing' && (
                  <div className="space-y-1">
                    <Progress value={undefined} className="h-2 animate-pulse" />
                    <p className="text-xs text-muted-foreground text-center">
                      Processing...
                    </p>
                  </div>
                )}
                
                {uploadFile.status === 'failed' && uploadFile.errorMessage && (
                  <p className="text-xs text-destructive">
                    {uploadFile.errorMessage}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}