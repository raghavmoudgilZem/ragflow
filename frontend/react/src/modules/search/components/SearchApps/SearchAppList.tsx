import type { SearchAppItem } from '@modules/search/types/search.types'
import { Box, Button, Grid, Pagination, TextField, Typography } from '@mui/material'
import React from 'react'
import SearchAppCard from './SearchAppCard';
import AddIcon from '@mui/icons-material/Add';

interface SearchAppListProps {
    items: SearchAppItem[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    searchQuery: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    setIsModalOpen: (value: boolean) => void;
    isDeleting: boolean;
    onDelete: (id: string) => void;
}

const SearchAppList: React.FC<SearchAppListProps> = ({
    items,
    onPageChange,
    totalPages,
    currentPage,
    setIsModalOpen,
    searchQuery,
    setQuery,
    isDeleting,
    onDelete
}) => {
    const onSearchChange = (value: string) => {
        setQuery(value)
    }
    return (
        <Box sx={{ p: '2.5rem', margin: '0', boxSizing: 'border-box' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                    Search Apps
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        placeholder="Search configurations..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        variant="outlined"
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsModalOpen(true)}
                    >
                        Create App
                    </Button>
                </Box>
            </Box>
            <Grid container spacing={3}>
                {items.map((item) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                        <SearchAppCard item={item} isDeleting={isDeleting} onDelete={onDelete}/>
                    </Grid>
                ))}
            </Grid>

            {/* pagination */}
            <Box sx={{
                position: 'fixed',
                bottom: '2.5rem',
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
            }}>
                <Pagination count={totalPages} variant="outlined" color="primary" page={currentPage}
                    onChange={(_, value) => onPageChange(value)} />
            </Box>
        </Box>
    )
}

export default SearchAppList