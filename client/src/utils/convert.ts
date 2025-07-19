export const convertTo24Hour = (time: string): string => {
    if (!time.includes(' ')) return time;
    
    const [timeStr, period] = time.split(' ');
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    
    if (period === 'AM' && hour === 12) hour = 0;
    else if (period === 'PM' && hour !== 12) hour += 12;
    
    return `${hour.toString().padStart(2, '0')}:${minuteStr}`;
};


//convert 24-hour format to 12-hour format for comparison
export  const convertTo12HourFormat = (time24: string) => {
    if (!time24 || !time24.includes(':')) return time24;
    
    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr);
    const minute = minuteStr || '00';
    
    if (hour === 0) {
        return `12:${minute} AM`;
    } else if (hour < 12) {
        return `${hour}:${minute} AM`;
    } else if (hour === 12) {
        return `12:${minute} PM`;
    } else {
        return `${hour - 12}:${minute} PM`;
    }
};

//convert 12-hour format to 24-hour format for comparison
export const convertTo24HourFormat = (time12: string) => {
    if (!time12 || !time12.includes(' ')) return time12;
    
    const [timeStr, period] = time12.split(' ');
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr);
    const minute = minuteStr || '00';
    
    if (period === 'AM') {
        if (hour === 12) hour = 0;
    } else {
        if (hour !== 12) hour += 12;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minute}`;
};


