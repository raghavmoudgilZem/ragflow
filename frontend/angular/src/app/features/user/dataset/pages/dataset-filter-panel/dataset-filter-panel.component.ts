import { Component, EventEmitter, Input, Output, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';

import { EmbeddingModel } from '../../models';
import { DatasetFilters } from '../../types';
import { DatasetService } from '../../services';

@Component({
  selector: 'app-dataset-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
  ],
  templateUrl: './dataset-filter-panel.component.html',
  styleUrl: './dataset-filter-panel.component.scss',
})
export class DatasetFilterPanelComponent implements OnInit {
  private datasetService = inject(DatasetService);

  @Input() initialFilters: DatasetFilters = {};
  @Output() apply = new EventEmitter<DatasetFilters>();
  @Output() closePanel = new EventEmitter<void>();

  embeddingModels = signal<EmbeddingModel[]>([]);
  isLoadingModels = signal(false);

  form = new FormGroup({
    createdFrom: new FormControl<Date | null>(null),
    createdTo: new FormControl<Date | null>(null),
    embeddingModel: new FormControl<string | null>(null),
  });

  get hasActiveFilters(): boolean {
    const v = this.form.value;
    return !!(v.createdFrom || v.createdTo || v.embeddingModel);
  }

  ngOnInit(): void {
    this.isLoadingModels.set(true);
    this.datasetService.getEmbeddingModels().subscribe({
      next: (models) => {
        this.embeddingModels.set(models);
        this.isLoadingModels.set(false);
      },
      error: () => this.isLoadingModels.set(false),
    });

    if (this.initialFilters.createdFrom) {
      this.form.patchValue({ createdFrom: new Date(this.initialFilters.createdFrom) });
    }
    if (this.initialFilters.createdTo) {
      this.form.patchValue({ createdTo: new Date(this.initialFilters.createdTo) });
    }
    if (this.initialFilters.embeddingModel) {
      this.form.patchValue({ embeddingModel: this.initialFilters.embeddingModel });
    }
  }

  onApply(): void {
    const v = this.form.value;
    const filters: DatasetFilters = {
      ...(v.createdFrom && { createdFrom: this.toIsoDate(v.createdFrom) }),
      ...(v.createdTo && { createdTo: this.toIsoDate(v.createdTo) }),
      ...(v.embeddingModel && { embeddingModel: v.embeddingModel }),
    };
    this.apply.emit(filters);
    this.closePanel.emit();
  }

  onReset(): void {
    this.form.reset();
    this.apply.emit({});
    this.closePanel.emit();
  }

  private toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
