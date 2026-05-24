import {
  PaginationState,
  PaginationViewModel,
} from '../models/pagination.models';

export function buildPaginationView(
  state: PaginationState
): PaginationViewModel {
  const totalPages = Math.max(1, Math.ceil(state.totalItems / state.pageSize));
  const currentPage = Math.min(Math.max(1, state.currentPage), totalPages);

  const startItem =
    state.totalItems === 0 ? 0 : (currentPage - 1) * state.pageSize + 1;

  const endItem = Math.min(currentPage * state.pageSize, state.totalItems);

  return {
    startItem,
    endItem,
    totalPages,
    pages: Array.from({ length: totalPages }, (_, i) => i + 1),
    canGoPrev: currentPage > 1,
    canGoNext: currentPage < totalPages,
  };
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const canonicalPage = Math.max(1, page);
  const start = (canonicalPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
