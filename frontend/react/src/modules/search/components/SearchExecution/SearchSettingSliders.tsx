import React from 'react';
import { Box, Typography } from '@mui/material';
import { BaseSlider } from '@shared/components/common/BaseSlider';
import { useTranslation } from 'react-i18next';

export interface SliderValues {
    similarity: number;
    vectorWeight: number;
}

interface SlidersProps {
    values: SliderValues;
    onChange: (key: keyof SliderValues, val: number) => void;
}

export const SearchSettingSliders = ({
    values,
    onChange,
}: SlidersProps) => {
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            <BaseSlider
                label={t('searchSettings.similarityThreshold')}
                value={values.similarity}
                onChange={(val) => onChange('similarity', val)}
                min={0}
                max={1}
                step={0.1}
                tooltipText={t('searchSettings.similarityTooltip')}
            />

            <BaseSlider
                label={t('searchSettings.vectorWeight')}
                value={values.vectorWeight}
                onChange={(val) => onChange('vectorWeight', val)}
                min={0}
                max={1}
                step={0.05}
                tooltipText={t('searchSettings.vectorWeightTooltip')}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5, mb: -0.5 }}>
                    <Typography sx={{ fontSize: '0.7rem', color: 'custom.textMutedDarkest' }}>
                        {t('searchSettings.vectorLabel')} {values.vectorWeight.toFixed(2)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.7rem', color: 'custom.textMutedDarkest' }}>
                        {t('searchSettings.fullTextLabel')} {(1 - values.vectorWeight).toFixed(2)}
                    </Typography>
                </Box>
            </BaseSlider>
        </Box>
    );
};
