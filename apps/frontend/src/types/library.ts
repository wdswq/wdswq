export interface LibraryItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'failed'
  progress?: number
  thumbnailUrl?: string
  downloadUrl?: string
  tags: string[]
  category: string
  type: string
  createdAt: string
  updatedAt: string
  metadata?: Record<string, unknown>
  errorMessage?: string
}

export interface UploadFile {
  file: File
  id: string
  progress: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
  tags: string[]
  category: string
  errorMessage?: string
}

export interface LibraryFilters {
  search: string
  categories: string[]
  tags: string[]
  types: string[]
  status: LibraryItem['status'][]
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}
