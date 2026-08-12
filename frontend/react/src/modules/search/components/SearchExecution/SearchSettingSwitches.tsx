import React from 'react';
import { Box } from '@mui/material';
import { BaseSwitch } from '@shared/components/common/BaseSwitch';
import AISummary from './AISummary';

// 1. Group the switches into a single interface
export interface SearchSettings {
    rerankModel: boolean;
    aiSummary: boolean;
    relatedSearch: boolean;
    queryMindmap: boolean;
}

interface SwitchesProps {
    settings: SearchSettings;
    updateSetting: (key: keyof SearchSettings, value: boolean) => void;
    llmSetting: any;
    setLlmSetting: (v: any) => void;
    chatId: any;
    setChatId: (v: any) => void;
}

export const SearchSettingSwitches = ({
    settings,
    updateSetting,
    llmSetting,
    setLlmSetting,
    chatId,
    setChatId,
}: SwitchesProps) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <BaseSwitch
                label="Rerank Model"
                checked={settings.rerankModel}
                onChange={(checked) => updateSetting('rerankModel', checked)}
            />

            <BaseSwitch
                label="AI Summary"
                checked={settings.aiSummary}
                onChange={(checked) => updateSetting('aiSummary', checked)}
            />

            {settings.aiSummary && (
                <AISummary
                    chatId={chatId}
                    setChatId={setChatId}
                    isOpen={settings.aiSummary}
                    llmSetting={llmSetting}
                    setLlmSetting={setLlmSetting}
                />
            )}

            <BaseSwitch
                label="Enable Related Search"
                checked={settings.relatedSearch}
                onChange={(checked) => updateSetting('relatedSearch', checked)}
            />

            <BaseSwitch
                label="Show Query Mindmap"
                checked={settings.queryMindmap}
                onChange={(checked) => updateSetting('queryMindmap', checked)}
            />
        </Box>
    );
};
