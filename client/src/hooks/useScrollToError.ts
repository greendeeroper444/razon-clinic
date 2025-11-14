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

    useEffect(() => {
        if (validationErrors && Object.keys(validationErrors).length > 0) {
            //find first field with error based on fieldOrder
            const firstErrorField = fieldOrder.find((field) => validationErrors[field]);

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
    }, [validationErrors, fieldOrder, scrollBehavior, scrollBlock, focusDelay]);

    return { fieldRefs }
}

export default useScrollToError