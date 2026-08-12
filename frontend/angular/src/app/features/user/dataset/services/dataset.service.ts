import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import {
  EmbeddingModel,
  ChunkingMethod,
  Pipeline,
  CreateDatasetPayload,
  PaginatedDatasetResponse,
} from '../models/dataset.model';
import { DatasetListQuery } from '../types';

@Injectable({
  providedIn: 'root',
})
export class DatasetService {
  private readonly baseUrl = `${environment.datasetServiceUrl}/datasets`;

  constructor(private readonly http: HttpClient) {}

  getEmbeddingModels(): Observable<EmbeddingModel[]> {
    return this.http.get<EmbeddingModel[]>(`${this.baseUrl}/embedding-models`);
  }

  getChunkingMethods(): Observable<ChunkingMethod[]> {
    return this.http.get<ChunkingMethod[]>(`${this.baseUrl}/chunking-methods`);
  }

  getPipelines(): Observable<Pipeline[]> {
    return this.http.get<Pipeline[]>(`${this.baseUrl}/pipelines`);
  }

  getDatasets(query: DatasetListQuery): Observable<PaginatedDatasetResponse> {
    let params = new HttpParams().set('page', query.page).set('pageSize', query.pageSize);

    if (query.search) {
      params = params.set('search', query.search);
    }

    const f = query.filters;
    if (f?.createdFrom) params = params.set('createdFrom', f.createdFrom);
    if (f?.createdTo) params = params.set('createdTo', f.createdTo);
    if (f?.minFileCount !== undefined) params = params.set('minFileCount', f.minFileCount);
    if (f?.maxFileCount !== undefined) params = params.set('maxFileCount', f.maxFileCount);
    if (f?.status) params = params.set('status', f.status);
    if (f?.embeddingModel) params = params.set('embeddingModel', f.embeddingModel);

    return this.http.get<PaginatedDatasetResponse>(this.baseUrl, { params });
  }

  createDataset(payload: CreateDatasetPayload): Observable<{ id: string; message: string }> {
    return this.http.post<{ id: string; message: string }>(this.baseUrl, payload);
    // return throwError(() => ({ status: 500 }));
  }

  renameDataset(
    id: string,
    name: string,
  ): Observable<{ id: string; name: string; message: string }> {
    return this.http.patch<{ id: string; name: string; message: string }>(`${this.baseUrl}/${id}`, {
      name,
    });
  }

  deleteDataset(id: string): Observable<{ id: string; message: string }> {
    return this.http.delete<{ id: string; message: string }>(`${this.baseUrl}/${id}`);
  }
}
