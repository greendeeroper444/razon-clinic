export const getFirstLetterOfFirstAndLastName = (fullName: string | undefined): string => {
    if (!fullName) return '';
    
    //split the name into words
    const nameParts = fullName.split(' ');
    
    //if there's only one word, return its first letter
    if (nameParts.length === 1) {
        return nameParts[0].charAt(0).toUpperCase();
    }
    
    //get first letter of first word and first letter of last word
    const firstInitial = nameParts[0].charAt(0).toUpperCase();
    const lastInitial = nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    
    return `${firstInitial}${lastInitial}`;
};

export const getFirstAndLastName = (fullName: string | undefined): string => {
    if (!fullName) return '';
    
    //split the name into words
    const nameParts = fullName.split(' ');
    
    //if there's only one word, return just that word
    if (nameParts.length === 1) {
        return nameParts[0];
    }
    
    //return first and last word
    const firstName = nameParts[0];
    const lastName = nameParts[nameParts.length - 1];
    
    return `${firstName} ${lastName}`;
};