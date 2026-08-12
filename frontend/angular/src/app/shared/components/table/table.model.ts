import { TemplateRef } from '@angular/core';

export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'action' | 'custom';
  sortable?: boolean;
  width?: string;
  customTemplate?: TemplateRef<any>;
}

export interface IServiceItem {
  id: number | string;
  name: string;
  service_type: string;
  host: string;
  port: number | string;
  status: string;
  [key: string]: string | number | boolean | object | undefined;
}

export interface IServiceResponse {
  data: IServiceItem[];
  total: number;
  message?: string;
}
