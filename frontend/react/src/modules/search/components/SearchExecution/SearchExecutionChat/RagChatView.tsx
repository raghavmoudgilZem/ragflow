import React from 'react';
import { Box, Typography, Link, useTheme } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AISummaryView from './AISummaryView';
import { chatViewStyles } from './SearchExecutionChat.styles';
import { REFERENCE } from '@modules/search/constants/mockReferences';

interface ReferenceFile {
    id: string;
    name: string;
    snippet: string;
}

interface RAGChatViewProps {
    streamedResponse: string;
    references?: ReferenceFile[];
}

const RAGChatView: React.FC<RAGChatViewProps> = ({ streamedResponse, references = [] }) => {
    const theme = useTheme();
    // Fallback mock references matching the provided RAGFlow UI upload canvas styling
    const activeReferences = references.length > 0 ? references : REFERENCE;

    return (
        <Box sx={chatViewStyles.container}>
            {/* Top Text Processing Panel Layout (Dynamic typing text) */}
            <Box sx={chatViewStyles.topPanel}>
                <AISummaryView text={streamedResponse} />
            </Box>

            {/* Bottom Segment Layout Layer: Document References Grid Mapping */}
            <Box sx={chatViewStyles.bottomSegment}>
                <Typography variant="subtitle2" sx={chatViewStyles.referencesTitle(theme)}>
                    References
                </Typography>

                <Box sx={chatViewStyles.referencesList}>
                    {activeReferences.map((ref) => (
                        <Box key={ref.id} sx={chatViewStyles.referenceItem}>
                            {/* PDF Reference Document Pill Flag */}
                            <Box sx={chatViewStyles.pillFlag(theme)}>
                                <InsertDriveFileIcon sx={chatViewStyles.pillIcon(theme)} />
                                <Link underline="hover" sx={chatViewStyles.pillLink(theme)}>
                                    {ref.name}
                                </Link>
                            </Box>

                            {/* Extracted Document Context Snippet Area */}
                            <Typography variant="body2" sx={chatViewStyles.snippetText(theme)}>
                                • {ref.snippet}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default RAGChatView;