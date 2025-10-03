import { Users, UserCheck, Archive, UserPlus } from 'lucide-react';

export const getUserSummaryCards = (summaryStats: {
    total: number;
    active: number;
    archived: number;
    thisMonth: number;
}) => [
    {
        title: "Total Users",
        icon: Users,
        iconColor: "blue",
        value: summaryStats.total,
        footer: "Registered in system"
    },
    {
        title: "Active Users",
        icon: UserCheck,
        iconColor: "green",
        value: summaryStats.active,
        footer: "Currently active"
    },
    {
        title: "Archived Users",
        icon: Archive,
        iconColor: "orange",
        value: summaryStats.archived,
        footer: "Archived users"
    },
    {
        title: "This Month",
        icon: UserPlus,
        iconColor: "purple",
        value: summaryStats.thisMonth,
        footer: "Registered this month"
    }
];