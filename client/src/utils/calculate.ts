
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
