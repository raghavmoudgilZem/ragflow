import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-search-landing',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './search-landing.component.html',
  styleUrl: './search-landing.component.scss',
})
export class SearchLandingComponent implements OnInit {
  @Input() initialQuery: string = '';
  @Input() userName: string = 'sanket.raut';

  @Output() searchSubmitted = new EventEmitter<string>();
  @Output() toggleSettings = new EventEmitter<void>();

  query: string = '';

  ngOnInit(): void {
    this.query = this.initialQuery || '';
  }

  onSearch(): void {
    if (this.query.trim()) {
      this.searchSubmitted.emit(this.query.trim());
    }
  }
}