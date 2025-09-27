import { ChangeEvent } from "react";

export interface InventoryItemFormProps {
    formData: InventoryItemFormData;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    isRestockMode?: boolean;
    isAddQuantityMode?: boolean;
}

export interface InventoryItem {
    id: string;
    itemName: string;
    category: 'Vaccine' | 'Medical Supply';
    price: number;
    quantityInStock: number;
    quantityUsed: number;
    expiryDate: string;
    createdAt: string;
    updatedAt: string;
}


export interface InventoryItemFormData {
    id?: string;
    itemName?: string;
    category: 'Vaccine' | 'Medical Supply' | string;
    price: number;
    quantityInStock: number;
    quantityUsed?: number;
    expiryDate: string;
    medicine?: string;
    minLevel?: number;
    expirationDate?: string;
    location?: string;
    createdAt?: string;
}


export interface InventoryItemResponse extends InventoryItemFormData {
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


export interface InventoryItemQueryParams {
    page?: number;
    limit?: number;
    category?: 'Vaccine' | 'Medical Supply';
    itemName?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface StockUpdateData {
    quantityUsed: number;
    operation: 'use' | 'restock';
}


export interface LowStockParams {
    threshold?: number;
}

export interface ExpiringItemsParams {
    days?: number;
}

export interface ApiError {
    success: false;
    message: string;
    error?: any;
}


export type ApiResponse<T> = {
    success: true;
    message: string;
    data: T;
} | ApiError;