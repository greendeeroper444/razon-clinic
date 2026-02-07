export type DateRangeType = 
    | 'all' 
    | 'today' 
    | 'yesterday' 
    | 'last7days' 
    | 'last30days' 
    | 'thisMonth' 
    | 'lastMonth' 
    | 'thisYear' 
    | 'custom';

export interface DateRangeParams {
    fromDate: string;
    toDate: string;
}

export interface DateRangeOption {
    value: DateRangeType;
    label: string;
}

export const DATE_RANGE_OPTIONS: DateRangeOption[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'yesterday', label: 'Yesterday' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
];

export const getDateRangeParams = (
    rangeType: DateRangeType,
    customFromDate?: string,
    customToDate?: string
): DateRangeParams => {
    const today = new Date();
    let fromDate = '';
    let toDate = '';

    switch (rangeType) {
        case 'today':
            fromDate = today.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;

        case 'yesterday': {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            fromDate = yesterday.toISOString().split('T')[0];
            toDate = yesterday.toISOString().split('T')[0];
            break;
        }

        case 'last7days': {
            const last7Days = new Date(today);
            last7Days.setDate(last7Days.getDate() - 7);
            fromDate = last7Days.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        }

        case 'last30days': {
            const last30Days = new Date(today);
            last30Days.setDate(last30Days.getDate() - 30);
            fromDate = last30Days.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        }

        case 'thisMonth': {
            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            fromDate = firstDayOfMonth.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        }

        case 'lastMonth': {
            const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            fromDate = firstDayOfLastMonth.toISOString().split('T')[0];
            toDate = lastDayOfLastMonth.toISOString().split('T')[0];
            break;
        }

        case 'thisYear': {
            const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
            fromDate = firstDayOfYear.toISOString().split('T')[0];
            toDate = today.toISOString().split('T')[0];
            break;
        }

        case 'custom':
            fromDate = customFromDate || '';
            toDate = customToDate || '';
            break;

        case 'all':
        default:
            break;
    }

    return { fromDate, toDate };
};

export const formatDateToISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

export const getTodayISO = (): string => {
    return formatDateToISO(new Date());
};


export const isValidCustomDateRange = (fromDate: string, toDate: string): boolean => {
    if (!fromDate || !toDate) return false;
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    
    return from <= to;
};