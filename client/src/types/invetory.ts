export interface InventoryItemFormData {
    medicine?: string;
    category?: string;
    minLevel?: string;
    expirationDate?: string;
    location?: string;
}

// Base InventoryItem interface
export interface InventoryItem {
    id: string;
    itemName: string;
    category: 'Vaccine' | 'Medical Supply';
    quantityInStock: number;
    quantityUsed: number;
    expiryDate: string; // ISO date string
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

// Form data interface for creating/updating inventory items
export interface InventoryItemFormData {
    itemName?: string;
    category?: 'Vaccine' | 'Medical Supply';
    quantityInStock?: number;
    quantityUsed?: number;
    expiryDate?: string;
    // Note: The form has some fields that don't match the model
    // These are the form fields that need to be mapped to model fields
    medicine?: string; // maps to itemName
    minLevel?: number; // additional field not in model
    expirationDate?: string; // maps to expiryDate
    location?: string; // additional field not in model
}

// API Response interfaces
export interface InventoryItemResponse {
    success: boolean;
    message: string;
    data: InventoryItem;
}

export interface InventoryItemsResponse {
    success: boolean;
    message: string;
    data: {
        inventoryItems: InventoryItem[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    };
}

// Query parameters for fetching inventory items
export interface InventoryItemQueryParams {
    page?: number;
    limit?: number;
    category?: 'Vaccine' | 'Medical Supply';
    itemName?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

// Stock update interface
export interface StockUpdateData {
    quantityUsed: number;
    operation: 'use' | 'restock';
}

// Utility interfaces for specific operations
export interface LowStockParams {
    threshold?: number;
}

export interface ExpiringItemsParams {
    days?: number;
}

// Error response interface
export interface ApiError {
    success: false;
    message: string;
    error?: any;
}

// Combined response type
export type ApiResponse<T> = {
    success: true;
    message: string;
    data: T;
} | ApiError;