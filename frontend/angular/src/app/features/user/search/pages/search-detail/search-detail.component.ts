import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSelectModule } from '@angular/material/select';

import { SearchLandingComponent } from '../../components/search-landing/search-landing.component';
import { SearchActiveComponent } from '../../components/search-active/search-active.component';

import { SearchService } from '../../services/search.service';
import { SearchApp, SearchAppSettings, SearchChunk, SearchExecuteRequest } from '../../models/search.model';

@Component({
  selector: 'app-search-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSelectModule,
    SearchLandingComponent,
    SearchActiveComponent,
  ],
  templateUrl: './search-detail.component.html',
  styleUrl: './search-detail.component.scss',
})
export class SearchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private searchService = inject(SearchService);

  appId = signal<string>('');
  currentApp = signal<SearchApp | null>(null);
  searchQuery = signal<string>('');

  isSearchActive = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  searchResults = signal<SearchChunk[]>([]);
  totalChunks = signal<number>(0);
  docCount = signal<number>(0);

  isSettingsOpen = signal<boolean>(false);

  settings = signal<SearchAppSettings>({
    datasets: ['Ragflow Dataset'],
    show_chunk_metadata: false,
    similarity_threshold: 0.2,
    vector_similarity_weight: 0.3,
    full_text_similarity_weight: 0.7,
    rerank_model: '',
    ai_summary: false,
    enable_related_search: false,
    show_query_mindmap: false,
  });

  availableDatasets = [
    { id: '1', name: 'Ragflow Dataset', owner: 'sanket.raut' },
    { id: '2', name: 'Documentation KB', owner: 'sanket.raut' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    const isNewApp = this.route.snapshot.queryParamMap.get('isNew') === 'true';
    if (isNewApp) {
      this.isSettingsOpen.set(true);
    }

    if (id) {
      this.appId.set(id);
      this.loadAppDetails(id);
    }
  }

  loadAppDetails(id: string): void {
    this.searchService.getSearchApps().subscribe({
      next: (res) => {
        if (res.code === 0 && res.data) {
          const app = res.data.search_apps.find((a) => a.id === id);
          if (app) {
            this.currentApp.set(app);
          }
        }
      },
    });
  }

  toggleSettings(): void {
    this.isSettingsOpen.update((prev) => !prev);
  }

  onVectorWeightChange(val: number): void {
    const vectorWeight = Number(val.toFixed(2));
    const fullTextWeight = Number((1 - vectorWeight).toFixed(2));

    this.settings.update((s) => ({
      ...s,
      vector_similarity_weight: vectorWeight,
      full_text_similarity_weight: fullTextWeight,
    }));
  }

  saveSettings(): void {
    const app = this.currentApp();
    if (!app) return;

    this.searchService
      .updateSearchApp(app.id, {
        settings: this.settings(),
      })
      .subscribe({
        next: (res) => {
          if (res.code === 0) {
            this.isSettingsOpen.set(false);
          }
        },
      });
  }

  executeSearch(query: string): void {
    if (!query) return;

    this.searchQuery.set(query);
    this.isSearching.set(true);
    this.isSearchActive.set(true);

    const payload: SearchExecuteRequest = {
      highlight: true,
      question: query,
      page: 1,
      size: 50,
      search_id: this.appId(),
      tenant_id: null,
      dataset_ids: this.settings().datasets || [],
    };

    this.searchService.executeDatasetSearch(payload).subscribe({
      next: (res) => {
        if (res.code === 0 && res.data) {
          this.searchResults.set(res.data.chunks || []);
          this.totalChunks.set(res.data.total || 0);
          const totalDocs = res.data.doc_aggs ? res.data.doc_aggs.length : 0;
          this.docCount.set(totalDocs);
        }
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false),
    });
  }

  resetToLanding(): void {
    this.isSearchActive.set(false);
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.totalChunks.set(0);
    this.docCount.set(0);
  }
}