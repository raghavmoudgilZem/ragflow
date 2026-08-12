import { describe, it, expect, beforeEach, vi } from "vitest";
import { ServiceStatusList } from "./service-status-list";
import { of, throwError } from "rxjs";
import { PageEvent } from "@angular/material/paginator";

describe("ServiceStatusList (Vitest)", () => {
  let component: ServiceStatusList;
  
  let serviceStatusMock: any;
  let notificationMock: any;

  const mockPaginatedResponse = {
    data: [
      { id: 10, name: 'test_service', service_type: 'server', host: '1.1.1.1', port: 80, status: 'Alive' }
    ],
    total: 100
  };

  beforeEach(() => {
    serviceStatusMock = {
      getServices: vi.fn().mockReturnValue(of(mockPaginatedResponse))
    };

    notificationMock = {
      showError: vi.fn(),
    };

    component = new ServiceStatusList(
      serviceStatusMock,
      notificationMock
    );
  });

  describe("Initialization", () => {
    it("should have correct column configuration", () => {
      expect(component.columnConfig.length).toBe(7);
      expect(component.columnConfig[0].key).toBe('id');
    });

    it("should call loadServiceData with initial pagination on ngOnInit", () => {
      const loadSpy = vi.spyOn(component, 'loadServiceData');
      component.ngOnInit();
      expect(loadSpy).toHaveBeenCalledWith(0, 10);
    });
  });

  describe("loadServiceData()", () => {
    it("should update serviceData and totalItems on successful service call", () => {
      component.loadServiceData(0, 10);

      expect(serviceStatusMock.getServices).toHaveBeenCalledWith(1, 10);
      expect(component.serviceData).toEqual(mockPaginatedResponse.data);
      expect(component.totalItems).toBe(100);
    });

    it("should fall back to data length if total is not provided in response", () => {
      const responseNoTotal = { data: [{}, {}] };
      serviceStatusMock.getServices.mockReturnValue(of(responseNoTotal));

      component.loadServiceData(0, 10);

      expect(component.totalItems).toBe(2);
    });

    it("should show error notification when service call fails", () => {
      const mockError = { error: { message: "Internal Server Error" } };
      serviceStatusMock.getServices.mockReturnValue(throwError(() => mockError));

      component.loadServiceData(0, 10);

      expect(notificationMock.showError).toHaveBeenCalledWith("Internal Server Error");
    });
  });

  describe("handlePagination()", () => {
    it("should update component state and trigger new data load", () => {
      const loadSpy = vi.spyOn(component, 'loadServiceData');
      const mockEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 50,
        length: 100
      };

      component.handlePagination(mockEvent);

      expect(component.currentPage).toBe(2);
      expect(component.pageSize).toBe(50);
      expect(loadSpy).toHaveBeenCalledWith(2, 50);
    });
  });
});