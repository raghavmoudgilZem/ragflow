import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, IconButton, Button, Select, MenuItem, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next'; // 1. Import the hook
import { SearchSettingSwitches, type SearchSettings } from './SearchSettingSwitches';
import { SearchSettingSliders, type SliderValues } from './SearchSettingSliders';
import { BaseTooltip } from '@shared/components/common/BaseToolTip';
import { useUpdateConfig } from '@modules/search/hooks/useUpdateConfig';
import type { SearchAppItem } from '@modules/search/types/search.types';
import { metaDataItems, searchConfigAppDefaultDescription } from '@modules/search/constants/common';
import { BaseDropdown } from '@shared/components/common/BaseDropdown';
import { styles } from './SearchSettingConfig.style';

export const SearchSettingConfig = ({
    isOpen,
    onClose,
    currentConfig
}: {
    isOpen: boolean;
    onClose?: () => void;
    currentConfig: SearchAppItem;
}) => {
    // 2. Initialize the translation function
    const { t } = useTranslation(); 
    const theme = useTheme();

    if (!isOpen) return null;

    const searchConfig = currentConfig?.search_config;

    // 1. Unified State Management
    const [name, setName] = useState(() => currentConfig?.name ?? '');
    const [chatId, setChatId] = useState(() => searchConfig?.chat_id ?? '');
    const [description, setDescription] = useState(() => currentConfig?.description ?? searchConfigAppDefaultDescription);
    const [metaData, setMetaData] = useState<string>(() => searchConfig?.meta_data ?? '');
    const [llmSetting, setLlmSetting] = useState<any>(() => searchConfig?.llm_setting ?? null);

    const [sliderValues, setSliderValues] = useState<SliderValues>(() => ({
        similarity: searchConfig?.similarity_threshold ?? 0.2,
        vectorWeight: searchConfig?.vector_similarity_weight ?? 0.7,
    }));

    const [switchValues, setSwitchValues] = useState<SearchSettings>(() => ({
        rerankModel: searchConfig?.rerank_model ?? false,
        aiSummary: searchConfig?.summary ?? false,
        relatedSearch: searchConfig?.related_search ?? false,
        queryMindmap: searchConfig?.query_mindmap ?? false,
    }));

    // 2. Synchronized State Hook
    useEffect(() => {
        if (!currentConfig) return;

        setName(currentConfig.name ?? '');
        setDescription(currentConfig.description ?? searchConfigAppDefaultDescription);

        const config = currentConfig.search_config;
        if (config) {
            setChatId(config.chat_id ?? '');
            setMetaData(config.meta_data ?? '');
            setLlmSetting(config.llm_setting ?? null);

            setSliderValues({
                similarity: config.similarity_threshold ?? 0.2,
                vectorWeight: config.vector_similarity_weight ?? 0.7,
            });

            setSwitchValues({
                rerankModel: config.rerank_model ?? false,
                aiSummary: config.summary ?? false,
                relatedSearch: config.related_search ?? false,
                queryMindmap: config.query_mindmap ?? false,
            });
        }
    }, [currentConfig?.id]);

    const handleSliderChange = (key: keyof SliderValues, val: number) => {
        setSliderValues(prev => ({ ...prev, [key]: val }));
    };

    const handleSwitchChange = (key: keyof SearchSettings, val: boolean) => {
        setSwitchValues(prev => ({ ...prev, [key]: val }));
    };

    const { mutate: updateConfig, isPending: isUpdatePending } = useUpdateConfig();

    const handleSave = () => {
        if (!currentConfig?.id || isUpdatePending) return;

        updateConfig({
            search_id: currentConfig.id,
            name: name,
            avatar: currentConfig.avatar || '',
            description: description,
            tenant_id: currentConfig.tenant_id || '',
            search_config: {
                chat_id: chatId,
                similarity_threshold: sliderValues.similarity,
                vector_similarity_weight: sliderValues.vectorWeight,
                summary: switchValues.aiSummary,
                related_search: switchValues.relatedSearch,
                query_mindmap: switchValues.queryMindmap,
                llm_setting: llmSetting,
                rerank_model: switchValues.rerankModel,
                meta_data: metaData,
            }
        });
    };

    return (
        <Box sx={styles.container(theme)}>

            {/* Header Container Area */}
            <Box sx={styles.headerWrapper(theme)}>
                <Typography variant="subtitle1" sx={styles.headerTitle(theme)}>
                    {t('searchConfig.title')}
                </Typography>
                {onClose && (
                    <IconButton onClick={onClose} size="small" sx={styles.closeButton(theme)}>
                        <CloseIcon sx={{ fontSize: '1.1rem' }} />
                    </IconButton>
                )}
            </Box>

            {/* Main Core Scrollable Form Content */}
            <Box sx={styles.formContent(theme)}>

                <Box sx={styles.fieldGroup(theme)}>
                    <Typography variant="caption" sx={styles.label(theme)}>{t('searchConfig.name')}</Typography>
                    <TextField fullWidth variant="outlined" value={name} onChange={(e) => setName(e.target.value)} sx={styles.textInput(theme)} />
                </Box>

                <Box sx={styles.fieldGroup(theme)}>
                    <Typography variant="caption" sx={styles.label(theme)}>{t('searchConfig.avatar')}</Typography>
                    <Box sx={styles.avatarRow(theme)}>
                        <Box sx={styles.uploadBox(theme)}>
                            <input type="file" hidden accept="image/*" />
                            <AddIcon sx={{ fontSize: '1.1rem' }} />
                            <Typography sx={styles.uploadText(theme)}>{t('searchConfig.upload')}</Typography>
                        </Box>
                        <Typography variant="caption" sx={styles.uploadHelperText(theme)}>
                            {t('searchConfig.uploadHelper')}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={styles.fieldGroup(theme)}>
                    <Typography variant="caption" sx={styles.label(theme)}>{t('searchConfig.description')}</Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        sx={styles.descriptionInput(theme)}
                    />
                </Box>

                <Box sx={styles.fieldGroup(theme)}>
                    <Typography variant="caption" sx={styles.labelRequired(theme)}>
                        {t('searchConfig.datasets')}
                        <BaseTooltip text={t('searchConfig.datasetsTooltip')} />
                    </Typography>
                    <Select fullWidth displayEmpty defaultValue="" sx={styles.selectInput(theme)}>
                        <MenuItem value="" disabled>
                            <span style={{ color: 'custom.textMutedDarkest' }}>{t('searchConfig.pleaseSelect')}</span>
                        </MenuItem>
                    </Select>
                </Box>

                <BaseDropdown
                    label={t('searchConfig.metaData')}
                    items={metaDataItems}
                    placeholder={t('searchConfig.selectMetaData')}
                    value={metaData}
                    onChange={setMetaData}
                />

                {/* REUSABLE COMPONENT: Range Sliders Container Area */}
                <SearchSettingSliders
                    values={sliderValues}
                    onChange={handleSliderChange}
                />

                {/* REUSABLE COMPONENT: Functional Toggle Switches Option List */}
                <SearchSettingSwitches
                    settings={switchValues}
                    updateSetting={handleSwitchChange}
                    chatId={chatId}
                    setChatId={setChatId}
                    llmSetting={llmSetting}
                    setLlmSetting={setLlmSetting}
                />
            </Box>

            {/* Bottom Save Control Actions Menu Footer */}
            <Box sx={styles.footer(theme)}>
                <Button variant="text" size="small" onClick={onClose} sx={styles.cancelButton(theme)}>
                    {t('searchConfig.cancel')}
                </Button>
                <Button
                    variant="contained"
                    size="small"
                    onClick={handleSave}
                    sx={styles.saveButton(theme)}
                >
                    {isUpdatePending ? t('searchConfig.saving') : t('searchConfig.save')}
                </Button>
            </Box>
        </Box>
    );
};

export default SearchSettingConfig;