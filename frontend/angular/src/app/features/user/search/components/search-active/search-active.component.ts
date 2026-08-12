import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { SearchChunk } from '../../models/search.model';

@Component({
  selector: 'app-search-active',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatSelectModule],
  templateUrl: './search-active.component.html',
  styleUrl: './search-active.component.scss',
})
export class SearchActiveComponent {
  @Input() query: string = '';
  @Input() results: SearchChunk[] = [];
  @Input() totalChunks: number = 0;
  @Input() docCount: number = 0;
  @Input() isSearching: boolean = false;
  @Input() showMetadata: boolean = false;

  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() toggleSettings = new EventEmitter<void>();
  @Output() resetSearch = new EventEmitter<void>();

  currentPage = signal<number>(1);
  pageSize = signal<number>(50);

  onSearch(): void {
    if (this.query.trim()) {
      this.searchSubmitted.emit(this.query.trim());
    }
  }

  clearSearch(): void {
    this.query = '';
  }

  getImageUrl(imageId?: string): string {
    if (!imageId) return '';
    return `/api/v1/image/${imageId}`;
  }
}