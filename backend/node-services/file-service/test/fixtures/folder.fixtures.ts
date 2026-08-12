import { TEST_HEADERS } from '../helpers/test-headers';
import { NodeType, StorageProvider } from '@prisma/client';

export const FolderFixtures = {
  rootFolder: {
    name: 'Documents',
  },

  childFolder: {
    name: 'Images',
  },
  rootFolderForUpload: {
    tenantId: TEST_HEADERS['x-tenant-id'],
    createdBy: TEST_HEADERS['x-user-id'],
    name: 'Documents',
    parentId: null,
    nodeType: NodeType.FOLDER,
    storageProvider: StorageProvider.LOCAL,
    storageBucket: null,
    storageKey: 'tenant-1/Documents',
  },
};
