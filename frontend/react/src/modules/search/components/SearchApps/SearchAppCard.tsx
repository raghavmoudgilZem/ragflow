import type { SearchAppItem } from '@modules/search/types/search.types'
import { Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Typography } from '@mui/material'
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { styles } from './SearchAppCard.styles';

interface SearchAppCardProps {
    item: SearchAppItem;
    onDelete: (id: string) => void;
    isDeleting?: boolean;
}

const SearchAppCard: React.FC<SearchAppCardProps> = ({ item, isDeleting, onDelete }) => {
    const navigate = useNavigate();
    const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

    const handleDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        setIsConfirmOpen(true);
    };

    const handleConfirmClose = (event?: React.MouseEvent) => {
        if (event) event.stopPropagation();
        setIsConfirmOpen(false);
    };

    const handleConfirmDelete = async (event: React.MouseEvent) => {
        event.stopPropagation();
        handleConfirmClose();
        await onDelete(item.id);
    };

    return (
        <>
            <Card sx={styles.card} onClick={() => navigate(`/searches/${item.id}`)}>
                <Box
                    className="delete-btn-target"
                    sx={styles.box}
                >
                    <IconButton
                        aria-label="delete search application"
                        onClick={handleDeleteClick}
                        disabled={isDeleting}
                        sx={styles.iconButton}
                    >
                        {isDeleting ? <CircularProgress size={20} color="error" /> : <DeleteForeverIcon />}
                    </IconButton>
                </Box>
                <CardContent>
                    <Typography variant="h6" component="h2" sx={{ color: 'var(--text-h)' }}>
                        {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ID: {item.id}
                    </Typography>
                </CardContent>
            </Card>
            <Dialog
                open={isConfirmOpen}
                onClose={() => handleConfirmClose()}
                onClick={(e) => e.stopPropagation()} // Absorbs clicks to prevent underlying routing
                aria-labelledby="delete-dialog-title"
                aria-describedby="delete-dialog-description"
            >
                <DialogTitle id="delete-dialog-title">
                    Delete Search Application?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="delete-dialog-description">
                        Are you sure you want to permanently delete <strong>{item.name}</strong>? This action will remove all configuration settings and logs and cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button onClick={handleConfirmClose} variant="outlined" color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} variant="contained" color="error" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default SearchAppCard