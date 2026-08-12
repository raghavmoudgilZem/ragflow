import React from 'react';
import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { BaseSlider } from '@shared/components/common/BaseSlider';
import { BaseSwitch } from '@shared/components/common/BaseSwitch';
import { BaseTooltip } from '@shared/components/common/BaseToolTip';
import { type LLMValues, type LLMSwitches } from './AISummary';

interface AISummarySubComponentProps {
    values: LLMValues;
    switches: LLMSwitches;
    onValueChange: (key: keyof LLMValues, val: number) => void;
    onSwitchChange: (key: keyof LLMSwitches, val: boolean) => void;
}

const AISummarySubComponent = ({
    values,
    switches,
    onValueChange,
    onSwitchChange,
}: AISummarySubComponentProps) => {
    const { t } = useTranslation();

    return (
        <Box>
            <SliderSwitchComboForAiSummary
                label={t('aiSummary.temperature')}
                checked={switches.tempSwitch}
                onSwitchChange={(val) => onSwitchChange('tempSwitch', val)}
                sliderValue={values.temperature}
                onSliderChange={(val) => onValueChange('temperature', val)}
                tooltipText={t('aiSummary.temperatureTooltip')}
            />
            
            <SliderSwitchComboForAiSummary
                label={t('aiSummary.topP')}
                checked={switches.topPSwitch}
                onSwitchChange={(val) => onSwitchChange('topPSwitch', val)}
                sliderValue={values.topP}
                onSliderChange={(val) => onValueChange('topP', val)}
                tooltipText={t('aiSummary.topPTooltip')}
            />
            
            <SliderSwitchComboForAiSummary
                label={t('aiSummary.presencePenalty')}
                checked={switches.presencePenaltySwitch}
                onSwitchChange={(val) => onSwitchChange('presencePenaltySwitch', val)}
                sliderValue={values.presencePenalty}
                onSliderChange={(val) => onValueChange('presencePenalty', val)}
                tooltipText={t('aiSummary.presencePenaltyTooltip')}
            />
            
            <SliderSwitchComboForAiSummary
                label={t('aiSummary.frequencyPenalty')}
                checked={switches.frequencyPenaltySwitch}
                onSwitchChange={(val) => onSwitchChange('frequencyPenaltySwitch', val)}
                sliderValue={values.frequencyPenalty}
                onSliderChange={(val) => onValueChange('frequencyPenalty', val)}
                tooltipText={t('aiSummary.frequencyPenaltyTooltip')}
            />
        </Box>
    );
};

export default AISummarySubComponent;

interface SliderSwitchComboForAiSummaryProps {
    label: string;
    checked: boolean;
    onSwitchChange: (val: boolean) => void;
    sliderValue: number;
    onSliderChange: (val: number) => void;
    tooltipText: string;
}

const SliderSwitchComboForAiSummary = ({ 
    label, 
    checked, 
    onSwitchChange, 
    sliderValue, 
    onSliderChange, 
    tooltipText 
}: SliderSwitchComboForAiSummaryProps) => {
    return (
        <Box sx={{ display: 'flex', marginTop: '10px', flexDirection: 'column' }}>
            <Typography sx={{
                mb: 4,
                letterSpacing: '0.5px',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, #6366f1 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                marginBottom: '0',
                gap: 3.5
            }}>
                {label}
                <BaseTooltip text={tooltipText} />
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'row', margin: '10px 15px 0 0' }}>
                <BaseSwitch 
                    checked={checked} 
                    onChange={onSwitchChange} 
                    sx={{ width: '15%' }} 
                />
                <BaseSlider
                    value={sliderValue}
                    onChange={onSliderChange}
                    min={0}
                    max={1}
                    step={0.05}
                    disabled={!checked}
                />
            </Box>
        </Box>
    );
};
