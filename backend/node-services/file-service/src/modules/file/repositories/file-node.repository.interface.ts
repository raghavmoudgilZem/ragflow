import { FileNode, Prisma, StorageProvider } from '@prisma/client';

export interface CreateFolderInput {
  tenantId: string;
  createdBy: string;
  name: string;
  parentId?: string | null;
  storageProvider: StorageProvider;
  storageBucket?: string | null;
  storageKey: string;
}

export interface ListFolderNodesInput {
  tenantId: string;
  parentId: string | null;
  search?: string;
  skip: number;
  take: number;
  orderBy: Prisma.FileNodeOrderByWithRelationInput;
}

export interface ListFolderNodesResult {
  items: FileNode[];
  total: number;
}
export interface CreateFileInput {
  tenantId: string;
  createdBy: string;
  name: string;
  parentId?: string | null;
  mimeType: string;
  extension: string;
  sizeBytes: bigint;
  storageProvider: StorageProvider;
  storageBucket?: string | null;
  storageKey: string;
}
export abstract class FileNodeRepository {
  abstract createFolder(input: CreateFolderInput): Promise<FileNode>;

  abstract findById(id: string, tenantId: string): Promise<FileNode | null>;

  abstract existsByParentAndName(
    tenantId: string,
    parentId: string | null,
    name: string,
  ): Promise<boolean>;

  abstract listFolderNodes(
    input: ListFolderNodesInput,
  ): Promise<ListFolderNodesResult>;

  abstract createFile(input: CreateFileInput): Promise<FileNode>;
}
