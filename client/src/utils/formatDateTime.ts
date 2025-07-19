export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

export  const formatTime = (timeString: string) => {
    //check if time already includes AM/PM
    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
        return timeString;
    }

    //parse 24-hour format (HH:MM) to 12-hour format with AM/PM
    const [hours, minutes] = timeString.split(':');
    const hour24 = parseInt(hours, 10);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    
    return `${hour12}:${minutes} ${ampm}`;
};


//format birthdate
export const formatBirthdate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
};


 //calculate age from birthdate
export const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
};



 //helper function to format date for input field
export const formatDateForInput = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

//helper function to format date for display
export const formatDateForDisplay = (dateString: string | Date): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


 //function to calculate age from date of birth
export const calculateAge2 = (dateOfBirth: string): string => {
    if (!dateOfBirth) return '0 months old';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    
    //adjust if birthday hasn't occurred this year
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }
    
    //adjust if the day hasn't occurred this month
    if (today.getDate() < birthDate.getDate()) {
        months--;
    }
    
    //return appropriate format based on age
    if (years === 0) {
        if (months === 0) {
            return 'Less than 1 month old';
        } else if (months === 1) {
            return '1 month old';
        } else {
            return `${months} months old`;
        }
    } else if (years === 1) {
        return '1 year old';
    } else {
        return `${years} years old`;
    }
};
