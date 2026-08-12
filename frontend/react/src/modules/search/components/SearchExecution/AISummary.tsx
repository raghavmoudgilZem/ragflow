import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { BaseDropdown } from '@shared/components/common/BaseDropdown';
import AISummarySubComponent from './AISummarySubComponent';
import { 
    ModelVariableType, 
    settledModelVariableMap, 
    initialLlmBaseValues 
} from '@modules/search/constants/knowledge';
import { 
    creativityDropdownValues, 
    modalDropdownValues 
} from '@modules/search/constants/common';

interface AISummaryProps {
    isOpen: boolean;
    llmSetting: any;
    setLlmSetting: (v: any) => void;
    chatId: any;
    setChatId: (v: any) => void;
}

export interface LLMValues {
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
}

export interface LLMSwitches {
    tempSwitch: boolean;
    topPSwitch: boolean;
    presencePenaltySwitch: boolean;
    frequencyPenaltySwitch: boolean;
}

const AISummary = ({ 
    isOpen, 
    llmSetting, 
    setLlmSetting, 
    chatId, 
    setChatId 
}: AISummaryProps) => {
    if (!isOpen) return null;

    // 1. Grouped State Objects
    const [creativity, setCreativity] = useState('');

    const [values, setValues] = useState<LLMValues>(() => ({
        temperature: llmSetting?.temperature ?? initialLlmBaseValues.temperature,
        topP: llmSetting?.top_p ?? initialLlmBaseValues.top_p,
        presencePenalty: llmSetting?.presence_penalty ?? initialLlmBaseValues.presence_penalty,
        frequencyPenalty: llmSetting?.frequency_penalty ?? initialLlmBaseValues.frequency_penalty,
    }));

    const [switches, setSwitches] = useState<LLMSwitches>(() => ({
        tempSwitch: !!llmSetting,
        topPSwitch: !!llmSetting,
        presencePenaltySwitch: !!llmSetting,
        frequencyPenaltySwitch: !!llmSetting,
    }));

    // 2. Synchronize external config parameters cleanly
    useEffect(() => {
        if (!isOpen) return;

        if (llmSetting) {
            setValues({
                temperature: llmSetting.temperature ?? initialLlmBaseValues.temperature,
                topP: llmSetting.top_p ?? initialLlmBaseValues.top_p,
                presencePenalty: llmSetting.presence_penalty ?? initialLlmBaseValues.presence_penalty,
                frequencyPenalty: llmSetting.frequency_penalty ?? initialLlmBaseValues.frequency_penalty,
            });
            setCreativity(llmSetting.parameter || '');
            setSwitches({
                tempSwitch: true,
                topPSwitch: true,
                presencePenaltySwitch: true,
                frequencyPenaltySwitch: true,
            });
        } else {
            setValues({
                temperature: initialLlmBaseValues.temperature,
                topP: initialLlmBaseValues.top_p,
                presencePenalty: initialLlmBaseValues.presence_penalty,
                frequencyPenalty: initialLlmBaseValues.frequency_penalty,
            });
            setSwitches({
                tempSwitch: initialLlmBaseValues.tempSwitch,
                topPSwitch: initialLlmBaseValues.topPSwitch,
                presencePenaltySwitch: initialLlmBaseValues.presencePenaltySwitch,
                frequencyPenaltySwitch: initialLlmBaseValues.frequencyPenaltySwitch,
            });

            setLlmSetting({
                parameter: 'Custom',
                temperature: initialLlmBaseValues.temperature,
                top_p: initialLlmBaseValues.top_p,
                frequency_penalty: initialLlmBaseValues.frequency_penalty,
                presence_penalty: initialLlmBaseValues.presence_penalty,
                max_tokens: initialLlmBaseValues.max_tokens,
            });
        }
    }, [isOpen, llmSetting?.id]); // Avoid tracking the whole object literal to prevent loops

    // 3. Unified slider value manipulator
    const handleValueChange = (key: keyof LLMValues, val: number) => {
        setValues((prev) => {
            const nextValues = { ...prev, [key]: val };
            setCreativity('Custom');

            setLlmSetting({
                parameter: 'Custom',
                temperature: nextValues.temperature,
                top_p: nextValues.topP,
                presence_penalty: nextValues.presencePenalty,
                frequency_penalty: nextValues.frequencyPenalty,
                max_tokens: llmSetting?.max_tokens || initialLlmBaseValues.max_tokens,
            });

            return nextValues;
        });
    };

    const handleSwitchChange = (key: keyof LLMSwitches, val: boolean) => {
        setSwitches((prev) => ({ ...prev, [key]: val }));
    };

    const handleCreativityChange = (value: string) => {
        setCreativity(value);

        if (value === 'Custom') {
            setSwitches({
                tempSwitch: true,
                topPSwitch: true,
                presencePenaltySwitch: true,
                frequencyPenaltySwitch: true,
            });
        } else {
            const preset = settledModelVariableMap[value as ModelVariableType];
            if (preset) {
                setValues({
                    temperature: preset.temperature,
                    topP: preset.top_p,
                    frequencyPenalty: preset.frequency_penalty,
                    presencePenalty: preset.presence_penalty,
                });
                setSwitches({
                    tempSwitch: true,
                    topPSwitch: true,
                    presencePenaltySwitch: true,
                    frequencyPenaltySwitch: true,
                });

                setLlmSetting({
                    parameter: value,
                    temperature: preset.temperature,
                    top_p: preset.top_p,
                    frequency_penalty: preset.frequency_penalty,
                    presence_penalty: preset.presence_penalty,
                    max_tokens: preset.max_tokens,
                });
            }
        }
    };

    return (
        <Box>
            <BaseDropdown
                label="Model"
                placeholder="Select an Model"
                value={chatId}
                onChange={setChatId}
                items={modalDropdownValues}
            />
            
            <BaseDropdown
                label="Creativity"
                placeholder="Select a value"
                value={creativity}
                onChange={handleCreativityChange}
                items={creativityDropdownValues}
            />
            
            {/* Ready for the updated subcomponent parameters */}
            <AISummarySubComponent
                values={values}
                switches={switches}
                onValueChange={handleValueChange}
                onSwitchChange={handleSwitchChange}
            />
        </Box>
    );
};

export default AISummary;
