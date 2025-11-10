interface ValidationError {
    field: string;
    message: string;
}

interface ErrorResponse {
    message: string;
    error: Error;
    validationErrors: ValidationError[] | null;
}

export const handleApiError = (error: any, defaultMessage = "An error occurred"): ErrorResponse => {
    let message = defaultMessage;
    let validationErrors: ValidationError[] | null = null;

    const errors = error.response?.data?.errors || error.errors;

    if (errors && Array.isArray(errors) && errors.length > 0) {
        validationErrors = errors.map((err: any) => ({
            field: err.field || err.param || 'unknown',
            message: err.message || err.msg || 'Invalid value'
        }));
        
        const uniqueMessages = [...new Set(errors.map((err: any) => err.message || err.msg))];
        
        if (uniqueMessages.length === 1) {
            message = uniqueMessages[0];
        } else if (uniqueMessages.length <= 3) {
            message = uniqueMessages.join(', ');
        } else {
            message = `${uniqueMessages.slice(0, 3).join(', ')} (and ${uniqueMessages.length - 3} more)`;
        }
    } 
    else if (error.response?.data?.message) {
        message = String(error.response.data.message);
    }
    else if (error.message) {
        message = String(error.message);
    }

    if (typeof message !== 'string' || !message.trim()) {
        message = defaultMessage;
    }

    const enhancedError = new Error(message) as Error & { 
        validationErrors?: ValidationError[] | null;
        originalError?: any;
    };
    enhancedError.validationErrors = validationErrors;
    enhancedError.originalError = error;

    return { 
        message, 
        error: enhancedError, 
        validationErrors 
    }
}