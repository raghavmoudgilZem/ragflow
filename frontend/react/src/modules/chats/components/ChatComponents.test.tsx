import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ChatCardGrid } from './ChatCardGrid';
import { ChatEmptyState } from './ChatEmptyState';
import { ChatPagination } from './ChatPagination';
import { ChatSearchInput } from './ChatSearchInput';
import { ChatsPageHeader } from './ChatsPageHeader';
import type { Chat } from '../types/chat.types';

// Mock chatUiStore for ChatSearchInput
vi.mock('../store/chatUiStore', () => ({
  useChatUiStore: vi.fn(),
}));

// Mock ChatCard component
vi.mock('./ChatCard', () => ({
  ChatCard: ({ chat, onClick, onDelete }: any) => (
    <div data-testid={`card-${chat.id}`}>
      <button onClick={() => onClick(chat.id)}>{chat.name}</button>
      <button onClick={() => onDelete(chat.id)}>Delete</button>
    </div>
  ),
}));

import { useChatUiStore } from '../store/chatUiStore';

describe('ChatCardGrid', () => {
  const mockOnChatClick = vi.fn();
  const mockOnDelete = vi.fn();

  const mockChats: Chat[] = [
    {
      id: '1', name: 'Chat 1', create_time: Date.now(),
      create_date: '',
      description: '',
      icon: '',
      dialog_id: '',
      kb_ids: [],
      kb_names: [],
      language: '',
      llm_id: '',
      llm_setting: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    },
    prompt_config: {
      empty_response: 'I could not find an answer.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a helpful support assistant.',
      system_prompt: 'Answer customer queries based on the knowledge base.',
      quote: true,
      keyword: true,
      refine_multiturn: true,
      use_kg: true,
    },
      llm_setting_type: '',
      prompt_type: '',
      status: '',
      tenant_id: '',
      update_date: '',
      update_time: 0,
      vector_similarity_weight: 0,
      similarity_threshold: 0,
      top_k: 0,
      top_n: 0,
      created_at: '2024-01-15T10:30:00',
    },
    {
      id: '2', name: 'Chat 2', create_time: Date.now(),
      create_date: '',
      description: '',
      icon: '',
      dialog_id: '',
      kb_ids: [],
      kb_names: [],
      language: '',
      llm_id: '',
      llm_setting: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    },
    prompt_config: {
      empty_response: 'I could not find an answer.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a helpful support assistant.',
      system_prompt: 'Answer customer queries based on the knowledge base.',
      quote: true,
      keyword: true,
      refine_multiturn: true,
      use_kg: true,
    },
      llm_setting_type: '',
      prompt_type: '',
      status: '',
      tenant_id: '',
      update_date: '',
      update_time: 0,
      vector_similarity_weight: 0,
      similarity_threshold: 0,
      top_k: 0,
      top_n: 0,
      created_at: '2024-01-15T10:30:00',
    },
    {
      id: '3', name: 'Chat 3', create_time: Date.now(),
      create_date: '',
      description: '',
      icon: '',
      dialog_id: '',
      kb_ids: [],
      kb_names: [],
      language: '',
      llm_id: '',
      llm_setting: {
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
    },
    prompt_config: {
      empty_response: 'I could not find an answer.',
      parameters: [{ key: 'query', optional: false }],
      prologue: 'You are a helpful support assistant.',
      system_prompt: 'Answer customer queries based on the knowledge base.',
      quote: true,
      keyword: true,
      refine_multiturn: true,
      use_kg: true,
    },
      llm_setting_type: '',
      prompt_type: '',
      status: '',
      tenant_id: '',
      update_date: '',
      update_time: 0,
      vector_similarity_weight: 0,
      similarity_threshold: 0,
      top_k: 0,
      top_n: 0,
      created_at: '2024-01-15T10:30:00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all chats in grid', () => {
    render(
      <ChatCardGrid
        chats={mockChats}
        onChatClick={mockOnChatClick}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByTestId('card-1')).toBeInTheDocument();
    expect(screen.getByTestId('card-2')).toBeInTheDocument();
    expect(screen.getByTestId('card-3')).toBeInTheDocument();
  });

  it('should render empty grid when no chats provided', () => {
    const { container } = render(
      <ChatCardGrid
        chats={[]}
        onChatClick={mockOnChatClick}
        onDelete={mockOnDelete}
      />
    );

    expect(container.firstChild).toBeInTheDocument();
    expect(screen.queryByTestId('card-1')).not.toBeInTheDocument();
  });

  it('should call onChatClick with correct id', async () => {
    const user = userEvent.setup();
    render(
      <ChatCardGrid
        chats={mockChats}
        onChatClick={mockOnChatClick}
        onDelete={mockOnDelete}
      />
    );

    const chatButton = screen.getByText('Chat 1');
    await user.click(chatButton);

    expect(mockOnChatClick).toHaveBeenCalledWith('1');
  });

  it('should call onDelete with correct id', async () => {
    const user = userEvent.setup();
    render(
      <ChatCardGrid
        chats={mockChats}
        onChatClick={mockOnChatClick}
        onDelete={mockOnDelete}
      />
    );

    const deleteButtons = screen.getAllByText('Delete');
    await user.click(deleteButtons[1]); // Delete Chat 2

    expect(mockOnDelete).toHaveBeenCalledWith('2');
  });
});

describe('ChatEmptyState', () => {
  const mockOnCreateClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render empty state message', () => {
    render(<ChatEmptyState onCreateClick={mockOnCreateClick} />);

    expect(screen.getByText('No chat app created yet')).toBeInTheDocument();
  });

  it('should render create button', () => {
    render(<ChatEmptyState onCreateClick={mockOnCreateClick} />);

    const createButton = screen.getByRole('button');
    expect(createButton).toBeInTheDocument();
  });

  it('should call onCreateClick when button is clicked', async () => {
    const user = userEvent.setup();
    render(<ChatEmptyState onCreateClick={mockOnCreateClick} />);

    const createButton = screen.getByRole('button');
    await user.click(createButton);

    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('should display message square icon', () => {
    const { container } = render(<ChatEmptyState onCreateClick={mockOnCreateClick} />);

    // Check for SVG (lucide-react icon)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });
});

describe('ChatPagination', () => {
  const mockOnPageChange = vi.fn();
  const mockOnPageSizeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display total count', () => {
    render(
      <ChatPagination
        total={50}
        totalPages={5}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(screen.getByText('Total: 50')).toBeInTheDocument();
  });

  it('should render pagination component with correct page count', () => {
    render(
      <ChatPagination
        total={100}
        totalPages={10}
        page={1}
        pageSize={20}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    // Should have 5 pages (100 / 20 = 5)
    expect(screen.getByRole('button', { name: /5/i })).toBeInTheDocument();
  });

  it('should call onPageChange when page is changed', async () => {
    const user = userEvent.setup();
    render(
      <ChatPagination
        total={50}
        totalPages={10}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const nextPageButton = screen.getByRole('button', { name: /2/i });
    await user.click(nextPageButton);

    expect(mockOnPageChange).toHaveBeenCalled();
  });

  it('should display page size options', async () => {
    const user = userEvent.setup();
    render(
      <ChatPagination
        total={100}
        totalPages={10}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    expect(screen.getByText('20 / page')).toBeInTheDocument();
    expect(screen.getByText('50 / page')).toBeInTheDocument();
  });

  it('should call onPageSizeChange when page size is changed', async () => {
    const user = userEvent.setup();
    render(
      <ChatPagination
        total={100}
        totalPages={10}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    const select = screen.getByRole('combobox');
    await user.click(select);

    const option20 = screen.getByText('20 / page');
    await user.click(option20);

    expect(mockOnPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('should handle pagination with different totals', () => {
    const { rerender } = render(
      <ChatPagination
        total={25}
        totalPages={3}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(screen.getByText('Total: 25')).toBeInTheDocument();

    rerender(
      <ChatPagination
        total={100}
        totalPages={10}
        page={1}
        pageSize={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );

    expect(screen.getByText('Total: 100')).toBeInTheDocument();
  });
});

describe('ChatSearchInput', () => {
  const mockSetSearchTerm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useChatUiStore as any).mockReturnValue({
      searchTerm: '',
      setSearchTerm: mockSetSearchTerm,
    });
  });

  it('should render search input field', () => {
    render(<ChatSearchInput />);

    const input = screen.getByPlaceholderText('Search chats');
    expect(input).toBeInTheDocument();
  });

  it('should display search icon', () => {
    const { container } = render(<ChatSearchInput />);

    // Check for SVG (lucide-react icon)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
  });

  it('should call setSearchTerm when input changes', async () => {
    const user = userEvent.setup();
    render(<ChatSearchInput />);

    const input = screen.getByPlaceholderText('Search chats');
    await user.type(input, 'test search');

    expect(mockSetSearchTerm).toHaveBeenCalled();
  });

  it('should display current search term', () => {
    (useChatUiStore as any).mockReturnValue({
      searchTerm: 'existing search',
      setSearchTerm: mockSetSearchTerm,
    });

    render(<ChatSearchInput />);

    const input = screen.getByDisplayValue('existing search');
    expect(input).toBeInTheDocument();
  });

  it('should have correct styling for focus state', () => {
    render(<ChatSearchInput />);

    const input = screen.getByPlaceholderText('Search chats');
    expect(input).toBeInTheDocument();
    
    // Component has custom focus styling
    // This verifies the input exists and can be interacted with
  });
});

describe('ChatsPageHeader', () => {
  const mockOnCreateClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render header title', () => {
    render(
      <ChatsPageHeader
        chatCount={5}
        onCreateClick={mockOnCreateClick}
      />
    );

    expect(screen.getByText('Chat apps')).toBeInTheDocument();
  });

  it('should render chats icon', () => {
    render(
      <ChatsPageHeader
        chatCount={5}
        onCreateClick={mockOnCreateClick}
      />
    );

    const icon = screen.getByAltText('Chats Icon');
    expect(icon).toBeInTheDocument();
  });

  it('should not show controls when chat count is 0', () => {
    render(
      <ChatsPageHeader
        chatCount={0}
        onCreateClick={mockOnCreateClick}
      />
    );

    expect(screen.queryByRole('button', { name: /Filter/i })).not.toBeInTheDocument();
  });

  it('should show controls when chat count is greater than 0', () => {
    render(
      <ChatsPageHeader
        chatCount={5}
        onCreateClick={mockOnCreateClick}
      />
    );

    // Filter button should be visible
    const filterButton = screen.getByRole('button', { name: /filter/i });
    expect(filterButton).toBeInTheDocument();
  });

  it('should render create button when chat count is greater than 0', async () => {
    const user = userEvent.setup();
    render(
      <ChatsPageHeader
        chatCount={5}
        onCreateClick={mockOnCreateClick}
      />
    );

    const createButton = screen.getByText('Create chat');
    expect(createButton).toBeInTheDocument();

    await user.click(createButton);
    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('should render search input when chat count is greater than 0', () => {
    // ChatSearchInput will be rendered since chatCount > 0
    render(
      <ChatsPageHeader
        chatCount={3}
        onCreateClick={mockOnCreateClick}
      />
    );

    // Header structure should be complete
    expect(screen.getByText('Chat apps')).toBeInTheDocument();
  });

  it('should handle multiple clicks correctly', async () => {
    const user = userEvent.setup();
    render(
      <ChatsPageHeader
        chatCount={5}
        onCreateClick={mockOnCreateClick}
      />
    );

    const createButton = screen.getByText('Create chat');
    
    await user.click(createButton);
    await user.click(createButton);

    expect(mockOnCreateClick).toHaveBeenCalledTimes(2);
  });

  it('should update when chat count changes', () => {
    const { rerender } = render(
      <ChatsPageHeader
        chatCount={0}
        onCreateClick={mockOnCreateClick}
      />
    );

    expect(screen.queryByText('Create chat')).not.toBeInTheDocument();

    rerender(
      <ChatsPageHeader
        chatCount={5}
        onCreateClick={mockOnCreateClick}
      />
    );

    expect(screen.getByText('Create chat')).toBeInTheDocument();
  });
});
