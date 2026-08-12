import datasets from './data.js';

export interface IDataset {
  id: string;
  name: string;
  description: string;
  embedding_model: string;
  parser_type: string;
  permission: 'me' | 'team';
  file_count: number;
  tenant_id: string;
  owner_name: string;
  owner_avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatasetListOptions {
  keywords: string;
  ownerIds: string[];
  page: number;
  pageSize: number;
}

export interface DatasetListData {
  list: IDataset[];
  total: number;
  current_page: number;
  page_size: number;
}

const store: IDataset[] = [...datasets];

export const datasetRepository = {
  list({
    keywords,
    ownerIds,
    page,
    pageSize,
  }: DatasetListOptions): DatasetListData {
    let results = [...store];

    if (keywords) {
      results = results.filter((dataset) =>
        dataset.name
          .toLowerCase()
          .includes(keywords.toLowerCase()),
      );
    }

    if (ownerIds.length > 0) {
      results = results.filter((dataset) =>
        ownerIds.includes(dataset.owner_name),
      );
    }

    const total = results.length;
    const start = (page - 1) * pageSize;

    return {
      list: results.slice(start, start + pageSize),
      total,
      current_page: page,
      page_size: pageSize,
    };
  },

  getById(id: string): IDataset | undefined {
    return store.find((dataset) => dataset.id === id);
  },

  create(dataset: IDataset): IDataset {
    store.push(dataset);
    return dataset;
  },

  update(
    id: string,
    payload: Partial<IDataset>,
  ): IDataset | undefined {
    const index = store.findIndex(
      (dataset) => dataset.id === id,
    );

    if (index === -1) {
      return undefined;
    }

    store[index] = {
      ...store[index],
      ...payload,
    };

    return store[index];
  },

  remove(id: string): boolean {
    const index = store.findIndex(
      (dataset) => dataset.id === id,
    );

    if (index === -1) {
      return false;
    }

    store.splice(index, 1);
    return true;
  },
};