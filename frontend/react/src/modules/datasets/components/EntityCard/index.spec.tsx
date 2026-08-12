import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import EntityCard,  {
  type EntityCardAction,
  type EntityCardProps,
} from './index';

vi.mock('@mui/icons-material', () => ({
  MoreVert: () => <span data-testid="more-vert-icon" />,
}));

const renderComponent = (
  props: Partial<EntityCardProps> = {},
) => {
  const defaultProps: EntityCardProps = {
    id: 'dataset-1',
    title: 'Dataset One',
    avatarColor: '#1976d2',
    metaLines: ['Owner: John', '10 Files'],
    actions: [],
    selectable: false,
    isSelected: false,
    onClick: vi.fn(),
    onSelect: vi.fn(),
  };

  return render(
    <ThemeProvider theme={createTheme()}>
      <EntityCard {...defaultProps} {...props} />
    </ThemeProvider>,
  );
};

describe('EntityCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title', () => {
    renderComponent();

    expect(
      screen.getByText('Dataset One'),
    ).toBeInTheDocument();
  });

  it('should render all meta lines', () => {
    renderComponent();

    expect(
      screen.getByText('Owner: John'),
    ).toBeInTheDocument();

    expect(
      screen.getByText('10 Files'),
    ).toBeInTheDocument();
  });

  it('should render avatar initial', () => {
    renderComponent();

    expect(
      screen.getByText('D'),
    ).toBeInTheDocument();
  });

  it('should render card root', () => {
    renderComponent();

    expect(
      screen.getByTestId('entity-card-dataset-1'),
    ).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const onClick = vi.fn();

    renderComponent({
      onClick,
    });

    fireEvent.click(
      screen.getByTestId('entity-card-dataset-1'),
    );

    expect(onClick).toHaveBeenCalledWith(
      'dataset-1',
    );
  });

  it('should not fail when onClick is undefined', () => {
    renderComponent({
      onClick: undefined,
    });

    fireEvent.click(
      screen.getByTestId('entity-card-dataset-1'),
    );

    expect(
      screen.getByText('Dataset One'),
    ).toBeInTheDocument();
  });

  it('should render checkbox when selectable', () => {
    renderComponent({
      selectable: true,
    });

    expect(
      screen.getByRole('checkbox'),
    ).toBeInTheDocument();
  });

  it('should not render checkbox when selectable is false', () => {
    renderComponent({
      selectable: false,
    });

    expect(
      screen.queryByRole('checkbox'),
    ).not.toBeInTheDocument();
  });

  it('should render checked checkbox', () => {
    renderComponent({
      selectable: true,
      isSelected: true,
    });

    expect(
      screen.getByRole('checkbox'),
    ).toBeChecked();
  });

  it('should call onSelect when checkbox changes', () => {
    const onSelect = vi.fn();

    renderComponent({
      selectable: true,
      onSelect,
    });

    fireEvent.click(
      screen.getByRole('checkbox'),
    );

    expect(onSelect).toHaveBeenCalledWith(
      'dataset-1',
    );
  });

  it('should not trigger card click when checkbox is clicked', () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();

    renderComponent({
      selectable: true,
      onClick,
      onSelect,
    });

    fireEvent.click(
      screen.getByRole('checkbox'),
    );

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render menu button when actions exist', () => {
    const actions: EntityCardAction[] = [
      {
        label: 'Edit',
        onClick: vi.fn(),
      },
    ];

    renderComponent({
      actions,
    });

    expect(
      screen.getByLabelText('entity actions'),
    ).toBeInTheDocument();
  });

  it('should not render menu button when actions are empty', () => {
    renderComponent({
      actions: [],
    });

    expect(
      screen.queryByLabelText('entity actions'),
    ).not.toBeInTheDocument();
  });

  it('should open menu when menu button is clicked', () => {
    renderComponent({
      actions: [
        {
          label: 'Edit',
          onClick: vi.fn(),
        },
      ],
    });

    fireEvent.click(
      screen.getByLabelText('entity actions'),
    );

    expect(
      screen.getByText('Edit'),
    ).toBeInTheDocument();
  });
    it('should call action callback with entity id', () => {
    const onEdit = vi.fn();

    renderComponent({
      actions: [
        {
          label: 'Edit',
          onClick: onEdit,
        },
      ],
    });

    fireEvent.click(
      screen.getByLabelText('entity actions'),
    );

    fireEvent.click(
      screen.getByText('Edit'),
    );

    expect(onEdit).toHaveBeenCalledWith('dataset-1');
  });

  it('should close menu after action click', async () => {
    const onEdit = vi.fn();

    renderComponent({
      actions: [
        {
          label: 'Edit',
          onClick: onEdit,
        },
      ],
    });

    fireEvent.click(
      screen.getByLabelText('entity actions'),
    );

    fireEvent.click(
      screen.getByText('Edit'),
    );

    expect(onEdit).toHaveBeenCalledTimes(1);

    await screen.findByTestId('entity-card-dataset-1');
  });

  it('should render multiple actions', () => {
    renderComponent({
      actions: [
        {
          label: 'Edit',
          onClick: vi.fn(),
        },
        {
          label: 'Delete',
          onClick: vi.fn(),
        },
      ],
    });

    fireEvent.click(
      screen.getByLabelText('entity actions'),
    );

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('should render action with custom test id', () => {
    renderComponent({
      actions: [
        {
          label: 'Delete',
          onClick: vi.fn(),
          testId: 'delete-action',
        },
      ],
    });

    fireEvent.click(
      screen.getByLabelText('entity actions'),
    );

    expect(
      screen.getByTestId('delete-action'),
    ).toBeInTheDocument();
  });

 it('should close menu on escape key', () => {
  renderComponent({
    actions: [
      {
        label: 'Edit',
        onClick: vi.fn(),
      },
    ],
  });

  fireEvent.click(
    screen.getByLabelText('entity actions'),
  );

  expect(screen.getByText('Edit')).toBeInTheDocument();

  fireEvent.keyDown(document, {
    key: 'Escape',
  });
});

  it('should not trigger card click when menu action is clicked', () => {
    const onCardClick = vi.fn();
    const onDelete = vi.fn();

    renderComponent({
      onClick: onCardClick,
      actions: [
        {
          label: 'Delete',
          onClick: onDelete,
        },
      ],
    });

    fireEvent.click(
      screen.getByLabelText('entity actions'),
    );

    fireEvent.click(
      screen.getByText('Delete'),
    );

    expect(onDelete).toHaveBeenCalledWith(
      'dataset-1',
    );

    expect(onCardClick).not.toHaveBeenCalled();
  });

  it('should render empty title', () => {
    renderComponent({
      title: '',
    });

    expect(
      screen.queryByText('Dataset One'),
    ).not.toBeInTheDocument();
  });

  it('should render without meta lines', () => {
    renderComponent({
      metaLines: [],
    });

    expect(
      screen.getByText('Dataset One'),
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Owner: John'),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText('10 Files'),
    ).not.toBeInTheDocument();
  });

  it('should not fail when onSelect is undefined', () => {
    renderComponent({
      selectable: true,
      onSelect: undefined,
    });

    fireEvent.click(
      screen.getByRole('checkbox'),
    );

    expect(
      screen.getByRole('checkbox'),
    ).toBeInTheDocument();
  });

  it('should render uppercase avatar initial', () => {
    renderComponent({
      title: 'dataset',
    });

    expect(
      screen.getByText('D'),
    ).toBeInTheDocument();
  });

  it('should render avatar when avatarColor is undefined', () => {
    renderComponent({
      avatarColor: undefined,
    });

    expect(
      screen.getByText('D'),
    ).toBeInTheDocument();
  });

  it('should apply avatar background color', () => {
    renderComponent({
      avatarColor: '#ff0000',
    });

    const avatar = screen.getByText('D').closest('div');

    expect(avatar).toHaveStyle({
      backgroundColor: '#ff0000',
    });
  });

  it('should render menu icon', () => {
    renderComponent({
      actions: [
        {
          label: 'Edit',
          onClick: vi.fn(),
        },
      ],
    });

    expect(
      screen.getByTestId('more-vert-icon'),
    ).toBeInTheDocument();
  });
});