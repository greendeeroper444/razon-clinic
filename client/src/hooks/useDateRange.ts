import { useState, useCallback } from 'react';
import { DateRangeType, DateRangeParams, getDateRangeParams, isValidCustomDateRange } from '../utils/dateRange';

export interface UseDateRangeReturn {
    dateRange: DateRangeType;
    customFromDate: string;
    customToDate: string;
    setDateRange: (range: DateRangeType) => void;
    setCustomFromDate: (date: string) => void;
    setCustomToDate: (date: string) => void;
    getDateParams: () => DateRangeParams;
    isCustomRangeValid: () => boolean;
    resetDates: () => void;
}

export const useDateRange = (initialRange: DateRangeType = 'all'): UseDateRangeReturn => {
    const [dateRange, setDateRange] = useState<DateRangeType>(initialRange);
    const [customFromDate, setCustomFromDate] = useState('');
    const [customToDate, setCustomToDate] = useState('');

    const getDateParams = useCallback((): DateRangeParams => {
        return getDateRangeParams(dateRange, customFromDate, customToDate);
    }, [dateRange, customFromDate, customToDate]);

    const isCustomRangeValid = useCallback((): boolean => {
        if (dateRange !== 'custom') return true;
        return isValidCustomDateRange(customFromDate, customToDate);
    }, [dateRange, customFromDate, customToDate]);

    
    const resetDates = useCallback(() => {
        setDateRange('all');
        setCustomFromDate('');
        setCustomToDate('');
    }, []);

    return {
        dateRange,
        customFromDate,
        customToDate,
        setDateRange,
        setCustomFromDate,
        setCustomToDate,
        getDateParams,
        isCustomRangeValid,
        resetDates
    };
};