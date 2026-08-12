import { Prisma } from '@prisma/client';

export interface PaginationQuery {
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: Prisma.SortOrder;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  skip: number;
  orderBy: Prisma.FileNodeOrderByWithRelationInput;
}

export function buildPagination(query: PaginationQuery): PaginationOptions {
  const { page, limit, sortBy, sortOrder } = query;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  };
}
