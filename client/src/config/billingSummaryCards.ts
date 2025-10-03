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
        value: `₱${summaryStats.totalRevenue.toFixed(2)}`,
        footer: "All time revenue"
    },
    {
        title: "Paid Amount",
        icon: Check,
        iconColor: "green",
        value: `₱${summaryStats.paidAmount.toFixed(2)}`,
        footer: "Successfully collected"
    },
    {
        title: "Outstanding",
        icon: AlertTriangle,
        iconColor: "orange",
        value: `₱${summaryStats.unpaidAmount.toFixed(2)}`,
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