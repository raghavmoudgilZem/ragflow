import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { FilterConfig } from './admin-toolbar.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-toolbar',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatMenuModule, MatRadioModule],
  templateUrl: './admin-toolbar.html',
  styleUrl: './admin-toolbar.scss',
})
export class AdminToolbar implements OnInit, OnDestroy {
@Input() title: string = '';
  @Input() filterConfig?: FilterConfig;
  @Output() filterChanged = new EventEmitter<{ type: 'search' | 'dropdown', value: string }>();

  private readonly searchSubject = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  selectedType: string = 'All';

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(500), 
      distinctUntilChanged(), 
      takeUntil(this.destroy$) 
    ).subscribe(value => {
      this.filterChanged.emit({ type: 'search', value });
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onFilterSelect(value: string): void {
    this.selectedType = value;
    this.filterChanged.emit({ type: 'dropdown', value });
  }

  resetFilters(): void {
    this.selectedType = 'All';
    this.filterChanged.emit({ type: 'dropdown', value: 'All' });
    this.searchSubject.next('');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
