import React from 'react';
import { Tooltip, type TooltipProps } from '@mui/material';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';

interface BaseTooltipProps {
    text: string;                          // The text inside the tooltip bubble
    placement?: TooltipProps['placement'];  // Optional: 'top', 'bottom', 'left', etc.
}

export const BaseTooltip = ({ text, placement = 'top' }: BaseTooltipProps) => {
    return (
        <Tooltip
            title={text}
            placement={placement}
            arrow // Built-in MUI prop to show the little pointing arrow
        >
            <HelpOutlineOutlinedIcon sx={{ fontSize: 13, color: '#475569', marginLeft: '5px' }} />
        </Tooltip>
    );
};
