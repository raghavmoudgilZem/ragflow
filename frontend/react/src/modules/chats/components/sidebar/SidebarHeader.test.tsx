import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SidebarHeader } from './SidebarHeader';

describe('SidebarHeader', () => {
  const mockOnNewChat = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render conversations title', () => {
    render(
      <SidebarHeader
        total={5}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('Conversations')).toBeInTheDocument();
  });

  it('should display total conversation count', () => {
    render(
      <SidebarHeader
        total={12}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('should display zero count', () => {
    render(
      <SidebarHeader
        total={0}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should call onNewChat when plus button is clicked', async () => {
    const user = await userEvent.setup();
    render(
      <SidebarHeader
        total={5}
        onNewChat={mockOnNewChat}
      />
    );

    const newButton = screen.getByRole('button', { name: /new conversation/i });
    await user.click(newButton);

    expect(mockOnNewChat).toHaveBeenCalled();
  });

  it('should render new conversation button with tooltip', () => {
    render(
      <SidebarHeader
        total={5}
        onNewChat={mockOnNewChat}
      />
    );

    const newButton = screen.getByRole('button', { name: /new conversation/i });
    expect(newButton).toBeInTheDocument();
  });

  it('should render chip with small size', () => {
    const { container } = render(
      <SidebarHeader
        total={5}
        onNewChat={mockOnNewChat}
      />
    );

    const chip = container.querySelector('[class*="MuiChip"]');
    expect(chip).toBeInTheDocument();
  });

  it('should handle large conversation counts', () => {
    render(
      <SidebarHeader
        total={999}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('should update count when total prop changes', () => {
    const { rerender } = render(
      <SidebarHeader
        total={5}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('5')).toBeInTheDocument();

    rerender(
      <SidebarHeader
        total={10}
        onNewChat={mockOnNewChat}
      />
    );

    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should trigger new chat multiple times without issues', async () => {
    const user = await userEvent.setup();
    render(
      <SidebarHeader
        total={5}
        onNewChat={mockOnNewChat}
      />
    );

    const newButton = screen.getByRole('button', { name: /new conversation/i });
    
    await user.click(newButton);
    await user.click(newButton);
    await user.click(newButton);

    expect(mockOnNewChat).toHaveBeenCalledTimes(3);
  });
});