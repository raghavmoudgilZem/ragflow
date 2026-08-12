import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import EntityEmptyState from './index';

describe('EntityEmptyState', () => {
  const onAddClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the provided message', () => {
    render(
      <EntityEmptyState
        icon={<span data-testid="custom-icon">📁</span>}
        message="No datasets found."
        onAddClick={onAddClick}
      />,
    );

    expect(
      screen.getByText('No datasets found.'),
    ).toBeInTheDocument();
  });

  it('should render the provided icon', () => {
    render(
      <EntityEmptyState
        icon={<span data-testid="custom-icon">📁</span>}
        message="No datasets found."
        onAddClick={onAddClick}
      />,
    );

    expect(
      screen.getByTestId('custom-icon'),
    ).toBeInTheDocument();
  });

  it('should render add button with default aria-label', () => {
    render(
      <EntityEmptyState
        icon={<span />}
        message="Empty"
        onAddClick={onAddClick}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'add',
      }),
    ).toBeInTheDocument();
  });

  it('should render add button with custom aria-label', () => {
    render(
      <EntityEmptyState
        icon={<span />}
        message="Empty"
        onAddClick={onAddClick}
        addButtonLabel="Add Dataset"
      />,
    );

    expect(
      screen.getByRole('button', {
        name: 'Add Dataset',
      }),
    ).toBeInTheDocument();
  });

  it('should call onAddClick when button is clicked', async () => {
    const user = userEvent.setup();

    render(
      <EntityEmptyState
        icon={<span />}
        message="Empty"
        onAddClick={onAddClick}
      />,
    );

    await user.click(
      screen.getByRole('button', {
        name: 'add',
      }),
    );

    expect(onAddClick).toHaveBeenCalledOnce();
  });

  it('should call onAddClick on multiple clicks', async () => {
    const user = userEvent.setup();

    render(
      <EntityEmptyState
        icon={<span />}
        message="Empty"
        onAddClick={onAddClick}
      />,
    );

    const button = screen.getByRole('button', {
      name: 'add',
    });

    await user.click(button);
    await user.click(button);

    expect(onAddClick).toHaveBeenCalledTimes(2);
  });

  it('should render empty message', () => {
    render(
      <EntityEmptyState
        icon={<span />}
        message=""
        onAddClick={onAddClick}
      />,
    );

    expect(
      screen.getByRole('button'),
    ).toBeInTheDocument();
  });

  it('should render without an icon', () => {
    render(
      <EntityEmptyState
        icon={null}
        message="No data available"
        onAddClick={onAddClick}
      />,
    );

    expect(
      screen.getByText('No data available'),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('button'),
    ).toBeInTheDocument();
  });
});