import { useCallback, useState } from 'react';

export function useChunkSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const toggle = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((items: Array<{ id: string }>, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const itemIds = items.map((item) => item.id);
      
      if (checked) {
        itemIds.forEach((id) => next.add(id));
      } else {
        itemIds.forEach((id) => next.delete(id));
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Removed useCallback - now a plain function
  const isAllSelected = (items: Array<{ id: string }>) => {
    return items.length > 0 && items.every((item) => selectedIds.has(item.id));
  };

  // New helper for indeterminate state
  const isSomeSelected = (items: Array<{ id: string }>) => {
    return items.some((item) => selectedIds.has(item.id));
  };

  return {
    selectedIds,
    toggle,
    selectAll,
    clear,
    isAllSelected,
    isSomeSelected,
  };
}
