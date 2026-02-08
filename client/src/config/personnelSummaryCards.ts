import { Users, UserCog, Stethoscope, UserPlus } from 'lucide-react';

export const getPersonnelSummaryCards = (stats: {
    total: number;
    doctors: number;
    staff: number;
    recentlyAdded: number;
}) => [
    {
        title: 'Total Personnel',
        value: stats.total,
        footer: 'All registered personnel',
        icon: Users,
        iconColor: 'blue'
    },
    {
        title: 'Doctors',
        value: stats.doctors,
        footer: 'Medical professionals',
        icon: Stethoscope,
        iconColor: 'purple'
    },
    {
        title: 'Staff',
        value: stats.staff,
        footer: 'Support staff members',
        icon: UserCog,
        iconColor: 'orange'
    },
    {
        title: 'Recently Added',
        value: stats.recentlyAdded,
        footer: 'Added in last 30 days',
        icon: UserPlus,
        iconColor: 'green'
    }
];