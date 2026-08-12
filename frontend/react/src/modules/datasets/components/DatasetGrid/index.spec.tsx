import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DatasetGrid from './index';
import type { IDataset } from '../../types/dataset.types';
import { useDatasetUiStore } from '../../store/useDatasetUiStore';

vi.mock('../../store/useDatasetUiStore', () => ({
    useDatasetUiStore: vi.fn(),
}));

vi.mock('../SkeletonCard', () => ({
    default: () => <div data-testid="dataset-card-skeleton" />,
}));

vi.mock('../EmptyState', () => ({
    default: ({
        message,
        onAddClick,
    }: {
        message: string;
        onAddClick: () => void;
    }) => (
        <div data-testid="dataset-empty-state">
            <span>{message}</span>
            <button
                data-testid="add-dataset-btn"
                onClick={onAddClick}
            >
                Add Dataset
            </button>
        </div>
    ),
}));

const createDataset = (
    overrides: Partial<IDataset> = {},
): IDataset => ({
    id: 'dataset-1',
    name: 'Dataset',
    description: 'Description',
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

describe('DatasetGrid', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useDatasetUiStore).mockImplementation((selector) =>
            selector({
                pageSize: 4,
            } as never),
        );
    });

    it('should render skeletons while loading', () => {
        render(
            <DatasetGrid
                datasets={[]}
                isLoading
                isError={false}
                total={0}
            />,
        );

        const skeletons = screen.getAllByTestId(
            'dataset-card-skeleton',
        );

        expect(skeletons).toHaveLength(4);
    });

    it('should render error state', () => {
        render(
            <DatasetGrid
                datasets={[]}
                isLoading={false}
                isError
                total={0}
            />,
        );

        expect(
            screen.getByTestId('dataset-grid-error'),
        ).toBeInTheDocument();

        expect(
            screen.getByRole('alert'),
        ).toHaveTextContent(
            'Something went wrong. Try again.',
        );
    });

    it('should render empty state when no datasets exist', () => {
        render(
            <DatasetGrid
                datasets={[]}
                isLoading={false}
                isError={false}
                total={0}
            />,
        );

        expect(
            screen.getByTestId('dataset-empty-state'),
        ).toBeInTheDocument();

        expect(
            screen.getByText('No datasets found.'),
        ).toBeInTheDocument();
    });

    it('should not render loading state when not loading', () => {
        render(
            <DatasetGrid
                datasets={[]}
                isLoading={false}
                isError={false}
                total={0}
            />,
        );

        expect(
            screen.queryByTestId('dataset-card-skeleton'),
        ).not.toBeInTheDocument();
    });

    it('should not render error state while loading', () => {
        render(
            <DatasetGrid
                datasets={[]}
                isLoading
                isError
                total={0}
            />,
        );

        expect(
            screen.queryByTestId('dataset-grid-error'),
        ).not.toBeInTheDocument();

        expect(
            screen.getAllByTestId('dataset-card-skeleton'),
        ).toHaveLength(4);
    });

    it('should render success state placeholder when datasets exist', () => {
        render(
            <DatasetGrid
                datasets={[createDataset()]}
                isLoading={false}
                isError={false}
                total={1}
            />,
        );

        expect(
            screen.queryByTestId('dataset-card-skeleton'),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByTestId('dataset-grid-error'),
        ).not.toBeInTheDocument();

        expect(
            screen.queryByTestId('dataset-empty-state'),
        ).not.toBeInTheDocument();
    });

    it('should render pageSize number of skeletons', () => {
        vi.mocked(useDatasetUiStore).mockImplementation((selector) =>
            selector({
                pageSize: 8,
            } as never),
        );

        render(
            <DatasetGrid
                datasets={[]}
                isLoading
                isError={false}
                total={0}
            />,
        );

        expect(
            screen.getAllByTestId('dataset-card-skeleton'),
        ).toHaveLength(8);
    });

    it('should prioritize loading over empty state', () => {
        render(
            <DatasetGrid
                datasets={[]}
                isLoading
                isError={false}
                total={0}
            />,
        );

        expect(
            screen.getAllByTestId('dataset-card-skeleton'),
        ).toHaveLength(4);

        expect(
            screen.queryByTestId('dataset-empty-state'),
        ).not.toBeInTheDocument();
    });

    it('should prioritize error over empty state', () => {
        render(
            <DatasetGrid
                datasets={[]}
                isLoading={false}
                isError
                total={0}
            />,
        );

        expect(
            screen.getByTestId('dataset-grid-error'),
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId('dataset-empty-state'),
        ).not.toBeInTheDocument();
    });


    it('should invoke onAddClick', async () => {
        const user = userEvent.setup();

        render(
            <DatasetGrid
                datasets={[]}
                isLoading={false}
                isError={false}
                total={0}
            />,
        );

        await user.click(
            screen.getByTestId('add-dataset-btn'),
        );

        expect(
            screen.getByTestId('dataset-empty-state'),
        ).toBeInTheDocument();
    });
});