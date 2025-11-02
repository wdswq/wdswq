import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { LibraryItem, UploadFile, LibraryFilters, PaginationInfo } from '@/types/library'

interface LibraryStore {
  // State
  items: LibraryItem[]
  uploadQueue: UploadFile[]
  filters: LibraryFilters
  pagination: PaginationInfo
  isLoading: boolean
  error: string | null
  
  // Selected items for bulk operations
  selectedItems: string[]
  
  // Modal states
  isEditModalOpen: boolean
  isDeleteModalOpen: boolean
  editingItem: LibraryItem | null
  deletingItem: LibraryItem | null

  // Actions
  setItems: (items: LibraryItem[]) => void
  addItem: (item: LibraryItem) => void
  updateItem: (id: string, updates: Partial<LibraryItem>) => void
  removeItem: (id: string) => void
  
  // Upload actions
  addToUploadQueue: (files: File[], tags?: string[], category?: string) => void
  updateUploadProgress: (id: string, progress: number, status?: UploadFile['status']) => void
  removeFromUploadQueue: (id: string) => void
  clearUploadQueue: () => void
  
  // Filter actions
  setFilters: (filters: Partial<LibraryFilters>) => void
  resetFilters: () => void
  
  // Pagination actions
  setPagination: (pagination: Partial<PaginationInfo>) => void
  
  // Selection actions
  setSelectedItems: (ids: string[]) => void
  toggleItemSelection: (id: string) => void
  clearSelection: () => void
  
  // Modal actions
  openEditModal: (item: LibraryItem) => void
  closeEditModal: () => void
  openDeleteModal: (item: LibraryItem) => void
  closeDeleteModal: () => void
  
  // Loading and error actions
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  
  // Data fetching
  fetchItems: (page?: number, filters?: Partial<LibraryFilters>) => Promise<void>
  uploadFiles: (files: File[], tags?: string[], category?: string) => Promise<void>
  updateItemMetadata: (id: string, metadata: Partial<LibraryItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
}

const initialFilters: LibraryFilters = {
  search: '',
  categories: [],
  tags: [],
  types: [],
  status: []
}

const initialPagination: PaginationInfo = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
}

export const useLibraryStore = create<LibraryStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      items: [],
      uploadQueue: [],
      filters: initialFilters,
      pagination: initialPagination,
      isLoading: false,
      error: null,
      selectedItems: [],
      isEditModalOpen: false,
      isDeleteModalOpen: false,
      editingItem: null,
      deletingItem: null,

      // Item actions
      setItems: (items) => set({ items }),
      
      addItem: (item) => set((state) => ({
        items: [item, ...state.items]
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, ...updates } : item
        )
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id),
        selectedItems: state.selectedItems.filter(selectedId => selectedId !== id)
      })),

      // Upload actions
      addToUploadQueue: (files, tags = [], category = '') => {
        const uploadFiles: UploadFile[] = files.map(file => ({
          file,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          progress: 0,
          status: 'pending' as const,
          tags,
          category
        }))
        
        set((state) => ({
          uploadQueue: [...state.uploadQueue, ...uploadFiles]
        }))
      },
      
      updateUploadProgress: (id, progress, status) => set((state) => ({
        uploadQueue: state.uploadQueue.map(file =>
          file.id === id
            ? { ...file, progress, ...(status && { status }) }
            : file
        )
      })),
      
      removeFromUploadQueue: (id) => set((state) => ({
        uploadQueue: state.uploadQueue.filter(file => file.id !== id)
      })),
      
      clearUploadQueue: () => set({ uploadQueue: [] }),

      // Filter actions
      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),
      
      resetFilters: () => set({ filters: initialFilters }),

      // Pagination actions
      setPagination: (newPagination) => set((state) => ({
        pagination: { ...state.pagination, ...newPagination }
      })),

      // Selection actions
      setSelectedItems: (ids) => set({ selectedItems: ids }),
      
      toggleItemSelection: (id) => set((state) => ({
        selectedItems: state.selectedItems.includes(id)
          ? state.selectedItems.filter(selectedId => selectedId !== id)
          : [...state.selectedItems, id]
      })),
      
      clearSelection: () => set({ selectedItems: [] }),

      // Modal actions
      openEditModal: (item) => set({
        isEditModalOpen: true,
        editingItem: item
      }),
      
      closeEditModal: () => set({
        isEditModalOpen: false,
        editingItem: null
      }),
      
      openDeleteModal: (item) => set({
        isDeleteModalOpen: true,
        deletingItem: item
      }),
      
      closeDeleteModal: () => set({
        isDeleteModalOpen: false,
        deletingItem: null
      }),

      // Loading and error actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Data fetching actions (mock implementations for now)
      fetchItems: async (page = 1) => {
        const state = get()
        state.setLoading(true)
        state.setError(null)
        
        try {
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Mock data
          const mockItems: LibraryItem[] = [
            {
              id: '1',
              filename: 'document.pdf',
              originalName: 'My Document.pdf',
              mimeType: 'application/pdf',
              size: 1024000,
              status: 'completed',
              tags: ['work', 'important'],
              category: 'Documents',
              type: 'PDF',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          ]
          
          state.setItems(mockItems)
          state.setPagination({
            page,
            total: mockItems.length,
            totalPages: 1
          })
        } catch {
          state.setError('Failed to fetch items')
        } finally {
          state.setLoading(false)
        }
      },

      uploadFiles: async (files, tags = [], category = '') => {
        const state = get()
        state.addToUploadQueue(files, tags, category)
        
        // Mock upload process - replace with actual API
        for (const uploadFile of state.uploadQueue) {
          try {
            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 10) {
              state.updateUploadProgress(uploadFile.id, progress, 'uploading')
              await new Promise(resolve => setTimeout(resolve, 100))
            }
            
            // Add to library items
            const newItem: LibraryItem = {
              id: uploadFile.id,
              filename: uploadFile.file.name,
              originalName: uploadFile.file.name,
              mimeType: uploadFile.file.type,
              size: uploadFile.file.size,
              status: 'completed',
              tags: uploadFile.tags,
              category: uploadFile.category,
              type: uploadFile.file.type.split('/')[1]?.toUpperCase() || 'FILE',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
            
            state.addItem(newItem)
            state.removeFromUploadQueue(uploadFile.id)
          } catch {
            state.updateUploadProgress(uploadFile.id, 0, 'failed')
          }
        }
      },

      updateItemMetadata: async (id, metadata) => {
        const state = get()
        state.updateItem(id, metadata)
        // Mock API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 500))
      },

      deleteItem: async (id) => {
        const state = get()
        state.setLoading(true)
        
        try {
          // Mock API call - replace with actual API
          await new Promise(resolve => setTimeout(resolve, 500))
          state.removeItem(id)
        } catch {
          state.setError('Failed to delete item')
        } finally {
          state.setLoading(false)
        }
      }
    }),
    {
      name: 'library-store'
    }
  )
)
