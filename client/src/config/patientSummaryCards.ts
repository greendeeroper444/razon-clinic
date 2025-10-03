import { Activity, HeartPulse, Archive, UserPlus } from 'lucide-react';

export const getPatientSummaryCards = (summaryStats: {
    total: number;
    active: number;
    archived: number;
    thisMonth: number;
}) => [
    {
        title: "Total Patients",
        icon: Activity,
        iconColor: "blue",
        value: summaryStats.total,
        footer: "Registered in system"
    },
    {
        title: "Active Patients",
        icon: HeartPulse,
        iconColor: "green",
        value: summaryStats.active,
        footer: "Currently active"
    },
    // {
    //     title: "Archived Patients",
    //     icon: Archive,
    //     iconColor: "orange",
    //     value: summaryStats.archived,
    //     footer: "Archived patients"
    // },
    {
        title: "This Month",
        icon: UserPlus,
        iconColor: "purple",
        value: summaryStats.thisMonth,
        footer: "Registered this month"
    }
];