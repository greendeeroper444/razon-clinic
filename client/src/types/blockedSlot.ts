export interface BlockedTimeSlotFormData {
    id?: string;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    reason: 'Doctor Unavailable' | 'Holiday' | 'Maintenance' | 'Emergency' | 'Meeting' | 'Training' | 'Other';
    customReason?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: {
        id: string;
        name: string;
        email: string;
    };
}

export interface BlockedTimeSlotPagination {
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

export interface BlockedTimeSlotFetchParams {
    page?: number;
    limit?: number;
    search?: string;
    reason?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: 'createdAt' | 'startDate' | 'endDate' | 'startTime' | 'endTime' | 'reason';
    sortOrder?: 'asc' | 'desc';
}

export interface CheckBlockedResponse {
    isBlocked: boolean;
    reason?: string;
    customReason?: string;
}

export interface BlockedTimeSlotDeleteData {
    id: string;
    dateRange: string;
    timeRange: string;
    reason: string;
    itemType: 'Blocked Time Slot';
    startDate: string;
    endDate: string;
}

export interface BlockedTimeSlotSummaryStats {
    totalActiveBlocks: number;
    upcomingBlocksCount: number;
    blocksByReason: Array<{
        _id: string;
        count: number;
    }>;
}

export type BlockedTimeSlotOperationType = 'create' | 'update' | 'delete' | null;

export interface BlockedTimeSlotValidationErrors {
    [key: string]: string;
}