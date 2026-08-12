import type { DropdownItem } from "@shared/components/common/BaseDropdown";
import { ModelVariableType } from "./knowledge";

export const metaDataItems = [
    {
        label: "Disabled",
        value: "disabled"
    },
    {
        label: "Automatic",
        value: "automatic"
    },
    {
        label: "Semi-automatic",
        value: "semi-automatic"
    },
    {
        label: "Manual",
        value: "manual"
    }
]

export const creativityDropdownValues: DropdownItem[] = [
    {
        label: "Improvise",
        value: ModelVariableType.Improvise
    },
    {
        label: "Precise",
        value: ModelVariableType.Precise
    },
    {
        label: "Balanced",
        value: ModelVariableType.Balance
    },
    {
        label: "Custom",
        value: ModelVariableType.Custom
    }
];

export const searchConfigAppDefaultDescription = 'You are an intelligent assistant.';

export const modalDropdownValues = [{ label: "ollama", value: "ollama" }]