export const ModelVariableType = {
    Improvise: 'Improvise',
    Precise: 'Precise',
    Balance: 'Balance',
    Custom: 'Custom'
} as const;

export type ModelVariableType = typeof ModelVariableType[keyof typeof ModelVariableType];

export const variableCheckBoxFieldMap = {
    tempSwitch: false,
    topPSwitch: false,
    presencePenaltySwitch: false,
    frequencyPenaltySwitch: false,
};

export const initialLlmBaseValues = {
    ...variableCheckBoxFieldMap,
    temperature: 0.1,
    top_p: 0.3,
    frequency_penalty: 0.7,
    presence_penalty: 0.4,
    max_tokens: 256,
};

export const settledModelVariableMap = {
    [ModelVariableType.Improvise]: {
        temperature: 0.8,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        max_tokens: 4096,
    },
    [ModelVariableType.Precise]: {
        temperature: 0.2,
        top_p: 0.75,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        max_tokens: 4096,
    },
    [ModelVariableType.Balance]: {
        temperature: 0.5,
        top_p: 0.85,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
        max_tokens: 4096,
    },
};