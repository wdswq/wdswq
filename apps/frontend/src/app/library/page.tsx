'use client'

import { useEffect, useState } from 'react'
import { Grid, List, Upload, RefreshCw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { LibraryFilters } from '@/components/library-filters'
import { LibraryItemCard } from '@/components/library-item-card'
import { EditItemModal } from '@/components/edit-item-modal'
import { DeleteItemModal } from '@/components/delete-item-modal'
import { Pagination } from '@/components/pagination'
import { useLibraryStore } from '@/store/library-store'
import { LibraryItem, LibraryFilters as LibraryFiltersType } from '@/types/library'

export default function LibraryPage() {
  const {
    items,
    uploadQueue,
    filters,
    pagination,
    isLoading,
    error,
    selectedItems,
    isEditModalOpen,
    isDeleteModalOpen,
    editingItem,
    deletingItem,
    setSelectedItems,
    toggleItemSelection,
    clearSelection,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    fetchItems,
    deleteItem,
    setLoading
  } = useLibraryStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleFiltersChange = (newFilters: LibraryFiltersType) => {
    fetchItems(1, newFilters)
  }

  const handlePageChange = (page: number) => {
    fetchItems(page, filters)
  }

  const handleRefresh = () => {
    fetchItems(pagination.page, filters)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id))
    } else {
      clearSelection()
    }
  }

  const handleBulkDelete = async () => {
    setLoading(true)
    try {
      await Promise.all(selectedItems.map(id => deleteItem(id)))
      clearSelection()
      fetchItems(pagination.page, filters)
    } catch (error) {
      console.error('Failed to delete items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditItem = (item: LibraryItem) => {
    openEditModal(item)
  }

  const handleDeleteItem = (item: LibraryItem) => {
    openDeleteModal(item)
  }

  const handleModalClose = () => {
    closeEditModal()
    closeDeleteModal()
    fetchItems(pagination.page, filters)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library</h1>
          <p className="text-muted-foreground">
            Browse and manage your content library.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button asChild>
            <a href="/upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </a>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <LibraryFilters onFiltersChange={handleFiltersChange} />

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={selectedItems.length === items.length && items.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-destructive">
              <p>Error: {error}</p>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && items.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your library...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && items.length === 0 && uploadQueue.length === 0 && (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No content yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload some files to get started with your knowledge library.
              </p>
              <Button asChild>
                <a href="/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Files
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Library Items */}
      {!isLoading && !error && (items.length > 0 || uploadQueue.length > 0) && (
        <div className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedItems.length === items.length && items.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({items.length} items)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <LibraryItemCard
                  key={item.id}
                  item={item}
                  isSelected={selectedItems.includes(item.id)}
                  onSelect={toggleItemSelection}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {items.map((item) => (
                    <div key={item.id} className="p-4">
                      <LibraryItemCard
                        item={item}
                        isSelected={selectedItems.includes(item.id)}
                        onSelect={toggleItemSelection}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

      {/* Modals */}
      <EditItemModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        item={editingItem}
      />
      
      <DeleteItemModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        item={deletingItem}
      />
    </div>
  )
}