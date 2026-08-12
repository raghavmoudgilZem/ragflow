import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarContent } from './SidebarContent';
import * as chatSidebarStore from '@modules/chats/store/chatSidebarstore';

vi.mock('@modules/chats/store/chatSidebarstore');

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

describe('SidebarContent', () => {
  const mockOnNewChat = vi.fn();
  const mockOnToggle = vi.fn();
  const mockOnSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(chatSidebarStore, 'useSidebarStore').mockReturnValue({
      searchTerm: '',
      setSearchTerm: vi.fn(),
      toggleSidebar: mockOnToggle,
      collapseSidebar: vi.fn(),
      setActiveConversation: vi.fn(),
      activeConversationId: null,
      isSidebarOpen: true,
    } as any);
  });

  it('should display chat name in header', () => {
    renderWithProviders(
      <SidebarContent
        chatName="Test Chat"
        avatarBg="linear-gradient(135deg, #7cb8ff, #3b82f6)"
        total={5}
        onNewChat={mockOnNewChat}
        onToggle={mockOnToggle}
        dialogId="dialog-123"
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Test Chat')).toBeInTheDocument();
  });

  it('should display conversations count', () => {
    renderWithProviders(
      <SidebarContent
        chatName="Test Chat"
        avatarBg="linear-gradient(135deg, #7cb8ff, #3b82f6)"
        total={12}
        onNewChat={mockOnNewChat}
        onToggle={mockOnToggle}
        dialogId="dialog-123"
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should render search input field', () => {
    renderWithProviders(
      <SidebarContent
        chatName="Test Chat"
        avatarBg="linear-gradient(135deg, #7cb8ff, #3b82f6)"
        total={5}
        onNewChat={mockOnNewChat}
        onToggle={mockOnToggle}
        dialogId="dialog-123"
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByPlaceholderText('Search conversations')).toBeInTheDocument();
  });

  it('should call onToggle when collapse button is clicked', async () => {
    const user = await userEvent.setup();
    renderWithProviders(
      <SidebarContent
        chatName="Test Chat"
        avatarBg="linear-gradient(135deg, #7cb8ff, #3b82f6)"
        total={5}
        onNewChat={mockOnNewChat}
        onToggle={mockOnToggle}
        dialogId="dialog-123"
        onSelect={mockOnSelect}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    
    await user.click(toggleButton);
    expect(mockOnToggle).toHaveBeenCalled();
  });

  it('should call onNewChat when new conversation button is clicked', async () => {
    const user = await userEvent.setup();
    renderWithProviders(
      <SidebarContent
        chatName="Test Chat"
        avatarBg="linear-gradient(135deg, #7cb8ff, #3b82f6)"
        total={5}
        onNewChat={mockOnNewChat}
        onToggle={mockOnToggle}
        dialogId="dialog-123"
        onSelect={mockOnSelect}
      />
    );

    const newButton = screen.getByRole('button', { name: /new conversation/i });
    await user.click(newButton);

    expect(mockOnNewChat).toHaveBeenCalled();
  });

  it('should render avatar with chat initial', () => {
    const { container } = renderWithProviders(
      <SidebarContent
        chatName="TestChat"
        avatarBg="linear-gradient(135deg, #7cb8ff, #3b82f6)"
        total={5}
        onNewChat={mockOnNewChat}
        onToggle={mockOnToggle}
        dialogId="dialog-123"
        onSelect={mockOnSelect}
      />
    );

    const avatar = container.querySelector('[class*="MuiAvatar"]');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveTextContent('T');
  });
});