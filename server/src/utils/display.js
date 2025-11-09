export const escapeCSV = (value) => {
    if (value === null || value === undefined || value === '') {
        return '""';
    }
    const stringValue = String(value).trim();
    
    return `"${stringValue.replace(/"/g, '""')}"`;
}

export const formatDate = (date) => {
    if (!date) return '';
    
    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch (error) {
        return '';
    }
}

export const formatTime = (datetime) => {
    if (!datetime) return '';
    
    try {
        const dateObj = new Date(datetime);
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return '';
    }
}

export const formatTimeOnly = (time) => {
    if (!time) return '';
    
    if (typeof time === 'string' && time.includes(':')) {
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    try {
        const dateObj = new Date(time);
        if (isNaN(dateObj.getTime())) return '';
        
        return dateObj.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    } catch (error) {
        return '';
    }
}