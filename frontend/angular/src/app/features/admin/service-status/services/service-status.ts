import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../../shared/constants/constant';
import { IServiceItem, IServiceResponse } from '../../../../shared/components/table/table.model';

@Injectable({
  providedIn: 'root',
})
export class ServiceStatus {
  constructor(private readonly http: HttpClient) {}
  private readonly apiUrl = API_ENDPOINTS.ADMIN.SERVICES;

getServices(page: number, pageSize: number): Observable<IServiceResponse> {
  const url = `${this.apiUrl}?page=${page}&page_size=${pageSize}`;
  return this.http.get<IServiceResponse>(url);
}
}
