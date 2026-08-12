import { ICardData } from '../../../../shared/components/card/card.component';

export type DatasetCardAction = 'rename' | 'delete';

export interface DatasetCardData extends ICardData {
  createdAt: string;
  fileCount: number;
}

export interface RenameDatasetDialogData {
  id: string;
  currentName: string;
}

export interface RenameDatasetDialogResult {
  renamed: boolean;
  id?: string;
  newName?: string;
  notFound?: boolean;
}

export interface DatasetFilters {
  createdFrom?: string;
  createdTo?: string;
  minFileCount?: number;
  maxFileCount?: number;
  status?: 'active' | 'processing' | 'empty';
  embeddingModel?: string;
}

export interface DatasetListQuery {
  page: number;
  pageSize: number;
  search?: string;
  filters?: DatasetFilters;
}
