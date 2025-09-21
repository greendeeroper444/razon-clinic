import { Pill, AlertTriangle, Clock, Package } from 'lucide-react';

export const getInventorySummaryCards = (summaryStats: {
    total: number;
    lowStock: number;
    expiring: number;
    recentlyAdded: number;
}) => [
    {
        title: "Total Medicines",
        icon: Pill,
        iconColor: "blue",
        value: summaryStats.total,
        footer: "Total inventory items"
    },
    {
        title: "Low Stock Items",
        icon: AlertTriangle,
        iconColor: "red",
        value: summaryStats.lowStock,
        footer: "Need restocking"
    },
    {
        title: "Expiring Soon",
        icon: Clock,
        iconColor: "red",
        value: summaryStats.expiring,
        footer: "Within 30 days"
    },
    {
        title: "Recently Added",
        icon: Package,
        iconColor: "green",
        value: summaryStats.recentlyAdded,
        footer: "This month"
    }
];