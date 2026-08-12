import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { summaryStyles } from './SearchExecutionChat.styles';

interface AISummaryViewProps {
    text: string;
}

const AISummaryView: React.FC<AISummaryViewProps> = ({ text }) => {
    const isStreamActive = !text.endsWith('.');
    const theme = useTheme();

    return (
        <Box sx={summaryStyles.container(theme)}>
            <Box sx={summaryStyles.innerWrapper}>
                <Typography variant="subtitle2" sx={summaryStyles.title(theme)}>
                    AI Summary
                </Typography>
                
                <Typography 
                    variant="body1" 
                    sx={summaryStyles.bodyText(isStreamActive, theme)}
                >
                    {text}
                </Typography>
            </Box>
        </Box>
    );
};

export default AISummaryView;