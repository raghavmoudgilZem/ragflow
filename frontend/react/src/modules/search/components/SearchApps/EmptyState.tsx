// src/modules/search/components/SearchApps/EmptyState.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import ButtonComponent from '../../../../shared/components/common/ButtonComponent';

interface EmptyStateProps {
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmptyState: React.FC<EmptyStateProps> = ({ setIsOpen }) => {
    const handleClick = () => {
        setIsOpen(true);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                width: '100%',
                p: 3,
                boxSizing: 'border-box',
                bgcolor: 'var(--bg, transparent)'
            }}
        >
            {/* Action Card Button Area */}
            <ButtonComponent
                onClick={handleClick}
                sx={{
                    width: '100%',
                    maxWidth: '25rem',
                    minHeight: '12.5rem',
                    '&:hover': {
                        '& .empty-search-icon': {
                            color: 'primary.main',
                            transform: 'scale(1.1)'
                        },
                        '& .empty-add-icon': {
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText'
                        }
                    }
                }}
            >
                {/* Visual Anchor: Giant Center Background Search Graphic */}
                <SearchIcon
                    className="empty-search-icon"
                    sx={{
                        fontSize: 56,
                        color: 'text.disabled',
                        transition: 'all 0.2s ease-in-out'
                    }}
                />

                {/* Primary Descriptor Context Typography */}
                <Typography
                    variant="h6"
                    component="span"
                    sx={{
                        fontWeight: 600,
                        color: 'var(--text-h)',
                    }}
                >
                    No Search app created yet!
                </Typography>

                {/* Micro CTA Anchor Signifier pill */}
                <Box
                    className="empty-add-icon"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 1,
                        p: 0.5,
                        borderRadius: '50%',
                        border: '0.06rem solid',
                        borderColor: 'divider',
                        transition: 'all 0.2s ease-in-out'
                    }}
                >
                    <AddIcon sx={{ fontSize: '1.2rem' }} />
                </Box>
            </ButtonComponent>
        </Box>
    );
};

export default EmptyState;
