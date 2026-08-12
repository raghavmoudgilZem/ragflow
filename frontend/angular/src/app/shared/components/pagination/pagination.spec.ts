import { describe, it, expect, beforeEach, vi } from "vitest";
import { Pagination } from "./pagination";
import { PageEvent } from "@angular/material/paginator";

describe("Pagination (Vitest)", () => {
  let component: Pagination;

  beforeEach(() => {
    component = new Pagination();
  });

  describe("Initial State", () => {
    it("should have default input values", () => {
      expect(component.totalItems).toBe(0);
      expect(component.pageSize).toBe(10);
      expect(component.pageSizeOptions).toEqual([10, 20, 50]);
    });
  });

  describe("onPageEvent()", () => {
    it("should emit pageChange event when onPageEvent is called", () => {
      const spy = vi.spyOn(component.pageChange, 'emit');
      const mockEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 20,
        length: 100,
        previousPageIndex: 0
      };

      component.onPageEvent(mockEvent);

      expect(spy).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe("Inputs", () => {
    it("should allow updating totalItems", () => {
      component.totalItems = 500;
      expect(component.totalItems).toBe(500);
    });

    it("should allow updating pageSizeOptions", () => {
      const newOptions = [5, 10, 15];
      component.pageSizeOptions = newOptions;
      expect(component.pageSizeOptions).toEqual(newOptions);
    });
  });
});