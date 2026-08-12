import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AISummary from './AISummary';

// 1. Updated SubComponent Mock to reflect the new structured parameter handlers
vi.mock('./AISummarySubComponent', () => {
  return {
    default: ({ onValueChange }: any) => (
      <div data-testid="mock-subcomponent">
        <input
          data-testid="mock-temperature-input"
          type="range"
          onChange={(e) => onValueChange('temperature', parseFloat(e.target.value))}
        />
      </div>
    )
  };
});

// 2. Fixed the typo in the mock path (BaseDrowpdown -> BaseDropdown)
vi.mock('@shared/components/common/BaseDropdown', () => ({
  BaseDropdown: ({ label, onChange, items, value }: any) => (
    <div data-testid={`dropdown-${label}`}>
      <span>{label}</span>
      <select
        data-testid={`select-${label}`}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Select...</option>
        {items?.map((item: any) => (
          <option key={item.value || item} value={item.value || item}>
            {item.label || item}
          </option>
        ))}
      </select>
    </div>
  )
}));

// 3. Mock the Knowledge constants
vi.mock('@modules/search/constants/knowledge', () => ({
  ModelVariableType: { Improvise: 'Improvise', Precise: 'Precise', Balance: 'Balanced' },
  initialLlmBaseValues: {
    temperature: 0.7, top_p: 0.9, presence_penalty: 0.0, frequency_penalty: 0.0,
    tempSwitch: false, topPSwitch: false, presencePenaltySwitch: false, frequencyPenaltySwitch: false,
    max_tokens: 2000
  },
  settledModelVariableMap: {
    Precise: { temperature: 0.2, top_p: 0.1, frequency_penalty: 0.1, presence_penalty: 0.1, max_tokens: 1500 }
  }
}));

// 4. Mock the Common constants to prevent map() errors on undefined items
// 4. Mock the Common constants to prevent map() errors on undefined items
vi.mock('@modules/search/constants/common', () => ({
  creativityDropdownValues: [
    { label: 'Precise', value: 'Precise' },
    { label: 'Custom', value: 'Custom' }
  ],
  modalDropdownValues: [
    { label: 'GPT 4', value: 'gpt-4' },
    { label: 'GPT 3.5', value: 'gpt-3.5' } // 💡 Add this line right here!
  ]
}));


describe('AISummary Component Suite', () => {
  const mockSetLlmSetting = vi.fn();
  const mockSetChatId = vi.fn();
  const defaultChatId = 'gpt-4';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Helper to render the component with all required props
  const renderComponent = (props = {}) => {
    return render(
      <AISummary
        isOpen={true}
        llmSetting={null}
        setLlmSetting={mockSetLlmSetting}
        chatId={defaultChatId}
        setChatId={mockSetChatId}
        {...props}
      />
    );
  };

  it('does not render anything when isOpen is false', () => {
    const { container } = renderComponent({ isOpen: false });
    expect(container.firstChild).toBeNull();
  });

  it('renders dropdowns and mocked subcomponent when isOpen is true', () => {
    renderComponent();

    expect(screen.getByText('Model')).toBeDefined();
    expect(screen.getByText('Creativity')).toBeDefined();
    expect(screen.getByTestId('mock-subcomponent')).toBeDefined();
  });

  it('initializes with default values inside useEffect when llmSetting is null', () => {
    renderComponent();

    expect(mockSetLlmSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        parameter: 'Custom',
        temperature: 0.7,
        top_p: 0.9
      })
    );
  });

  it('updates the chatId when the Model dropdown is changed', () => {
    renderComponent();

    const modelSelect = screen.getByTestId('select-Model');
    fireEvent.change(modelSelect, { target: { value: 'gpt-3.5' } });

    expect(mockSetChatId).toHaveBeenCalledWith('gpt-3.5');
  });

  it('applies constant preset values when a specific creativity option is selected', () => {
    renderComponent();

    const creativitySelect = screen.getByTestId('select-Creativity');
    fireEvent.change(creativitySelect, { target: { value: 'Precise' } });

    expect(mockSetLlmSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        parameter: 'Precise',
        temperature: 0.2, // Matches the mock settledModelVariableMap
        top_p: 0.1
      })
    );
  });

  it('automatically switches creativity to Custom when a slider (like temperature) is manually changed', () => {
    renderComponent();

    const tempInput = screen.getByTestId('mock-temperature-input');

    // Simulate the user dragging the temperature slider in the subcomponent to 0.5
    fireEvent.change(tempInput, { target: { value: '0.5' } });

    expect(mockSetLlmSetting).toHaveBeenCalledWith(
      expect.objectContaining({
        parameter: 'Custom', // Forced to Custom
        temperature: 0.5     // Updated value
      })
    );
  });
});
