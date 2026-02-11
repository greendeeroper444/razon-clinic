import axios from './httpClient'
import API_BASE_URL from '../ApiBaseUrl'

export interface DashboardStats {
    totalMedicalRecords: {
        count: number;
        label: string;
    };
    totalAppointments: {
        count: number;
        label: string;
        breakdown: {
            pending: number;
            confirmed: number;
            completed: number;
            cancelled: number;
        };
    };
    totalSales: {
        totalRevenue: number;
        totalTransactions: number;
        averageTransaction: number;
        label: string;
        paymentBreakdown: {
            paid: { count: number; amount: number };
            unpaid: { count: number; amount: number };
            pending: { count: number; amount: number };
        };
    };
    totalPatients: {
        count: number;
        activeCount: number;
        archivedCount: number;
        label: string;
    };
    lowStockItems: {
        count: number;
        items: LowStockItem[];
    };
    dateRange: {
        startDate: string | null;
        endDate: string | null;
    };
}

export interface LowStockItem {
    id: string;
    itemName: string;
    category: string;
    quantityInStock: number;
    quantityUsed: number;
    quantityRemaining: number;
    price: number;
    expiryDate: string;
    isExpired: boolean;
    isExpiringSoon: boolean;
    status: 'Critical' | 'Very Low' | 'Low' | 'Expiring Soon' | 'Expired';
}

export interface DashboardStatsParams {
    startDate?: string;
    endDate?: string;
}

export interface RecentActivity {
    recentMedicalRecords: Array<{
        id: string;
        personalDetails: {
            fullName: string;
        };
        dateRecorded: string;
        diagnosis?: string;
    }>;
    recentAppointments: Array<{
        id: string;
        patientName: string;
        appointmentDate: string;
        status: string;
    }>;
    recentBillings: Array<{
        id: string;
        patientName: string;
        amount: number;
        paymentStatus: string;
        createdAt: string;
    }>;
}

export interface MonthlyTrends {
    medicalRecordsTrend: Array<{
        _id: { year: number; month: number };
        count: number;
    }>;
    salesTrend: Array<{
        _id: { year: number; month: number };
        revenue: number;
        count: number;
    }>;
}

export const getDashboardStats = async (params: DashboardStatsParams = {}) => {
    try {
        const response = await axios.get(
            `${API_BASE_URL}/api/dashboard/getDashboardStats`,
            { params }
        );
        
        return response.data;
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        if (axios.isAxiosError(error)) {
            throw error.response?.data || error.message;
        }
        throw error;
    }
};