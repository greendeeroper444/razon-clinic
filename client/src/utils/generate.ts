// //generate available time slots (8:00 AM to 5:00 PM) with 15 min interval
export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    let hour = 8;
    let minute = 0;

    while (hour < 17 || (hour === 17 && minute === 0)) {
        const hour12 = hour % 12 === 0 ? 12 : hour % 12;
        const period = hour < 12 ? 'AM' : 'PM';
        const time = `${hour12}:${minute.toString().padStart(2, '0')} ${period}`;
        slots.push(time);

        minute += 15;
        if (minute === 60) {
            minute = 0;
            hour++;
        }
    }

    return slots;
};

//1 hour interval
// export const generateTimeSlots = () => {
//     const slots = [];
    
//     //generate AM slots (8:00 AM to 11:00 AM)
//     for (let hour = 8; hour <= 11; hour++) {
//         slots.push(`${hour}:00 AM`);
//     }
    
//     slots.push(`12:00 PM`); //noon

//     //generate PM slots (1:00 PM to 5:00 PM)
//     for (let hour = 1; hour <= 5; hour++) {
//         slots.push(`${hour}:00 PM`);
//     }
    
//     return slots;
// };



//generate initials from full name
export const generateInitials = (firstName: string | any): string => {
    if (!firstName || typeof firstName !== 'string') {
        return 'NA';
    }
    
    return firstName
    .trim() //remove leading/trailing whitespace
    .split(' ')
    .map(name => name.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};


export const generate20Only = (text: string | any): string => {
    if (!text) return "";
    
    if (text.length > 20) {
        return text.slice(0, 20) + "...";
    }

    return text;
};
