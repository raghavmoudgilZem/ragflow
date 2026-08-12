import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchSettingSliders } from './SearchSettingSliders';

// 1. Mock BaseSlider to simplify event triggering and prop validation
vi.mock('@shared/components/common/BaseSlider', () => ({
  BaseSlider: ({ label, value, onChange, children }: any) => (
    <div data-testid={`slider-${label}`}>
      <span data-testid={`label-${label}`}>{label}</span>
      <input
        data-testid={`input-${label}`}
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {children}
    </div>
  ),
}));

// 2. Mock useTranslation hook to return keys directly for simple assertions
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('SearchSettingSliders Component Suite', () => {
  const mockOnChange = vi.fn();
  const defaultValues = {
    similarity: 0.7,
    vectorWeight: 0.35,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <SearchSettingSliders
        values={defaultValues}
        onChange={mockOnChange}
        {...props}
      />
    );
  };

  it('renders both sliders with localized labels and initial values', () => {
    renderComponent();

    // Check similarity threshold slider layout
    expect(screen.getByTestId('label-searchSettings.similarityThreshold')).toBeDefined();
    const similarityInput = screen.getByTestId('input-searchSettings.similarityThreshold') as HTMLInputElement;
    expect(similarityInput.value).toBe('0.7');

    // Check vector weight slider layout
    expect(screen.getByTestId('label-searchSettings.vectorWeight')).toBeDefined();
    const vectorInput = screen.getByTestId('input-searchSettings.vectorWeight') as HTMLInputElement;
    expect(vectorInput.value).toBe('0.35');
  });

  it('displays accurate calculated inverse weights inside children sub-labels', () => {
    renderComponent();

    // Verifying text contents mapping and calculation evaluations (1 - 0.35 = 0.65)
    expect(screen.getByText('searchSettings.vectorLabel 0.35')).toBeDefined();
    expect(screen.getByText('searchSettings.fullTextLabel 0.65')).toBeDefined();
  });

  it('triggers onChange with similarity key when similarity value updates', () => {
    renderComponent();

    const similarityInput = screen.getByTestId('input-searchSettings.similarityThreshold');
    fireEvent.change(similarityInput, { target: { value: '0.9' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('similarity', 0.9);
  });

  it('triggers onChange with vectorWeight key when vector value updates', () => {
    renderComponent();

    const vectorInput = screen.getByTestId('input-searchSettings.vectorWeight');
    fireEvent.change(vectorInput, { target: { value: '0.6' } });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('vectorWeight', 0.6);
  });
});
