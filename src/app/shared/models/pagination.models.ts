export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}
export interface PaginationViewModel {
  startItem: number;
  endItem: number;
  totalPages: number;
  pages: number[];
  canGoPrev: boolean;
  canGoNext: boolean;
}
