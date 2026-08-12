// src/modules/search/pages/SearchAppsLandingPage.tsx
import React, { useState } from 'react'
import EmptyState from '../components/SearchApps/EmptyState'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useSearchApps } from '../hooks/useSearchApps'
import SearchAppList from '../components/SearchApps/SearchAppList'
import { useDebounce } from '@shared/hooks/useDebounceHook'
import CreateSearchModal from '../components/SearchApps/CreateSearchModal'
import { useDeleteSearch } from '../hooks/useDeleteSearch'

const SearchAppsLandingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')

  const debouncedSearchQuery = useDebounce(query, 400)

  // Reset pagination index if search terms alter
  React.useEffect(() => {
    setPage(1)
  }, [debouncedSearchQuery])

  const { data, isPending, error } = useSearchApps({
    page,
    pageSize: 6,
    search: debouncedSearchQuery
  })

  const { mutateAsync: deleteApp, isPending: isDeletePending } = useDeleteSearch()

  if (isPending) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <Typography color="error">Error loading search applications.</Typography>
      </Box>
    )
  }

  const displayItems = data?.items || []
  const totalPages = data?.totalPages || 1
  const hasNoData = displayItems.length === 0
  const isSearchEmpty = debouncedSearchQuery === ''

  const handleDelete = async (id: string) => {
    try {
      await deleteApp(id)
    } catch (err) {
      console.error("Failed to delete application", err)
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        overflowY: 'auto',
        width: '100%'
      }}
    >
      {/* 
        FIXED: Render EmptyState OR the active Grid List within the 
        unified layout shell, keeping the dialog accessible at all times.
      */}
      {hasNoData && isSearchEmpty ? (
        <EmptyState setIsOpen={setIsModalOpen} />
      ) : (
        <SearchAppList
          items={displayItems}
          totalItems={displayItems.length}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
          searchQuery={query}
          setQuery={setQuery}
          setIsModalOpen={setIsModalOpen}
          isDeleting={isDeletePending}
          onDelete={handleDelete}
        />
      )}

      {/* This structural layout node is now safely accessible across states */}
      <CreateSearchModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </Box>
  )
}

export default SearchAppsLandingPage
