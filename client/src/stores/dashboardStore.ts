import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
    DashboardStats, 
    DashboardStatsParams,
    LowStockItem,
    RecentActivity,
    MonthlyTrends,
    getDashboardStats,
} from '../services/dashboardService';

export interface DashboardState {
    dashboardStats: DashboardStats | null;
    lowStockItems: LowStockItem[];
    recentActivity: RecentActivity | null;
    monthlyTrends: MonthlyTrends | null;
    
    loading: boolean;
    statsLoading: boolean;
    lowStockLoading: boolean;
    activityLoading: boolean;
    trendsLoading: boolean;
    
    error: string | null;
    statsError: string | null;
    lowStockError: string | null;
    activityError: string | null;
    trendsError: string | null;
    
    fetchDashboardStats: (params?: DashboardStatsParams) => Promise<void>;
    fetchLowStockInventory: (threshold?: number) => Promise<void>;
    fetchRecentActivity: (limit?: number) => Promise<void>;
    fetchMonthlyTrends: (months?: number) => Promise<void>;
    
    fetchMedicalRecordsCount: (params?: DashboardStatsParams) => Promise<void>;
    fetchAppointmentsCount: (params?: DashboardStatsParams) => Promise<void>;
    fetchSalesTotal: (params?: DashboardStatsParams) => Promise<void>;
    fetchPatientsCount: () => Promise<void>;
    
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearErrors: () => void;
    refreshAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
    devtools(
        (set, get) => ({
            dashboardStats: null,
            lowStockItems: [],
            recentActivity: null,
            monthlyTrends: null,
            
            loading: false,
            statsLoading: false,
            lowStockLoading: false,
            activityLoading: false,
            trendsLoading: false,
            
            error: null,
            statsError: null,
            lowStockError: null,
            activityError: null,
            trendsError: null,

            fetchDashboardStats: async (params: DashboardStatsParams = {}) => {
                try {
                    set({ 
                        statsLoading: true, 
                        loading: true,
                        statsError: null 
                    });

                    const response = await getDashboardStats(params);
                    
                    if (response.success) {
                        set({ 
                            dashboardStats: response.data,
                            lowStockItems: response.data.lowStockItems.items || [],
                            statsLoading: false,
                            loading: false,
                            statsError: null
                        });
                    } else {
                        set({ 
                            statsError: response.message || 'Failed to fetch dashboard stats',
                            statsLoading: false,
                            loading: false
                        });
                    }
                } catch (error) {
                    console.error('Error fetching dashboard stats:', error);
                    set({ 
                        statsError: 'An error occurred while fetching dashboard statistics',
                        statsLoading: false,
                        loading: false
                    });
                }
            },

            refreshAll: async () => {
                try {
                    set({ loading: true, error: null });

                    await Promise.all([
                        get().fetchDashboardStats(),
                        get().fetchRecentActivity(),
                        get().fetchMonthlyTrends()
                    ]);

                    set({ loading: false });
                } catch (error) {
                    console.error('Error refreshing dashboard:', error);
                    set({ 
                        error: 'Failed to refresh dashboard data',
                        loading: false 
                    });
                }
            },

            /**
             * Utility actions
             */
            setLoading: (loading: boolean) => set({ loading }),
            
            setError: (error: string | null) => set({ error }),
            
            clearErrors: () => set({ 
                error: null,
                statsError: null,
                lowStockError: null,
                activityError: null,
                trendsError: null
            })
        }),
        {
            name: 'dashboard-store'
        }
    )
);