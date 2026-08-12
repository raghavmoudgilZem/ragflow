import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import EntityListHeader from './index';

vi.mock('@mui/icons-material', () => ({
  Add: () => <span data-testid="add-icon" />,
  FilterAlt: () => <span data-testid="filter-icon" />,
  Search: () => <span data-testid="search-icon" />,
}));

const renderComponent = (
  props: Partial<React.ComponentProps<typeof EntityListHeader>> = {},
) => {
  const defaultProps: React.ComponentProps<typeof EntityListHeader> = {
    icon: <span data-testid="dataset-icon">Icon</span>,
    title: 'Datasets',
    searchValue: '',
    searchPlaceholder: 'Search datasets',
    onSearchChange: vi.fn(),
    onFilterClick: vi.fn(),
    createLabel: 'Create Dataset',
    onCreateClick: vi.fn(),
    showFilter: true,
  };

  return render(
    <ThemeProvider theme={createTheme()}>
      <EntityListHeader {...defaultProps} {...props} />
    </ThemeProvider>,
  );
};

describe('EntityListHeader', () => {
  it('should render title and icon', () => {
    renderComponent();

    expect(screen.getByText('Datasets')).toBeInTheDocument();
    expect(screen.getByTestId('dataset-icon')).toBeInTheDocument();
  });

  it('should render search input', () => {
    renderComponent();

    expect(
      screen.getByPlaceholderText('Search datasets'),
    ).toBeInTheDocument();
  });

  it('should render create button', () => {
    renderComponent();

    expect(
      screen.getByRole('button', {
        name: /create dataset/i,
      }),
    ).toBeInTheDocument();
  });

  it('should render filter button when showFilter is true', () => {
    renderComponent();

    expect(
      screen.getByLabelText('filter Datasets'),
    ).toBeInTheDocument();
  });

  it('should hide filter button when showFilter is false', () => {
    renderComponent({
      showFilter: false,
    });

    expect(
      screen.queryByLabelText('filter Datasets'),
    ).not.toBeInTheDocument();
  });

  it('should call onSearchChange', () => {
    const onSearchChange = vi.fn();

    renderComponent({
      onSearchChange,
    });

    fireEvent.change(
      screen.getByPlaceholderText('Search datasets'),
      {
        target: {
          value: 'react',
        },
      },
    );

    expect(onSearchChange).toHaveBeenCalledWith('react');
  });

  it('should call onFilterClick', () => {
    const onFilterClick = vi.fn();

    renderComponent({
      onFilterClick,
    });

    fireEvent.click(
      screen.getByLabelText('filter Datasets'),
    );

    expect(onFilterClick).toHaveBeenCalledTimes(1);
  });

  it('should call onCreateClick', () => {
    const onCreateClick = vi.fn();

    renderComponent({
      onCreateClick,
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /create dataset/i,
      }),
    );

    expect(onCreateClick).toHaveBeenCalledTimes(1);
  });

  it('should display search value', () => {
    renderComponent({
      searchValue: 'dataset',
    });

    expect(
      screen.getByDisplayValue('dataset'),
    ).toBeInTheDocument();
  });

  it('should render custom placeholder', () => {
    renderComponent({
      searchPlaceholder: 'Search here...',
    });

    expect(
      screen.getByPlaceholderText('Search here...'),
    ).toBeInTheDocument();
  });

  it('should render custom create label', () => {
    renderComponent({
      createLabel: 'New Dataset',
    });

    expect(
      screen.getByRole('button', {
        name: /new dataset/i,
      }),
    ).toBeInTheDocument();
  });

  it('should render component root', () => {
    renderComponent();

    expect(
      screen.getByTestId('entity-list-header'),
    ).toBeInTheDocument();
  });
});