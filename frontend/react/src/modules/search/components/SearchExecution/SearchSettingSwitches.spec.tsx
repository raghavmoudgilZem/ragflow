import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchSettingSwitches } from './SearchSettingSwitches';

// Mock AISummary to isolate this unit test from the child's complex dependencies
vi.mock('./AISummary', () => ({
  default: () => <div data-testid="mock-ai-summary" />
}));

describe('SearchSettingSwitches Component', () => {
  const mockUpdateSetting = vi.fn();
  const mockSetLlmSetting = vi.fn();
  const mockSetChatId = vi.fn();

  const mockProps = {
    settings: {
      rerankModel: false,
      aiSummary: false,
      relatedSearch: false,
      queryMindmap: false,
    },
    updateSetting: mockUpdateSetting,
    llmSetting: null,
    setLlmSetting: mockSetLlmSetting,
    chatId: 'mock-chat-id',
    setChatId: mockSetChatId,
  };

  it('renders all functional toggle switches', () => {
    render(<SearchSettingSwitches {...mockProps} />);

    expect(screen.getByText('Rerank Model')).toBeDefined();
    expect(screen.getByText('AI Summary')).toBeDefined();
    expect(screen.getByText('Enable Related Search')).toBeDefined();
    expect(screen.getByText('Show Query Mindmap')).toBeDefined();
  });

  it('calls updateSetting when AI Summary switch is toggled', () => {
    render(<SearchSettingSwitches {...mockProps} />);

    // With MUI's FormControlLabel, clicking the text label toggles the switch reliably
    const aiSummaryLabel = screen.getByText('AI Summary');
    fireEvent.click(aiSummaryLabel);

    expect(mockUpdateSetting).toHaveBeenCalledWith('aiSummary', true);
  });

  it('displays AISummary component when aiSummary is true', () => {
    const propsWithSummary = {
      ...mockProps,
      settings: {
        ...mockProps.settings,
        aiSummary: true,
      },
    };

    render(<SearchSettingSwitches {...propsWithSummary} />);

    expect(screen.getByTestId('mock-ai-summary')).toBeDefined();
  });
});
