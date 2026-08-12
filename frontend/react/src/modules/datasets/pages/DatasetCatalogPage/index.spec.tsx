import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { DatasetCatalogPage } from '../index';

const mockUseDatasetCatalog = vi.fn();
const mockUseDatasetUiStore = vi.fn();
const mockUseDebounce = vi.fn();

vi.mock('../../hooks/useDatasetCatalog', () => ({
    useDatasetCatalog: (...args: unknown[]) => mockUseDatasetCatalog(...args),
}));

vi.mock('../../store/useDatasetUiStore', () => ({
    useDatasetUiStore: (...args: unknown[]) =>
        mockUseDatasetUiStore(...args),
}));

vi.mock('@shared/hooks/useDebounceHook', () => ({
    useDebounce: (...args: unknown[]) => mockUseDebounce(...args),
}));

vi.mock('../../constants/datasetLabels.json', () => ({
    default: {
        pageTitle: 'Datasets',
        searchPlaceholder: 'Search datasets',
        createDataset: 'Create Dataset',
    },
}));

vi.mock('../../../../assets/icons/DatasetIcon', () => ({
    default: () => <div data-testid="dataset-icon" />,
}));


vi.mock('../../components/DatasetGrid', () => ({
    default: (props: any) => (
        <div data-testid="dataset-grid">
            <span data-testid="dataset-count">
                {props.datasets.length}
            </span>

            <span data-testid="loading">
                {String(props.isLoading)}
            </span>

            <span data-testid="error">
                {String(props.isError)}
            </span>

            <span data-testid="total">
                {props.total}
            </span>
        </div>
    ),
}));

const renderComponent = () =>
    render(
        <ThemeProvider theme={createTheme()}>
            <DatasetCatalogPage />
        </ThemeProvider>,
    );

describe('DatasetCatalogPage', () => {
    const setSearch = vi.fn();
    const openDialog = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseDebounce.mockReturnValue('react');

        mockUseDatasetCatalog.mockReturnValue({
            datasets: [
                {
                    id: '1',
                    name: 'Dataset One',
                },
            ],
            total: 1,
            isLoading: false,
            isError: false,
        });

        mockUseDatasetUiStore.mockImplementation(
            (selector: any) =>
                selector({
                    search: '',
                    setSearch,
                    openDialog,
                }),
        );
    });

    it('should render page', () => {
        renderComponent();

        expect(
            screen.getByTestId('entity-list-header'),
        ).toBeInTheDocument();

        expect(screen.getByText('Datasets')).toBeInTheDocument();
    });
    it('should pass catalog data to DatasetGrid', () => {
        renderComponent();

        expect(screen.getByTestId('dataset-count')).toHaveTextContent('1');
        expect(screen.getByTestId('total')).toHaveTextContent('1');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('false');
    });

    it('should render empty datasets', () => {
        mockUseDatasetCatalog.mockReturnValue({
            datasets: [],
            total: 0,
            isLoading: false,
            isError: false,
        });

        renderComponent();

        expect(screen.getByTestId('dataset-count')).toHaveTextContent('0');
        expect(screen.getByTestId('total')).toHaveTextContent('0');
    });

    it('should pass labels to EntityListHeader', () => {
        renderComponent();

        expect(screen.getByText('Datasets')).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText('Search datasets'),
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: /create dataset/i }),
        ).toBeInTheDocument();
    });

    it('should call setSearch', () => {
        renderComponent();

        fireEvent.change(
            screen.getByPlaceholderText('Search datasets'),
            {
                target: { value: 'react' },
            },
        );

        expect(setSearch).toHaveBeenCalledWith('react');

        expect(setSearch).toHaveBeenCalledWith('react');
    });

    it('should open create dialog', () => {
        renderComponent();

        fireEvent.click(
            screen.getByRole('button', {
                name: /create dataset/i,
            }),
        );

        expect(openDialog).toHaveBeenCalledWith('create');

        expect(openDialog).toHaveBeenCalledWith('create');
    });

    it('should call useDatasetCatalog with debounced search', () => {
        renderComponent();

        expect(
            mockUseDatasetCatalog,
        ).toHaveBeenCalledWith({
            search: 'react',
        });
    });

    it('should render loading state', () => {
        mockUseDatasetCatalog.mockReturnValue({
            datasets: [],
            total: 0,
            isLoading: true,
            isError: false,
        });

        renderComponent();

        expect(
            screen.getByText('true'),
        ).toBeInTheDocument();
    });

    it('should render error state', () => {
        mockUseDatasetCatalog.mockReturnValue({
            datasets: [],
            total: 0,
            isLoading: false,
            isError: true,
        });

        renderComponent();

        expect(
            screen.getByText('true'),
        ).toBeInTheDocument();
    });

    it('should render empty datasets', () => {
        mockUseDatasetCatalog.mockReturnValue({
            datasets: [],
            total: 0,
            isLoading: false,
            isError: false,
        });

        renderComponent();

        expect(screen.getByTestId('dataset-count')).toHaveTextContent('0');
        expect(screen.getByTestId('total')).toHaveTextContent('0');
        expect(screen.getByTestId('loading')).toHaveTextContent('false');
        expect(screen.getByTestId('error')).toHaveTextContent('false');
    });

    it('should render dataset icon', () => {
        renderComponent();

        expect(
            screen.getByTestId('dataset-icon'),
        ).toBeInTheDocument();
    });

    it('should handle filter click', () => {
        renderComponent();

        screen.getByLabelText(/filter/i)

        expect(
            screen.getByTestId('entity-list-header'),
        ).toBeInTheDocument();
    });
});