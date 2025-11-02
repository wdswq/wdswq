import { File, FileText, Image, Film, Music, Archive, Code, FileSpreadsheet } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileTypeIconProps {
  mimeType: string
  className?: string
}

export function FileTypeIcon({ mimeType, className }: FileTypeIconProps) {
  const getIcon = () => {
    if (mimeType.startsWith('image/')) {
      return Image
    }
    if (mimeType.startsWith('video/')) {
      return Film
    }
    if (mimeType.startsWith('audio/')) {
      return Music
    }
    if (mimeType.includes('pdf')) {
      return FileText
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
      return FileSpreadsheet
    }
    if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar')) {
      return Archive
    }
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('xml') || mimeType.includes('html') || mimeType.includes('css')) {
      return Code
    }
    return File
  }

  const Icon = getIcon()
  
  return (
    <Icon className={cn('h-8 w-8', className)} />
  )
}