export const getFieldError = (
    validationErrors: Record<string, string[]>,
    fieldName: string
): string | undefined => {
    const errors = validationErrors[fieldName];
    return errors && errors.length > 0 ? errors[0] : undefined;
};

export const hasFieldError = (
    validationErrors: Record<string, string[]>,
    fieldName: string
): boolean => {
    const errors = validationErrors[fieldName];
    return Boolean(errors && errors.length > 0);
};

export const getFieldErrors = (
    validationErrors: Record<string, string[]>,
    fieldName: string
): string[] => {
    return validationErrors[fieldName] || [];
};

export const hasAnyErrors = (
    validationErrors: Record<string, string[]>
): boolean => {
    return Object.keys(validationErrors).length > 0;
};