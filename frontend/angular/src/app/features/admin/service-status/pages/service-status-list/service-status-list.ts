import { Component, OnInit } from '@angular/core';
import { IServiceItem, TableColumn } from '../../../../../shared/components/table/table.model';
import { TableComponent } from '../../../../../shared/components/table/table.component';
import { CommonModule } from '@angular/common';
import { ServiceStatus } from '../../services/service-status';
import { NotificationService } from '../../../../../core/services/notification.service';
import { PageEvent } from '@angular/material/paginator';
import { take } from 'rxjs';
import { AdminToolbar } from '../../../../../shared/components/admin-toolbar/admin-toolbar';
import { FilterConfig } from '../../../../../shared/components/admin-toolbar/admin-toolbar.model';
import { SERVICE_TYPES } from './service-status-list-constants';

@Component({
  selector: 'app-service-status-list',
  imports: [TableComponent, CommonModule, AdminToolbar],
  templateUrl: './service-status-list.html',
  styleUrl: './service-status-list.scss',
})
export class ServiceStatusList implements OnInit {
  columnConfig: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'service_type', label: 'Service Type' },
    { key: 'host', label: 'Host' },
    { key: 'port', label: 'Port' },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'actions', label: 'Actions', type: 'action' },
  ];

  serviceData: IServiceItem[] = [
    {
      id: 0,
      name: 'ragflow_0',
      service_type: 'ragflow_server',
      host: '0.0.0.0',
      port: 8380,
      status: 'Alive',
    },
    {
      id: 1,
      name: 'ragflow_0',
      service_type: 'ragflow_server',
      host: '0.0.0.0',
      port: 8380,
      status: 'Timeout',
    },
    {
      id: 2,
      name: 'ragflow_0',
      service_type: 'ragflow_server',
      host: '0.0.0.0',
      port: 8380,
      status: 'Timeout',
    },
    {
      id: 3,
      name: 'ragflow_0',
      service_type: 'ragflow_server',
      host: '0.0.0.0',
      port: 8380,
      status: 'Timeout',
    },
    {
      id: 4,
      name: 'ragflow_0',
      service_type: 'ragflow_server',
      host: '0.0.0.0',
      port: 8380,
      status: 'Alive',
    },
  ];
  totalItems = 0;
  pageSize = 10;
  currentPage = 0;
  toolbarConfig: FilterConfig = {
    menuTitle: 'Service type',
    options: SERVICE_TYPES.map(type => type.label)
  };
  currentFilters = {
    search: '',
    type: 'All'
  };

  constructor(
    private readonly _serviceStatusService: ServiceStatus,
    private readonly _notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadServiceData(this.currentPage, this.pageSize);
  }

  loadServiceData(pageIndex: number, pageSize: number): void {
    const page = pageIndex + 1;

    this._serviceStatusService
      .getServices(page, pageSize)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.serviceData = response?.data ?? [];

          this.totalItems = response.total ?? response.data?.length ?? 0;
        },
        error: (err) => {
          const message = err.error?.message;
          this._notification.showError(message);
        },
      });
  }

  handlePagination(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadServiceData(this.currentPage, this.pageSize);
  }

 handleFilterUpdate(event: { type: 'search' | 'dropdown', value: string }): void {
    if (event.type === 'search') {
      this.currentFilters.search = event.value;
    } else {
      this.currentFilters.type = event.value;
    }
    this.currentPage = 0;
    this.loadServiceData(this.currentPage, this.pageSize);
  }
}
