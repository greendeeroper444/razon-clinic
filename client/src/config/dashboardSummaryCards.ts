import { CalendarDays, UserLock, AlertTriangle, Stethoscope } from 'lucide-react';
import { AppointmentResponse, InventoryItemFormData } from '../types';
import React from 'react';

export const getDashboardSummaryCards = (
    appointments: AppointmentResponse[],
    inventoryItems: InventoryItemFormData[]
) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    //calculate today's appointments
    const todaysAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.preferredDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime();
    });

    //calculate yesterday's appointments for comparison
    const yesterdaysAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.preferredDate);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === yesterday.getTime();
    });

    //calculate difference
    const difference = todaysAppointments.length - yesterdaysAppointments.length;
    const isPositive = difference > 0;
    
    //calculate patients waiting (pending appointments for today)
    const patientsWaiting = todaysAppointments.filter(
        apt => apt.status === 'Pending' || apt.status === 'Scheduled'
    ).length;

    //calculate average wait time (mock calculation based on appointment density)
    const avgWaitTime = patientsWaiting > 0 ? Math.ceil(patientsWaiting * 3) : 0;

    //calculate low stock items (stock <= 10)
    const lowStockItems = inventoryItems.filter(
        item => item.quantityInStock <= 10
    );

    //calculate critical items (stock <= 5)
    const criticalItems = inventoryItems.filter(
        item => item.quantityInStock <= 5
    );

    //mock available doctors
    const availableDoctors = 1;
    const specialists = 1;

    return [
        {
            title: "Today's Appointments",
            value: todaysAppointments.length.toString(),
            icon: React.createElement(CalendarDays),
            iconColor: 'purple',
            footer: difference !== 0 
                ? `${Math.abs(difference)} ${isPositive ? 'more' : 'less'} than yesterday`
                : 'Same as yesterday',
            footerType: difference !== 0 ? (isPositive ? 'positive' : 'negative') : 'neutral'
        },
        {
            title: 'Patients Waiting',
            value: patientsWaiting.toString(),
            icon: React.createElement(UserLock),
            iconColor: 'orange',
            footer: `Average wait time: ${avgWaitTime} min`,
            footerType: 'neutral'
        },
        {
            title: 'Low Stock Items',
            value: lowStockItems.length.toString(),
            icon: React.createElement(AlertTriangle),
            iconColor: 'red',
            footer: criticalItems.length > 0 
                ? `${criticalItems.length} critical items`
                : 'No critical items',
            footerType: criticalItems.length > 0 ? 'negative' : 'neutral'
        },
        {
            title: 'Available Doctors',
            value: availableDoctors.toString(),
            icon: React.createElement(Stethoscope),
            iconColor: 'green',
            footer: `${specialists} Specialist`,
            footerType: 'neutral'
        }
    ]
}