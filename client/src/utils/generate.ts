//generate available time slots (8:00 AM to 5:00 PM)
export const generateTimeSlots = () => {
    const slots = [];
    
    //generate AM slots (8:00 AM to 11:00 AM)
    for (let hour = 8; hour <= 11; hour++) {
        slots.push(`${hour}:00 AM`);
    }
    
    slots.push(`12:00 PM`); //noon

    //generate PM slots (1:00 PM to 5:00 PM)
    for (let hour = 1; hour <= 5; hour++) {
        slots.push(`${hour}:00 PM`);
    }
    
    return slots;
};