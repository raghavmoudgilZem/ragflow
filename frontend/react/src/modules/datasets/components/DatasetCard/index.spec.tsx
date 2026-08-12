import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import DatasetCard from './index';
import type { IDataset } from '../../types/dataset.types';

const mockEntityCard = vi.fn();

vi.mock('../EntityCard', () => ({
  default: (props: unknown) => {
    mockEntityCard(props);
    return <div data-testid="entity-card" />;
  },
}));

const createDataset = (
  overrides: Partial<IDataset> = {},
): IDataset => ({
  id: 'dataset-123',
  name: 'My Dataset',
  description: 'Test Dataset',
  embedding_model: 'nomic-embed-text',
  parser_type: 'qa',
  permission: 'me',
  file_count: 5,
  tenant_id: 'tenant-1',
  owner_name: 'John Doe',
  owner_avatar_url: null,
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-02T00:00:00.000Z',
  ...overrides,
});

describe('DatasetCard', () => {
  const onSelect = vi.fn();
  const onRename = vi.fn();
  const onDelete = vi.fn();

  const avatarColorMap = {
    me: '#1976d2',
    team: '#2e7d32',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render EntityCard', () => {
    render(
      <DatasetCard
        dataset={createDataset()}
        isSelected={false}
        onSelect={onSelect}
        onRename={onRename}
        onDelete={onDelete}
        avatarColorMap={avatarColorMap}
      />,
    );

    expect(screen.getByTestId('entity-card')).toBeInTheDocument();
  });

  it('should pass mapped props to EntityCard', () => {
    const dataset = createDataset();

    render(
      <DatasetCard
        dataset={dataset}
        isSelected={true}
        selectable
        onSelect={onSelect}
        onRename={onRename}
        onDelete={onDelete}
        avatarColorMap={avatarColorMap}
      />,
    );

    expect(mockEntityCard).toHaveBeenCalledTimes(1);

    const props = mockEntityCard.mock.calls[0][0];

    expect(props).toMatchObject({
      id: dataset.id,
      title: dataset.name,
      avatarColor: avatarColorMap.me,
      selectable: true,
      isSelected: true,
      onSelect,
    });

    expect(props.metaLines).toEqual([
      '5 files',
      dataset.updated_at,
    ]);
  });

  it('should use default selectable value as false', () => {
    render(
      <DatasetCard
        dataset={createDataset()}
        isSelected={false}
        onSelect={onSelect}
        onRename={onRename}
        onDelete={onDelete}
        avatarColorMap={avatarColorMap}
      />,
    );

    const props = mockEntityCard.mock.calls[0][0];

    expect(props.selectable).toBe(false);
  });

  it('should pass correct avatar color for team permission', () => {
    render(
      <DatasetCard
        dataset={createDataset({
          permission: 'team',
        })}
        isSelected={false}
        onSelect={onSelect}
        onRename={onRename}
        onDelete={onDelete}
        avatarColorMap={avatarColorMap}
      />,
    );

    const props = mockEntityCard.mock.calls[0][0];

    expect(props.avatarColor).toBe(avatarColorMap.team);
  });

  it('should configure rename and delete actions', () => {
    const dataset = createDataset();

    render(
      <DatasetCard
        dataset={dataset}
        isSelected={false}
        onSelect={onSelect}
        onRename={onRename}
        onDelete={onDelete}
        avatarColorMap={avatarColorMap}
      />,
    );

    const props = mockEntityCard.mock.calls[0][0];

    expect(props.actions).toEqual([
      {
        label: 'Rename',
        onClick: onRename,
        testId: `dataset-rename-${dataset.id}`,
      },
      {
        label: 'Delete',
        onClick: onDelete,
        testId: `dataset-delete-${dataset.id}`,
      },
    ]);
  });

  it('should create correct meta lines', () => {
    const dataset = createDataset({
      file_count: 27,
      updated_at: '2026-06-15T10:30:00.000Z',
    });

    render(
      <DatasetCard
        dataset={dataset}
        isSelected={false}
        onSelect={onSelect}
        onRename={onRename}
        onDelete={onDelete}
        avatarColorMap={avatarColorMap}
      />,
    );

    const props = mockEntityCard.mock.calls[0][0];

    expect(props.metaLines).toEqual([
      '27 files',
      '2026-06-15T10:30:00.000Z',
    ]);
  });
});