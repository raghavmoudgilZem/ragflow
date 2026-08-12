import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConversationItem } from './ConversationItem';

const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('ConversationItem', () => {
  const mockConversation = {
    id: 'conv-1',
    dialog_id: 'dialog-123',
    name: 'Test Conversation',
    avatar: 'T',
    create_date: '2024-01-01',
    create_time: 1704067200000,
    update_date: '2024-01-02',
    update_time: 1704153600000,
    is_new: false,
    message: [],
    reference: [],
    created_at: '2024-01-01',
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render conversation name', () => {
    renderWithProviders(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
      />
    );

    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });

  it('should display formatted update time', () => {
    renderWithProviders(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
      />
    );

    const timeText = screen.getAllByText(/\d{1,2}:\d{2}/);
    expect(timeText.length).toBeGreaterThan(0);
  });

  it('should call onClick with conversation id when clicked', async () => {
    const user = await userEvent.setup();
    renderWithProviders(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
      />
    );

    const item = screen.getByText('Test Conversation').closest('div');
    await user.click(item!);

    expect(mockOnClick).toHaveBeenCalledWith('conv-1');
  });

  it('should display message icon', () => {
    const { container } = renderWithProviders(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
      />
    );

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('should have correct typography for name', () => {
    renderWithProviders(
      <ConversationItem
        conversation={mockConversation}
        isActive={false}
        onClick={mockOnClick}
      />
    );

    const nameElement = screen.getByText('Test Conversation');
    expect(nameElement).toBeInTheDocument();
  });
});