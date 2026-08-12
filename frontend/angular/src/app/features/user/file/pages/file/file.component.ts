import {
  Component,
  computed,
  signal,
  OnInit,
  AfterViewInit,
  inject,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  BulkAction,
  ListPageLayoutComponent,
} from '../../../../../shared/components/list-page-layout/list-page-layout.component';
import {
  FilterConfig,
  AppliedFilters,
} from '../../../../../shared/components/multi-select-filter-panel/multi-select-filter-panel.component';
import { FilesService, FileRow, FolderBreadcrumb } from '../../services/files.service';
// TODO: Uncomment when file upload is implemented
// import { FileUploadDialogComponent } from '../../components/file-upload-dialog/file-upload-dialog.component';
import { InputDialogComponent } from '../../components/input-dialog/input-dialog.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { TableColumn } from '../../../../../shared/components/table/table.model';
import { FileSizePipe } from '../../../../../shared/pipes/file-size.pipe';

@Component({
  selector: 'app-file',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatDialogModule,
    MatTooltipModule,
    ListPageLayoutComponent,
    TableComponent,
    FileSizePipe,
  ],
  templateUrl: './file.component.html',
  styleUrl: './file.component.scss',
})
export class FileComponent implements OnInit, AfterViewInit {
  private readonly filesService = inject(FilesService);
  private readonly dialog = inject(MatDialog);

  @ViewChild('nameCell') nameCellTemplate!: TemplateRef<any>;
  @ViewChild('sizeCell') sizeCellTemplate!: TemplateRef<any>;
  @ViewChild('actionCell') actionCellTemplate!: TemplateRef<any>;

  // TODO: Filter Configuration - Visible as placeholder, full implementation pending
  readonly filterConfig: FilterConfig = {
    categories: [
      // TODO: Uncomment and configure filter categories when implementing filter functionality
      // {
      //   id: 'system',
      //   label: 'System Attribute',
      //   expanded: true,
      //   multiSelect: true,
      //   options: [
      //     { value: 'local', label: 'Local', count: 3 },
      //     { value: 'cloud', label: 'Cloud', count: 2 },
      //   ],
      // },
      // {
      //   id: 'fileType',
      //   label: 'File Type',
      //   expanded: true,
      //   multiSelect: true,
      //   options: [
      //     { value: 'pdf', label: 'PDF', count: 1 },
      //     { value: 'docx', label: 'DOCX', count: 1 },
      //     { value: 'xlsx', label: 'XLSX', count: 1 },
      //     { value: 'pptx', label: 'PPTX', count: 1 },
      //     { value: 'txt', label: 'TXT', count: 1 },
      //   ],
      // },
      // {
      //   id: 'status',
      //   label: 'Status',
      //   expanded: true,
      //   multiSelect: false,
      //   options: [
      //     { value: 'all', label: 'All' },
      //     { value: 'enabled', label: 'Enabled', count: 4 },
      //     { value: 'disabled', label: 'Disabled', count: 1 },
      //   ],
      // },
      // {
      //   id: 'parse',
      //   label: 'Parse Method',
      //   expanded: false,
      //   multiSelect: true,
      //   options: [
      //     { value: 'general', label: 'General', count: 4 },
      //     { value: 'table', label: 'Table', count: 1 },
      //   ],
      // },
    ],
  };

  // TODO: Applied Filters - Visible as placeholder, full implementation pending
  appliedFilters = signal<AppliedFilters>({});
  sortField = signal<string>('name');
  sortDirection = signal<'asc' | 'desc'>('desc');
  searchValue = signal('');

  // Pagination state
  currentPage = signal<number>(0);
  pageSize = signal<number>(10);

  private readonly _files = signal<FileRow[]>([]);
  currentFile = signal<FileRow | null>(null);
  currentFolderId = signal<string | null>(null);
  breadcrumbs = signal<FolderBreadcrumb[]>([]);

  // Table configuration
  tableColumns: TableColumn[] = [];

  selectedRowIds = computed(() => {
    const ids = new Set<string>();
    this._files().forEach((file) => {
      if (file.selected) ids.add(file.id);
    });
    return ids;
  });

  // Total items for pagination
  totalItems = computed(() => this.filteredFiles().length);

  // Paginated files for display
  paginatedFiles = computed(() => {
    const filtered = this.filteredFiles();
    const page = this.currentPage();
    const size = this.pageSize();
    const startIndex = page * size;
    const endIndex = startIndex + size;
    return filtered.slice(startIndex, endIndex);
  });

  // Empty state detection
  isEmpty = computed(() => this.filteredFiles().length === 0);

  ngOnInit(): void {
    this.initializeTableColumns();
    this.loadFiles();
  }

  ngAfterViewInit(): void {
    // Link custom templates to columns after view initialization
    const nameColumn = this.tableColumns.find((col) => col.key === 'name');
    const sizeColumn = this.tableColumns.find((col) => col.key === 'size');
    const actionColumn = this.tableColumns.find((col) => col.key === 'actions');

    if (nameColumn && this.nameCellTemplate) {
      nameColumn.customTemplate = this.nameCellTemplate;
    }
    if (sizeColumn && this.sizeCellTemplate) {
      sizeColumn.customTemplate = this.sizeCellTemplate;
    }
    if (actionColumn && this.actionCellTemplate) {
      actionColumn.customTemplate = this.actionCellTemplate;
    }
  }

  private initializeTableColumns(): void {
    this.tableColumns = [
      { key: 'name', label: 'Name', sortable: true, type: 'custom', width: '280px' },
      { key: 'uploadDate', label: 'Upload date', sortable: true, width: '180px' },
      { key: 'size', label: 'Size', sortable: true, type: 'custom', width: '120px' },
      { key: 'dataset', label: 'Dataset', type: 'badge', width: '160px' },
      { key: 'actions', label: 'Action', type: 'custom', width: '280px' },
    ];
  }

  private loadFiles(): void {
    const folderId = this.currentFolderId();
    this.filesService.getFilesByParent(folderId).subscribe({
      next: (files) => {
        this._files.set(files);
      },
      error: (error) => {
        console.error('Failed to load files:', error);
      },
    });

    if (folderId) {
      this.filesService.getParentFolders(folderId).subscribe({
        next: (crumbs) => {
          this.breadcrumbs.set(crumbs);
        },
        error: (error) => {
          console.error('Failed to load breadcrumbs:', error);
        },
      });
    } else {
      this.breadcrumbs.set([]);
    }
  }

  // TODO: Filtered Files - Simplified version without filters for now
  filteredFiles = computed(() => {
    // const filters = this.appliedFilters();
    const query = this.searchValue().toLowerCase();

    let result = this._files().filter((file) => {
      // Search by name only for now
      if (query && !file.name.toLowerCase().includes(query)) return false;
      return true;
    });

    // TODO: Apply filters when filter functionality is implemented
    // if (filters['system']?.length > 0) {
    //   if (!filters['system'].includes(file.source)) return false;
    // }
    // if (filters['fileType']?.length > 0) {
    //   if (!filters['fileType'].includes(file.fileType)) return false;
    // }
    // if (filters['status']?.length > 0) {
    //   const status = filters['status'][0];
    //   if (status === 'enabled' && !file.enabled) return false;
    //   if (status === 'disabled' && file.enabled) return false;
    // }
    // if (filters['parse']?.length > 0) {
    //   if (!filters['parse'].includes(file.parse)) return false;
    // }

    const field = this.sortField();
    const dir = this.sortDirection();
    return result.sort((a, b) => {
      // Always keep folders at the top
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;

      // Special handling for size sorting
      if (field === 'size') {
        const aSizeBytes = a.sizeInBytes || 0;
        const bSizeBytes = b.sizeInBytes || 0;
        return dir === 'asc' ? aSizeBytes - bSizeBytes : bSizeBytes - aSizeBytes;
      }

      const aVal = a[field as keyof FileRow];
      const bVal = b[field as keyof FileRow];

      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return dir === 'asc' ? 1 : -1;
      return 0;
    });
  });

  selectedCount = computed(() => this._files().filter((f) => f.selected).length);

  toggleSort(field: string): void {
    if (this.sortField() === field) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  get bulkActions(): BulkAction[] {
    return [
      {
        id: 'enable',
        label: 'Enable',
        icon: 'check_circle_outline',
        onClick: () => this.bulkEnable(true),
      },
      {
        id: 'disable',
        label: 'Disable',
        icon: 'do_not_disturb_on',
        onClick: () => this.bulkEnable(false),
      },
      {
        id: 'parse',
        label: 'Parse',
        icon: 'play_circle_outline',
        onClick: () => alert('Parse triggered'),
      },
      {
        id: 'move',
        label: 'Move',
        icon: 'drive_file_move',
        onClick: () => this.bulkMove(),
      },
      { id: 'cancel', label: 'Cancel', icon: 'cancel', onClick: () => this.clearSelection() },
      {
        id: 'delete',
        label: 'Delete',
        icon: 'delete_outline',
        danger: true,
        onClick: () => this.bulkDelete(),
      },
      { id: 'metadata', label: 'Metadata', icon: 'edit', onClick: () => alert('Metadata dialog') },
    ];
  }

  get allSelected(): boolean {
    const files = this._files();
    return files.length > 0 && files.every((f) => f.selected);
  }

  onSearchChange(value: string): void {
    this.searchValue.set(value);
  }

  // TODO: Filter Applied Handler - Currently updates state, full filtering logic pending
  onFiltersApplied(filters: AppliedFilters): void {
    this.appliedFilters.set(filters);
  }

  toggleAll(event: MatCheckboxChange): void {
    this._files.update((files) => files.map((f) => ({ ...f, selected: event.checked })));
  }

  toggleRow(id: string, event: MatCheckboxChange): void {
    this._files.update((files) =>
      files.map((f) => (f.id === id ? { ...f, selected: event.checked } : f)),
    );
  }

  onAllSelectionChange(checked: boolean): void {
    this._files.update((files) => files.map((f) => ({ ...f, selected: checked })));
  }

  onRowSelectionChange(event: { id: string; selected: boolean }): void {
    this._files.update((files) =>
      files.map((f) => (f.id === event.id ? { ...f, selected: event.selected } : f)),
    );
  }

  onSortChange(event: { field: string; direction: 'asc' | 'desc' }): void {
    this.sortField.set(event.field);
    this.sortDirection.set(event.direction);
    // Reset to first page when sorting changes
    this.currentPage.set(0);
  }

  onPageChange(event: any): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  toggleEnabled(id: string): void {
    this._files.update((files) =>
      files.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
    );
  }

  clearSelection(): void {
    this._files.update((files) => files.map((f) => ({ ...f, selected: false })));
  }

  bulkEnable(state: boolean): void {
    this._files.update((files) =>
      files.map((f) => (f.selected ? { ...f, enabled: state, selected: false } : f)),
    );
  }

  bulkMove(): void {
    // TODO: Implement bulk move functionality
    alert('Bulk move functionality will be implemented soon.');
  }

  bulkDelete(): void {
    this._files.update((files) => files.filter((f) => !f.selected));
  }

  // TODO: File Upload Handler - To be implemented later
  // onFilesSelected(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   if (!input.files || input.files.length === 0) return;
  //
  //   Array.from(input.files).forEach((file) => {
  //     this.filesService.uploadFile(file, this.currentFolderId()).subscribe({
  //       next: (newFile) => {
  //         this._files.update((files) => [newFile, ...files]);
  //       },
  //       error: (error) => {
  //         console.error('Failed to upload file:', error);
  //       },
  //     });
  //   });
  //
  //   input.value = '';
  // }

  // File action methods
  setCurrentFile(file: FileRow): void {
    this.currentFile.set(file);
  }
  getFileExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0 || lastDot === fileName.length - 1) {
      return '';
    }
    return fileName.substring(lastDot + 1).toLowerCase();
  }

  getFileIcon(file: FileRow): { icon: string; class: string } {
    if (file.type === 'folder') {
      return { icon: 'folder', class: 'folder' };
    }

    const extension = this.getFileExtension(file.name);
    if (!extension) {
      return { icon: 'description', class: 'generic' };
    }

    const iconMap: { [key: string]: { icon: string; class: string } } = {
      pdf: { icon: 'picture_as_pdf', class: 'pdf' },
      doc: { icon: 'description', class: 'doc' },
      docx: { icon: 'description', class: 'doc' },
      xls: { icon: 'table_chart', class: 'excel' },
      xlsx: { icon: 'table_chart', class: 'excel' },
      ppt: { icon: 'slideshow', class: 'ppt' },
      pptx: { icon: 'slideshow', class: 'ppt' },
      txt: { icon: 'description', class: 'txt' },
      csv: { icon: 'table_chart', class: 'csv' },
    };

    return iconMap[extension] || { icon: 'description', class: 'generic' };
  }
  // TODO: Upload File - Dummy placeholder, to be implemented later
  showUploadPlaceholder(): void {
    alert('File upload functionality will be implemented soon.');
  }

  openRenameDialog(file: FileRow): void {
    // Extract base name and extension
    const extension = this.getFileExtension(file.name);
    const baseName = extension ? file.name.substring(0, file.name.lastIndexOf('.')) : file.name;

    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      panelClass: 'text-input-dialog-dark',
      data: {
        fileName: baseName,
        title: 'Rename File',
        helperText: extension ? `Extension: .${extension}` : undefined,
      },
    });

    dialogRef.afterClosed().subscribe((newBaseName) => {
      if (newBaseName && newBaseName !== baseName) {
        // Reconstruct filename with original extension
        const newName = extension ? `${newBaseName}.${extension}` : newBaseName;
        this._files.update((files) =>
          files.map((f) => (f.id === file.id ? { ...f, name: newName } : f)),
        );
      }
    });
  }

  openDeleteConfirmation(file: FileRow): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      panelClass: 'confirm-dialog-dark',
      data: {
        title: 'Delete File',
        message: `Are you sure you want to delete "${file.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        isDanger: true,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this._files.update((files) => files.filter((f) => f.id !== file.id));
      }
    });
  }

  isFolder(file: FileRow): boolean {
    return file.type === 'folder';
  }

  navigateToFolder(folderId: string): void {
    this.currentFolderId.set(folderId);
    this.clearSelection();
    this.loadFiles();
  }

  navigateToBreadcrumb(crumb: FolderBreadcrumb): void {
    if (crumb.id === 'root') {
      this.currentFolderId.set(null);
    } else {
      this.currentFolderId.set(crumb.id);
    }
    this.clearSelection();
    this.loadFiles();
  }

  openCreateFolderDialog(): void {
    const dialogRef = this.dialog.open(InputDialogComponent, {
      width: '400px',
      panelClass: 'text-input-dialog-dark',
      data: {
        title: 'Create Folder',
        placeholder: 'Folder name',
      },
    });

    dialogRef.afterClosed().subscribe((folderName) => {
      if (folderName) {
        this.filesService.createFolder(folderName, this.currentFolderId()).subscribe({
          next: (newFolder) => {
            this._files.update((files) => [newFolder, ...files]);
          },
          error: (error) => {
            console.error('Failed to create folder:', error);
          },
        });
      }
    });
  }

  openLinkToDatasetDialog(file: FileRow): void {
    // TODO: Implement link to dataset dialog
    console.log('Link to dataset:', file);
    alert('Link to dataset functionality - to be implemented');
  }

  openMoveFileDialog(file: FileRow): void {
    // TODO: Implement move file dialog
    console.log('Move file:', file);
    alert('Move file functionality - to be implemented');
  }

  viewFile(file: FileRow): void {
    // TODO: Implement file preview/viewer functionality
    alert(
      `File viewer will be implemented soon. This will open a preview of "${file.name}" in a new tab.`,
    );
  }

  downloadFile(file: FileRow): void {
    // TODO: Implement file download
    alert(`Downloading ${file.name}...`);
  }
}
