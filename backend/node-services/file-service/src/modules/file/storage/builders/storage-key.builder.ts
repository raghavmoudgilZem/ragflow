import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageKeyBuilder {
  buildRootFolderKey(tenantId: string, folderName: string): string {
    return `${tenantId}/${folderName}/`;
  }

  buildChildFolderKey(parentStorageKey: string, folderName: string): string {
    const normalized = parentStorageKey.endsWith('/')
      ? parentStorageKey
      : `${parentStorageKey}/`;

    return `${normalized}${folderName}/`;
  }

  buildFileKey(folderStorageKey: string, fileName: string): string {
    const normalized = folderStorageKey.endsWith('/')
      ? folderStorageKey
      : `${folderStorageKey}/`;

    return `${normalized}${fileName}`;
  }

  buildRootFileKey(tenantId: string, fileName: string): string {
    return `${tenantId}/${fileName}`;
  }
}
