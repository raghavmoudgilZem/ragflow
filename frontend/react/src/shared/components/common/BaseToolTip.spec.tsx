import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BaseTooltip } from './BaseToolTip';

describe('BaseTooltip Component Suite', () => {
    it('should render the help icon as the tooltip trigger', () => {
        render(<BaseTooltip text="Helpful information" />);
        
        // Material-UI automatically assigns a data-testid to its icons based on the icon's name
        const helpIcon = screen.getByTestId('HelpOutlineOutlinedIcon');
        expect(helpIcon).toBeDefined();
    });

    it('should display the tooltip text when the icon is hovered', async () => {
        render(<BaseTooltip text="This is a secret hint" />);
        
        const helpIcon = screen.getByTestId('HelpOutlineOutlinedIcon');
        
        // 1. Simulate the user hovering over the icon
        fireEvent.mouseOver(helpIcon);
        
        // 2. Because MUI tooltips render asynchronously in a portal, we MUST use findByText 
        // (which implicitly waits for the element to appear) rather than getByText
        const tooltipBubble = await screen.findByText('This is a secret hint');
        
        expect(tooltipBubble).toBeDefined();
    });
});