import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { getTransactions, getTransactionStats, getTransactionsByItemId, TransactionParams } from '../services';

export interface Transaction {
    id: string;
    inventoryItem: string | { id: string; itemName: string; category: string; quantityInStock: number };
    itemName: string;
    category: string;
    transactionType: 'IN' | 'OUT';
    quantity: number;
    previousStock: number;
    newStock: number;
    reason: 'restock' | 'consumption' | 'adjustment' | 'initial';
    notes: string;
    createdAt: string;
    updatedAt: string;
}

export interface TransactionStats {
    totalIN: number;
    totalOUT: number;
    countIN: number;
    countOUT: number;
    recentActivity: number;
}

interface TransactionPagination {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startIndex: number;
    endIndex: number;
    nextPage: number | null;
    previousPage: number | null;
    remainingItems: number;
}

interface TransactionState {
    transactions: Transaction[];
    stats: TransactionStats | null;
    loading: boolean;
    statsLoading: boolean;
    error: string | null;
    pagination: TransactionPagination;
    filters: TransactionParams;

    fetchTransactions: (params?: TransactionParams) => Promise<void>;
    fetchTransactionsByItemId: (inventoryItemId: string, params?: TransactionParams) => Promise<void>;
    fetchTransactionStats: () => Promise<void>;
    setFilters: (filters: TransactionParams) => void;
    resetFilters: () => void;
}

const defaultPagination: TransactionPagination = {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
    startIndex: 1,
    endIndex: 0,
    nextPage: null,
    previousPage: null,
    remainingItems: 0
};

const defaultFilters: TransactionParams = {
    page: 1,
    limit: 10,
    search: '',
    transactionType: '',
    reason: '',
    startDate: '',
    endDate: ''
};

export const useTransactionStore = create<TransactionState>()(
    devtools(
        (set, get) => ({
            transactions: [],
            stats: null,
            loading: false,
            statsLoading: false,
            error: null,
            pagination: defaultPagination,
            filters: defaultFilters,

            fetchTransactions: async (params = {}) => {
                try {
                    set({ loading: true, error: null });
                    const mergedParams = { ...get().filters, ...params };
                    const response = await getTransactions(mergedParams);
                    const { transactions, pagination } = response.data;

                    set({
                        transactions: transactions || [],
                        pagination: {
                            currentPage: pagination.currentPage || 1,
                            totalPages: pagination.totalPages || 1,
                            totalItems: pagination.totalItems || 0,
                            itemsPerPage: pagination.itemsPerPage || 10,
                            hasNextPage: pagination.hasNextPage || false,
                            hasPreviousPage: pagination.hasPreviousPage || false,
                            startIndex: pagination.startIndex || 1,
                            endIndex: pagination.endIndex || 0,
                            nextPage: pagination.nextPage ?? null,
                            previousPage: pagination.previousPage ?? null,
                            remainingItems: pagination.remainingItems || 0
                        },
                        loading: false
                    });
                } catch (error) {
                    console.error('Error fetching transactions:', error);
                    set({ error: 'Failed to fetch transactions', loading: false });
                }
            },

            fetchTransactionsByItemId: async (inventoryItemId, params = {}) => {
                try {
                    set({ loading: true, error: null });
                    const response = await getTransactionsByItemId(inventoryItemId, { ...get().filters, ...params });
                    const { transactions, pagination } = response.data;

                    set({
                        transactions: transactions || [],
                        pagination: {
                            currentPage: pagination.currentPage || 1,
                            totalPages: pagination.totalPages || 1,
                            totalItems: pagination.totalItems || 0,
                            itemsPerPage: pagination.itemsPerPage || 10,
                            hasNextPage: pagination.hasNextPage || false,
                            hasPreviousPage: pagination.hasPreviousPage || false,
                            startIndex: pagination.startIndex || 1,
                            endIndex: pagination.endIndex || 0,
                            nextPage: pagination.nextPage ?? null,
                            previousPage: pagination.previousPage ?? null,
                            remainingItems: pagination.remainingItems || 0
                        },
                        loading: false
                    });
                } catch (error) {
                    console.error('Error fetching item transactions:', error);
                    set({ error: 'Failed to fetch item transactions', loading: false });
                }
            },

            fetchTransactionStats: async () => {
                try {
                    set({ statsLoading: true });
                    const response = await getTransactionStats();
                    set({ stats: response.data, statsLoading: false });
                } catch (error) {
                    console.error('Error fetching transaction stats:', error);
                    set({ statsLoading: false });
                }
            },

            setFilters: (filters) => {
                set(state => ({ filters: { ...state.filters, ...filters } }));
            },

            resetFilters: () => {
                set({ filters: defaultFilters });
            }
        }),
        { name: 'transaction-store' }
    )
);