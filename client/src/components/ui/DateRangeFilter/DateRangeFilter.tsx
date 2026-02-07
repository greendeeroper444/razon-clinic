import React from 'react';
import styles from './DateRangeFilter.module.css';
import { DATE_RANGE_OPTIONS, DateRangeType } from '../../../utils';

interface DateRangeFilterProps {
    dateRange: DateRangeType;
    customFromDate: string;
    customToDate: string;
    onDateRangeChange: (range: DateRangeType) => void;
    onCustomFromDateChange: (date: string) => void;
    onCustomToDateChange: (date: string) => void;
    onApplyCustomRange?: () => void;
    disabled?: boolean;
    className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    dateRange,
    customFromDate,
    customToDate,
    onDateRangeChange,
    onCustomFromDateChange,
    onCustomToDateChange,
    onApplyCustomRange,
    disabled = false,
    className = ''
}) => {
    const handleApply = () => {
        if (onApplyCustomRange && customFromDate && customToDate) {
            onApplyCustomRange();
        }
    };

  return (
    <div className={`${styles.dateRangeFilter} ${className}`}>
        <div className={styles.selectControl}>
            <label htmlFor="dateRange">Date range:</label>
            <select
                id="dateRange"
                value={dateRange}
                onChange={(e) => onDateRangeChange(e.target.value as DateRangeType)}
                disabled={disabled}
                className={styles.select}
            >
                {
                    DATE_RANGE_OPTIONS.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))
                }

            </select>
        </div>

        {
            dateRange === 'custom' && (
                <div className={styles.customDateRange}>
                    <input
                        type="date"
                        value={customFromDate}
                        onChange={(e) => onCustomFromDateChange(e.target.value)}
                        className={styles.dateInput}
                        placeholder="From"
                        disabled={disabled}
                    />
                    <span className={styles.separator}>to</span>
                    <input
                        type="date"
                        value={customToDate}
                        onChange={(e) => onCustomToDateChange(e.target.value)}
                        className={styles.dateInput}
                        placeholder="To"
                        disabled={disabled}
                    />
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={!customFromDate || !customToDate || disabled}
                        className={styles.applyBtn}
                    >
                        Apply
                    </button>
                </div>
            )
        }
    </div>
  )
}