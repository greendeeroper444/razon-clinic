import { useEffect, useRef } from 'react';

interface UseScrollToErrorOptions {
    validationErrors: Record<string, string[]>;
    fieldOrder: string[];
    scrollBehavior?: ScrollBehavior;
    scrollBlock?: ScrollLogicalPosition;
    focusDelay?: number;
}

export const useScrollToError = ({
    validationErrors,
    fieldOrder,
    scrollBehavior = 'smooth',
    scrollBlock = 'center',
    focusDelay = 300,
}: UseScrollToErrorOptions) => {
    const fieldRefs = useRef<{[key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;}>({});
    const previousErrorsRef = useRef<Record<string, string[]>>({});

    useEffect(() => {
        const hadNoErrors = Object.keys(previousErrorsRef.current).length === 0;
        const hasErrorsNow = validationErrors && Object.keys(validationErrors).length > 0;
        
        const isNewErrorBatch = hadNoErrors && hasErrorsNow;

        if (isNewErrorBatch) {
            const firstErrorField = fieldOrder.find((field) => {
                const errors = validationErrors[field];
                return errors && errors.length > 0;
            });

            if (firstErrorField && fieldRefs.current[firstErrorField]) {
                const element = fieldRefs.current[firstErrorField];

                //scroll into view
                element?.scrollIntoView({
                    behavior: scrollBehavior,
                    block: scrollBlock,
                });

                setTimeout(() => {
                    element?.focus();
                }, focusDelay);
            }
        }

        previousErrorsRef.current = validationErrors || {};
    }, [validationErrors, fieldOrder, scrollBehavior, scrollBlock, focusDelay]);

    return { fieldRefs };
};

export default useScrollToError;