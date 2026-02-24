import { CreditCard, Check, AlertTriangle, TrendingUp } from 'lucide-react';

export const getBillingSummaryCards = (summaryStats: {
    totalRevenue: number;
    paidAmount: number;
    unpaidAmount: number;
    totalBillings: number;
}) => [
    {
        title: "Total Revenue",
        icon: CreditCard,
        iconColor: "blue",
        value: `₱${summaryStats.totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        footer: "All time revenue"
    },
    {
        title: "Paid Amount",
        icon: Check,
        iconColor: "green",
        value: `₱${summaryStats.paidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        footer: "Successfully collected"
    },
    {
        title: "Outstanding",
        icon: AlertTriangle,
        iconColor: "orange",
        value: `₱${summaryStats.unpaidAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        footer: "Pending payments"
    },
    {
        title: "Total Billings",
        icon: TrendingUp,
        iconColor: "purple",
        value: summaryStats.totalBillings,
        footer: "Total transactions"
    }
];