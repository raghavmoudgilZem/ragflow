import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AdminToolbar } from "./admin-toolbar";
import { FilterConfig } from "./admin-toolbar.model";

describe("AdminToolbar (Vitest)", () => {
  let component: AdminToolbar;

  const mockFilterConfig: FilterConfig = {
    menuTitle: 'Service type',
    options: ['ragflow_server', 'meta_data']
  };

  beforeEach(() => {
    component = new AdminToolbar();
    component.filterConfig = mockFilterConfig;
    // Essential for testing debounceTime logic
    vi.useFakeTimers(); 
  });

  afterEach(() => {
    vi.restoreAllMocks();
    component.ngOnDestroy();
  });

  describe("Initialization", () => {
    it("should initialize with default selectedType 'All'", () => {
      expect(component.selectedType).toBe('All');
    });

    it("should initialize search stream on ngOnInit", () => {
      const spy = vi.spyOn(component.filterChanged, 'emit');
      component.ngOnInit();
      
      component.onSearch({ target: { value: 'test' } } as any);
      
      vi.advanceTimersByTime(500);
      expect(spy).toHaveBeenCalledWith({ type: 'search', value: 'test' });
    });
  });

  describe("Debounced Search Logic", () => {
    it("should satisfy the 'Debounced input' criteria by waiting 500ms", () => {
      const spy = vi.spyOn(component.filterChanged, 'emit');
      component.ngOnInit();

      // Simulate rapid typing
      component.onSearch({ target: { value: 'r' } } as any);
      component.onSearch({ target: { value: 'ra' } } as any);
      component.onSearch({ target: { value: 'rag' } } as any);

      // Fast-forward only 200ms - should not have emitted yet
      vi.advanceTimersByTime(200);
      expect(spy).not.toHaveBeenCalled();

      // Fast-forward past the 500ms threshold
      vi.advanceTimersByTime(301);
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy).toHaveBeenCalledWith({ type: 'search', value: 'rag' });
    });

    it("should not emit if the search value hasn't changed (distinctUntilChanged)", () => {
      const spy = vi.spyOn(component.filterChanged, 'emit');
      component.ngOnInit();

      component.onSearch({ target: { value: 'rag' } } as any);
      vi.advanceTimersByTime(500);
      
      component.onSearch({ target: { value: 'rag' } } as any);
      vi.advanceTimersByTime(500);

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Filter Selection", () => {
    it("should update selectedType and emit immediately on filter selection", () => {
      const spy = vi.spyOn(component.filterChanged, 'emit');
      
      component.onFilterSelect('meta_data');

      expect(component.selectedType).toBe('meta_data');
      expect(spy).toHaveBeenCalledWith({ type: 'dropdown', value: 'meta_data' });
    });
  });

  describe("Reset Logic", () => {
    it("should reset filters to default and emit 'All'", () => {
      const spy = vi.spyOn(component.filterChanged, 'emit');
      component.selectedType = 'file_store';

      component.resetFilters();

      expect(component.selectedType).toBe('All');
      expect(spy).toHaveBeenCalledWith({ type: 'dropdown', value: 'All' });
    });
  });

  describe("Memory Management", () => {
    it("should complete the destroy$ subject on ngOnDestroy to prevent leaks", () => {
      // Accessing private subject for testing memory leak protection
      const destroySpy = vi.spyOn((component as any).destroy$, 'next');
      const completeSpy = vi.spyOn((component as any).destroy$, 'complete');

      component.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
      expect(completeSpy).toHaveBeenCalled();
    });
  });
});