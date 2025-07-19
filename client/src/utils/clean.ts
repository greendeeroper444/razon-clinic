export const cleanObject = <T extends Record<string, any>>(obj: T): Partial<T> => {
    const cleaned = { ...obj };
    Object.keys(cleaned).forEach(key => {
        if (cleaned[key] === undefined || cleaned[key] === '') {
        delete cleaned[key];
        }
    });
    return cleaned;
};