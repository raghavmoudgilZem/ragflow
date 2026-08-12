import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetSearchApp } from '../hooks/useGetSearchApp'
import { Box, IconButton, InputBase, Paper, Typography, useTheme } from '@mui/material';
import ButtonComponent from '@shared/components/common/ButtonComponent';
import SearchIcon from '@mui/icons-material/Search';
import { PageLayout } from '@shared/components/common/PageLayout';
import SearchSettingConfig from '../components/SearchExecution/SearchSettingConfig';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SearchSkeletonView from '../components/SearchExecution/SearchExecutionChat/SearchSkeletonView';
import RAGChatView from '../components/SearchExecution/SearchExecutionChat/RagChatView';
import { styles } from './SearchExecutionPage.style';

const SearchExecutionPage = () => {
    const theme = useTheme();
    const { id } = useParams<{ id: string }>();
    const [isConfigSaved, setIsConfigSaved] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    // State management for execution lifecycle
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
    const [isSearching, setIsSearching] = useState<boolean>(false);

    // Server-Sent Events (SSE) Streaming Content States
    const [streamedResponse, setStreamedResponse] = useState<string>('');

    const { data: currentConfig } = useGetSearchApp(id || '');
    const isDrawerOpen = !isConfigSaved;

    const handleTriggerSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation check to block empty or whitespace-only inputs
        if (!searchQuery || !searchQuery.trim()) {
            return;
        }

        // Initialize Layout Animations & Loading Screens
        setHasSubmitted(true);
        setIsSearching(true);
        setStreamedResponse(''); // Clear out old streams from prior searches

        // --- SIMULATING SERVER-SENT EVENTS (SSE) REAL-TIME STREAMING ---
        // 1. Force skeleton viewport visualization block to simulate server cold-start/latency
        setTimeout(() => {
            setIsSearching(false); // Drop skeleton screens to mount the reading stream view

            const mockTokens = [
                "Based ", "on ", "your ", "dataset ", "parameters, ", "RAGFlow ", "has ", "analyzed ",
                "the ", "uploaded ", "knowledge ", "base. ", "The ", "retrieved ", "documents ",
                "indicate ", "that ", "system ", "performance ", "scales ", "linearly ", "with ",
                "the ", "allocated ", "vector ", "weights. ", "Furthermore, ", "the ", "similarity ",
                "threshold ", "of ", `${0.2} `, "safely ", "filters ", "out ", "irrelevant ",
                "noise ", "while ", "preserving ", "highly ", "contextual ", "reference ", "nodes."
            ];

            let currentTokenIndex = 0;

            // 2. Simulate standard Server-Sent Event intervals pulsing from an EventSource stream
            const sseInterval = setInterval(() => {
                if (currentTokenIndex < mockTokens.length) {
                    setStreamedResponse((prev) => prev + mockTokens[currentTokenIndex]);
                    currentTokenIndex++;
                } else {
                    clearInterval(sseInterval); // Stream complete channel closures
                }
            }, 60); // Typographic pacing replication speed

        }, 1500); // 1.5-second skeleton loading simulation threshold
    };

    return (
        <PageLayout sx={styles.pageLayout(theme)}>

            <Box sx={styles.mainContentWrapper(hasSubmitted)}>

                <Box sx={styles.topContainer(hasSubmitted)}>

                    {/* 💡 Pass 'theme' here to resolve theme.palette.custom.indigo */}
                    <Typography variant="h3" sx={styles.brandHeader(hasSubmitted, theme)}>
                        RAGFlow
                    </Typography>

                    <Box sx={styles.greetingWrapper(hasSubmitted)}>
                        <Box sx={styles.greetingInnerBox()}>
                            {/* 💡 MUI can resolve simple object paths via strings if theme is active */}
                            <Typography variant="h6" color="custom.textMuted" sx={styles.greetingWaveText(theme)}>
                                <span role="img" aria-label="wave">👋</span> Hi there
                            </Typography>
                            <Typography variant="h5" sx={styles.greetingWelcomeText(theme)}>
                                Welcome back
                            </Typography>
                        </Box>
                    </Box>

                    <Paper component="form" onSubmit={handleTriggerSearch} elevation={0} sx={styles.searchBarPaper(hasSubmitted, theme)}>
                        <InputBase
                            sx={styles.searchInput(theme)}
                            placeholder="How can I help you today?"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <IconButton type="submit" sx={styles.searchButton(theme)} aria-label="search">
                            <SearchIcon />
                        </IconButton>
                    </Paper>
                </Box>

                {hasSubmitted && (
                    <Box sx={styles.chatContainer(theme)}>
                        {isSearching ? <SearchSkeletonView /> : <RAGChatView streamedResponse={streamedResponse} />}
                    </Box>
                )}
            </Box>

            {isDrawerOpen && currentConfig && (
                <SearchSettingConfig
                    isOpen={isDrawerOpen}
                    onClose={() => setIsConfigSaved(true)}
                    currentConfig={currentConfig}
                />
            )}

            <ButtonComponent onClick={() => setIsConfigSaved((prev) => !prev)} sx={styles.settingsButton(theme)}>
                <SettingsOutlinedIcon />
            </ButtonComponent>

        </PageLayout>
    );
};

export default SearchExecutionPage;
