export interface Pagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
    isUnlimited: boolean;
    nextPage: number | null;
    previousPage: number | null;
    remainingItems: number;
    searchTerm: string | null;
}