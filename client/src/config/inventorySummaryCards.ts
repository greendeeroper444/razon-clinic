import { faPills, faExclamationTriangle, faClock, faCube } from '@fortawesome/free-solid-svg-icons';

export const getInventorySummaryCards = (summaryStats: {
    total: number;
    lowStock: number;
    expiring: number;
    recentlyAdded: number;
}) => [
    {
        title: "Total Medicines",
        icon: faPills,
        iconColor: "blue",
        value: summaryStats.total,
        footer: "Total inventory items"
    },
    {
        title: "Low Stock Items",
        icon: faExclamationTriangle,
        iconColor: "red",
        value: summaryStats.lowStock,
        footer: "Need restocking"
    },
    {
        title: "Expiring Soon",
        icon: faClock,
        iconColor: "red",
        value: summaryStats.expiring,
        footer: "Within 30 days"
    },
    {
        title: "Recently Added",
        icon: faCube,
        iconColor: "green",
        value: summaryStats.recentlyAdded,
        footer: "This month"
    }
];