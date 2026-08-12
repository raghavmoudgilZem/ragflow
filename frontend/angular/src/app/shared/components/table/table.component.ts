import { CommonModule, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { IServiceItem, TableColumn } from './table.model';
import { Pagination } from '../pagination/pagination';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  imports: [
    CommonModule,
    NgTemplateOutlet,
    MatTableModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonModule,
    Pagination,
  ],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
})
export class TableComponent implements OnInit {
  @Input() set data(value: any[]) {
    this.dataSource.data = value;
  }
  @Input() columns: TableColumn[] = [];

  // Selection and sorting features (from HEAD)
  @Input() selectable = false;
  @Input() sortable = false;
  @Input() selectedRows: Set<string> = new Set();
  @Input() sortField = '';
  @Input() sortDirection: 'asc' | 'desc' = 'asc';

  // Pagination features (from origin/dev)
  @Input() dataSource = new MatTableDataSource<any>([]);
  @Input() totalItems = 0;
  @Input() pageSize = 10;

  @Output() sortChange = new EventEmitter<{ field: string; direction: 'asc' | 'desc' }>();
  @Output() allSelectionChange = new EventEmitter<boolean>();
  @Output() rowSelectionChange = new EventEmitter<{ id: string; selected: boolean }>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() paginationEvent = new EventEmitter<PageEvent>();

  @ContentChild('customCell') customCellTemplate?: TemplateRef<any>;

  displayedColumns: string[] = [];

  ngOnInit() {
    this.displayedColumns = this.columns.map((c) => c.key);
    if (this.selectable) {
      this.displayedColumns.unshift('select');
    }
  }

  get allSelected(): boolean {
    const data = this.dataSource.data;
    return data.length > 0 && data.every((row: any) => this.selectedRows.has(row.id));
  }

  get someSelected(): boolean {
    const data = this.dataSource.data;
    return data.some((row: any) => this.selectedRows.has(row.id)) && !this.allSelected;
  }

  isRowSelected(row: any): boolean {
    return this.selectedRows.has(row.id);
  }

  onSort(field: string) {
    if (!this.sortable) return;
    const direction = this.sortField === field && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field, direction });
  }

  toggleAllRows(checked: boolean) {
    this.allSelectionChange.emit(checked);
  }

  toggleRow(row: any, checked: boolean) {
    this.rowSelectionChange.emit({ id: row.id, selected: checked });
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  onPageChange(event: PageEvent) {
    this.paginationEvent.emit(event);
  }
}
