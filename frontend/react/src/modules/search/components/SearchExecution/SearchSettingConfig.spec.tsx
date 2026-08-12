import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchSettingConfig from './SearchSettingConfig';
import { useUpdateConfig } from '@modules/search/hooks/useUpdateConfig';

// Only mock the hook the component actually uses
vi.mock('@modules/search/hooks/useUpdateConfig', () => ({
  useUpdateConfig: vi.fn(),
}));

// Mock child components to prevent render errors from nested dependencies
vi.mock('./SearchSettingSwitches', () => ({ SearchSettingSwitches: () => <div /> }));
vi.mock('./SearchSettingSliders', () => ({ SearchSettingSliders: () => <div /> }));

describe('SearchSettingConfig Component', () => {
  const mockMutate = vi.fn();
  
  // Define the mock config object that matches the currentConfig prop
  const mockApp: any = {
    id: 'mock-id',
    name: 'Test App',
    avatar: 'test-avatar',
    description: 'Test Desc',
    tenant_id: 'tenant-123',
    search_config: {
      chat_id: 'chat-123',
      similarity_threshold: 0.2,
      vector_similarity_weight: 0.7,
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUpdateConfig as any).mockReturnValue({ mutate: mockMutate, isPending: false });
  });

  it('renders search settings title and basic fields when isOpen is true', () => {
    // Passed the required currentConfig prop and removed unnecessary MemoryRouter
    render(<SearchSettingConfig isOpen={true} currentConfig={mockApp} />);

    expect(screen.getByText('Search Settings')).toBeDefined();
    expect(screen.getByText('Name')).toBeDefined();
    expect(screen.getByText('Description')).toBeDefined();
  });

  it('returns null when isOpen is false', () => {
    const { container } = render(<SearchSettingConfig isOpen={false} currentConfig={mockApp} />);
    expect(container.firstChild).toBeNull();
  });

  it('calls updateConfig with correct parameters when save is clicked', () => {
    render(<SearchSettingConfig isOpen={true} currentConfig={mockApp} />);

    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);

    expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({
      search_id: 'mock-id',
      name: 'Test App', 
    }));
  });
});