import { faUserInjured, faHeartbeat, faArchive, faUserPlus } from '@fortawesome/free-solid-svg-icons';

export const getPatientSummaryCards = (summaryStats: {
    total: number;
    active: number;
    archived: number;
    thisMonth: number;
}) => [
    {
        title: "Total Patients",
        icon: faUserInjured,
        iconColor: "blue",
        value: summaryStats.total,
        footer: "Registered in system"
    },
    {
        title: "Active Patients",
        icon: faHeartbeat,
        iconColor: "green",
        value: summaryStats.active,
        footer: "Currently active"
    },
    {
        title: "Archived Patients",
        icon: faArchive,
        iconColor: "orange",
        value: summaryStats.archived,
        footer: "Archived patients"
    },
    {
        title: "This Month",
        icon: faUserPlus,
        iconColor: "purple",
        value: summaryStats.thisMonth,
        footer: "Registered this month"
    }
];