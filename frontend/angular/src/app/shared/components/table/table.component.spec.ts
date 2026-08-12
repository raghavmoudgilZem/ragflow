import { describe, it, expect, beforeEach, vi } from "vitest";
import { TableComponent } from "./table.component";
import { TableColumn, IServiceItem } from "./table.model";
import { PageEvent } from "@angular/material/paginator";

describe("TableComponent (Vitest)", () => {
  let component: TableComponent;

  const mockColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' }
  ];

  const mockData: IServiceItem[] = [
    { id: 0, name: 'Service A', service_type: 'Type A', host: '0.0.0.0', port: 80, status: 'Alive' },
    { id: 1, name: 'Service B', service_type: 'Type B', host: '0.0.0.0', port: 81, status: 'Timeout' }
  ];

  beforeEach(() => {
    component = new TableComponent();
  });

  describe("Initialization", () => {
    it("should initialize with default pagination values", () => {
      expect(component.totalItems).toBe(0);
      expect(component.pageSize).toBe(10);
      expect(component.displayedColumns).toEqual([]);
    });

    it("should map column keys to displayedColumns on ngOnInit", () => {
      component.columns = mockColumns;
      component.ngOnInit();
      expect(component.displayedColumns).toEqual(['id', 'name']);
    });
  });

  describe("Data Binding (Input Setters)", () => {
    it("should update the dataSource when data input is set via setter", () => {
      component.data = mockData;

      expect(component.dataSource.data).toEqual(mockData);
      expect(component.dataSource.data.length).toBe(2);
    });

    it("should allow overriding the dataSource object directly", () => {
      const customSource = { data: [] } as any;
      component.dataSource = customSource;
      expect(component.dataSource).toBe(customSource);
    });
  });

  describe("Pagination Logic", () => {
    it("should emit paginationEvent when onPageChange is called", () => {
      const emitSpy = vi.spyOn(component.paginationEvent, 'emit');
      const mockEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 20,
        length: 100,
        previousPageIndex: 0
      };

      component.onPageChange(mockEvent);

      expect(emitSpy).toHaveBeenCalledWith(mockEvent);
    });

    it("should correctly receive totalItems and pageSize inputs", () => {
      component.totalItems = 50;
      component.pageSize = 25;
      
      expect(component.totalItems).toBe(50);
      expect(component.pageSize).toBe(25);
    });
  });

  describe("Column Logic", () => {
    it("should handle dynamic column updates on ngOnInit", () => {
      const dynamicColumns: TableColumn[] = [
        { key: 'status', label: 'Status' },
        { key: 'actions', label: 'Actions' }
      ];
      component.columns = dynamicColumns;
      
      component.ngOnInit();
      
      expect(component.displayedColumns).toEqual(['status', 'actions']);
    });
  });
});