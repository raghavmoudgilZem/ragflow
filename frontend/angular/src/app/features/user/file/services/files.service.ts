import { Injectable, signal } from '@angular/core';
import { Observable, of, delay, throwError, catchError, tap } from 'rxjs';

export interface FileRow {
  id: string;
  name: string;
  uploadDate: string;
  source: string;
  enabled: boolean;
  chunks: number;
  metadata: string;
  parse: string;
  type?: 'file' | 'folder';
  fileType: string;
  selected: boolean;
  parentId?: string | null;
  sizeInBytes?: number; // Store size in bytes as received from file metadata
  dataset?: string;
  hasChildFolder?: boolean;
}

export interface FolderBreadcrumb {
  id: string;
  name: string;
  path: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  // Loading state signals
  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  // Mock data store - in production, this would be replaced with HTTP calls
  private mockFiles: FileRow[] = [
    {
      id: 'folder-1',
      name: 'knowledgebase',
      uploadDate: '05/03/2026 21:21:17',
      source: 'local',
      enabled: true,
      chunks: 0,
      metadata: '',
      parse: '',
      type: 'folder',
      fileType: 'folder',
      selected: false,
      parentId: null,
      sizeInBytes: 0, // Will be calculated from children
      dataset: 'Knowledge Base',
      hasChildFolder: true,
    },
    {
      id: 'folder-2',
      name: 'about-us-callbyte',
      uploadDate: '05/03/2026 21:21:17',
      source: 'local',
      enabled: true,
      chunks: 0,
      metadata: '',
      parse: '',
      type: 'folder',
      fileType: 'folder',
      selected: false,
      parentId: 'folder-1',
      sizeInBytes: 0, // Will be calculated from children
      dataset: 'CallByte Docs',
      hasChildFolder: false,
    },
    {
      id: '1',
      name: 'About_Us_-_Callbyte.pdf',
      uploadDate: '19/02/2026 22:50:14',
      source: 'local',
      enabled: true,
      chunks: 12,
      metadata: '0 Fields',
      parse: 'general',
      type: 'file',
      fileType: 'pdf',
      selected: false,
      parentId: 'folder-2',
      sizeInBytes: 2201600, // 2.1 MB in bytes
      dataset: 'CallByte Docs',
    },
    {
      id: '2',
      name: 'report-2026-q1.docx',
      uploadDate: '02/03/2026 14:22:45',
      source: 'local',
      enabled: true,
      chunks: 18,
      metadata: '3 Fields',
      parse: 'general',
      type: 'file',
      fileType: 'docx',
      selected: false,
      parentId: null,
      sizeInBytes: 1572864, // 1.5 MB in bytes
      dataset: 'Q1 Reports',
    },
    {
      id: '3',
      name: 'dataset-analysis.xlsx',
      uploadDate: '03/03/2026 11:05:12',
      source: 'cloud',
      enabled: false,
      chunks: 24,
      metadata: '5 Fields',
      parse: 'table',
      type: 'file',
      fileType: 'xlsx',
      selected: false,
      parentId: 'folder-1',
      sizeInBytes: 876544, // 856 KB in bytes
      dataset: 'Analytics',
    },
  ];

  /**
   * Get all files in the root directory
   */
  getFiles(): Observable<FileRow[]> {
    return this.getFilesByParent(null);
  }

  /**
   * Get files and folders by parent ID
   * @param parentId - The parent folder ID, null for root
   */
  getFilesByParent(parentId: string | null): Observable<FileRow[]> {
    this._isLoading.set(true);

    try {
      const filtered = this.mockFiles.filter((f) => f.parentId === parentId);

      // Calculate folder sizes in bytes
      const filesWithSizes = filtered.map((item) => {
        if (item.type === 'folder') {
          const folderSizeInBytes = this.calculateFolderSizeInBytes(item.id);
          return { ...item, sizeInBytes: folderSizeInBytes };
        }
        return item;
      });

      return of(filesWithSizes).pipe(
        delay(300), // Simulate network delay
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          console.error('Error fetching files:', error);
          return throwError(() => new Error('Failed to load files. Please try again.'));
        }),
      );
    } catch (error) {
      this._isLoading.set(false);
      return throwError(() => new Error('Failed to load files. Please try again.'));
    }
  }

  /**
   * Calculate total size of all files in a folder (recursively) in bytes
   * @param folderId - The folder ID
   */
  private calculateFolderSizeInBytes(folderId: string): number {
    try {
      const visited = new Set<string>();
      return this.calculateFolderSizeRecursive(folderId, visited);
    } catch (error) {
      console.error('Error calculating folder size:', error);
      return 0;
    }
  }

  /**
   * Recursively calculate folder size with cycle detection
   * @param folderId - The folder ID
   * @param visited - Set of visited folder IDs to prevent infinite loops
   */
  private calculateFolderSizeRecursive(folderId: string, visited: Set<string>): number {
    // Safety check: prevent infinite loops
    if (visited.has(folderId)) {
      console.warn(`Circular reference detected for folder: ${folderId}`);
      return 0;
    }

    visited.add(folderId);
    let totalBytes = 0;

    // Get all items in this folder
    const children = this.mockFiles.filter((f) => f.parentId === folderId);

    for (const child of children) {
      if (child.type === 'folder') {
        // Recursively calculate subfolder size
        totalBytes += this.calculateFolderSizeRecursive(child.id, visited);
      } else if (child.type === 'file' && child.sizeInBytes) {
        // Add file size in bytes
        totalBytes += child.sizeInBytes;
      }
    }

    return totalBytes;
  }

  /**
   * Format bytes to human-readable size
   * @param bytes - Size in bytes
   */
  formatFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
  }

  /**
   * Get breadcrumb trail for a folder
   * @param folderId - The folder ID to get breadcrumbs for
   */
  getParentFolders(folderId: string): Observable<FolderBreadcrumb[]> {
    try {
      const breadcrumbs: FolderBreadcrumb[] = [];

      let currentId: string | null = folderId;
      const visited = new Set<string>();
      const path: FolderBreadcrumb[] = [];

      // Build path from current folder up to root
      while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const folder = this.mockFiles.find((f) => f.id === currentId);
        if (folder?.type === 'folder') {
          path.unshift({
            id: folder.id,
            name: folder.name,
            path: folder.id,
          });
          currentId = folder.parentId || null;
        } else {
          break;
        }
      }

      // Always start with root
      breadcrumbs.push({ id: 'root', name: 'root', path: 'root' });

      // Add the path
      breadcrumbs.push(...path);

      return of(breadcrumbs).pipe(
        delay(100),
        catchError((error) => {
          console.error('Error fetching breadcrumbs:', error);
          return throwError(() => new Error('Failed to load folder path.'));
        }),
      );
    } catch (error) {
      return throwError(() => new Error('Failed to load folder path.'));
    }
  }

  /**
   * Create a new folder
   * @param name - The folder name
   * @param parentId - The parent folder ID, null for root
   */
  createFolder(name: string, parentId: string | null): Observable<FileRow> {
    this._isLoading.set(true);

    try {
      const timestamp = this.getCurrentTimestamp();

      const newFolder: FileRow = {
        id: `folder-${Date.now()}`,
        name,
        uploadDate: timestamp,
        source: 'local',
        enabled: true,
        chunks: 0,
        metadata: '',
        parse: '',
        type: 'folder',
        fileType: 'folder',
        selected: false,
        parentId,
        sizeInBytes: 0,
        dataset: '',
        hasChildFolder: false,
      };

      this.mockFiles.unshift(newFolder);

      return of(newFolder).pipe(
        delay(300),
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          console.error('Error creating folder:', error);
          return throwError(() => new Error('Failed to create folder. Please try again.'));
        }),
      );
    } catch (error) {
      this._isLoading.set(false);
      return throwError(() => new Error('Failed to create folder. Please try again.'));
    }
  }

  /**
   * Upload a file
   * @param file - The file to upload
   * @param parentId - The parent folder ID, null for root
   */
  uploadFile(file: File, parentId: string | null = null): Observable<FileRow> {
    this._isLoading.set(true);

    try {
      const timestamp = this.getCurrentTimestamp();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileSize = this.formatFileSize(file.size);

      const newFile: FileRow = {
        id: `${Date.now()}`,
        name: file.name,
        uploadDate: timestamp,
        source: 'local',
        enabled: false,
        chunks: 0,
        metadata: '0 Fields',
        parse: 'general',
        type: 'file',
        fileType: fileExtension,
        selected: false,
        parentId,
        sizeInBytes: file.size, // Store actual bytes from File object
      };

      this.mockFiles.unshift(newFile);

      return of(newFile).pipe(
        delay(500),
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          console.error('Error uploading file:', error);
          return throwError(() => new Error('Failed to upload file. Please try again.'));
        }),
      );
    } catch (error) {
      this._isLoading.set(false);
      return throwError(() => new Error('Failed to upload file. Please try again.'));
    }
  }

  /**
   * Update a file
   * @param id - The file ID
   * @param updates - Partial file updates
   */
  updateFile(id: string, updates: Partial<FileRow>): Observable<FileRow> {
    this._isLoading.set(true);

    const index = this.mockFiles.findIndex((f) => f.id === id);

    if (index === -1) {
      this._isLoading.set(false);
      return throwError(() => new Error('File not found'));
    }

    this.mockFiles[index] = { ...this.mockFiles[index], ...updates };

    return of(this.mockFiles[index]).pipe(
      delay(200),
      tap(() => this._isLoading.set(false)),
      catchError((error) => {
        this._isLoading.set(false);
        console.error('Error updating file:', error);
        return throwError(() => new Error('Failed to update file. Please try again.'));
      }),
    );
  }

  /**
   * Delete files
   * @param ids - Array of file IDs to delete
   */
  deleteFiles(ids: string[]): Observable<void> {
    this._isLoading.set(true);

    try {
      this.mockFiles = this.mockFiles.filter((f) => !ids.includes(f.id));

      return of(void 0).pipe(
        delay(300),
        tap(() => this._isLoading.set(false)),
        catchError((error) => {
          this._isLoading.set(false);
          console.error('Error deleting files:', error);
          return throwError(() => new Error('Failed to delete files. Please try again.'));
        }),
      );
    } catch (error) {
      this._isLoading.set(false);
      return throwError(() => new Error('Failed to delete files. Please try again.'));
    }
  }

  /**
   * Helper method to get current timestamp
   */
  private getCurrentTimestamp(): string {
    return new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}
