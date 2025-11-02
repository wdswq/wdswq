'use client'

import { useState } from 'react'
import { ArrowLeft, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileUploader } from '@/components/file-uploader'
import { useLibraryStore } from '@/store/library-store'

export default function UploadPage() {
  const { uploadQueue } = useLibraryStore()
  const [showSuccess, setShowSuccess] = useState(false)

  const handleUploadComplete = () => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload</h1>
          <p className="text-muted-foreground">
            Upload new content to your library.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/library">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </a>
        </Button>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-green-800">
              <Library className="h-5 w-5" />
              <span>Files uploaded successfully! Check your library.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Uploader */}
      <FileUploader onUploadComplete={handleUploadComplete} />

      {/* Upload Queue Summary */}
      {uploadQueue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {uploadQueue.filter(f => f.status === 'completed').length} completed,{' '}
              {uploadQueue.filter(f => f.status === 'uploading' || f.status === 'processing').length} in progress,{' '}
              {uploadQueue.filter(f => f.status === 'failed').length} failed
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Supported File Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Documents: PDF, DOC, DOCX, TXT</li>
                <li>• Images: JPG, PNG, GIF, SVG</li>
                <li>• Videos: MP4, AVI, MOV</li>
                <li>• Audio: MP3, WAV, FLAC</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use descriptive filenames</li>
                <li>• Add relevant tags for easy searching</li>
                <li>• Organize files into appropriate categories</li>
                <li>• Keep file sizes under 100MB for faster processing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}