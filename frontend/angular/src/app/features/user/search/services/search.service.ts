import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApiResponse,
  SearchApp,
  SearchAppListData,
  CreateSearchAppRequest,
  UpdateSearchAppRequest,
  SearchExecuteRequest,
  SearchExecuteResponseData,
} from '../models/search.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000';

  getSearchApps(): Observable<ApiResponse<SearchAppListData>> {
    return this.http.get<SearchApp[]>(`${this.baseUrl}/searches`).pipe(
      map((apps) => ({
        code: 0,
        data: {
          search_apps: apps,
          total: apps.length,
        },
        message: 'success',
      }))
    );
  }

  createSearchApp(payload: CreateSearchAppRequest): Observable<ApiResponse<SearchApp>> {
    const newApp = {
      name: payload.name,
      description: payload.description || 'You are an intelligent assistant.',
      create_time: Date.now(),
    };

    return this.http.post<SearchApp>(`${this.baseUrl}/searches`, newApp).pipe(
      map((createdApp) => ({
        code: 0,
        data: createdApp,
        message: 'success',
      }))
    );
  }

  updateSearchApp(id: string, payload: UpdateSearchAppRequest): Observable<ApiResponse<boolean>> {
    return this.http.patch<SearchApp>(`${this.baseUrl}/searches/${id}`, payload).pipe(
      map(() => ({
        code: 0,
        data: true,
        message: 'success',
      }))
    );
  }

  deleteSearchApp(id: string): Observable<ApiResponse<boolean>> {
    return this.http.delete(`${this.baseUrl}/searches/${id}`).pipe(
      map(() => ({
        code: 0,
        data: true,
        message: 'success',
      }))
    );
  }

  executeDatasetSearch(payload: SearchExecuteRequest): Observable<ApiResponse<SearchExecuteResponseData>> {
    return this.http.get<ApiResponse<SearchExecuteResponseData>>(`${this.baseUrl}/datasets-search`).pipe(
      map((res) => ({
        code: res.code ?? 0,
        data: res.data,
        message: res.message || 'success',
      }))
    );
  }
}