import React, { useState, useEffect, useRef } from 'react'
import LoadingSpinner from './LoadingSpinner/LoadingSpinner';
import DotsLoader from './DotsLoader/DotsLoader';
import SkeletonLoader from './SkeletonLoader/SkeletonLoader';
import ProgressLoader from './ProgressLoader/ProgressLoader';
import BackdropLoader from './BackdropLoader/BackdropLoader';

export type LoadingType = 'spinner' | 'dots' | 'skeleton' | 'progress' | 'backdrop';

export interface LoadingProps {
    message?: string;
    type?: LoadingType;
    show?: boolean;
    children?: React.ReactNode;
    delay?: number;
    minDuration?: number;
    rows?: number; 
}

const Loading: React.FC<LoadingProps> = ({
    message = 'Loading...',
    type = 'spinner',
    show = true,
    children,
    delay = 0,
    minDuration = 0,
    rows = 5
}) => {
    const [shouldShow, setShouldShow] = useState(delay === 0 && show);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        let delayTimer: ReturnType<typeof setTimeout>;
        let minDurationTimer: ReturnType<typeof setTimeout>;

        if (show) {
            //if there's a delay, wait before showing
            if (delay > 0) {
                delayTimer = setTimeout(() => {
                    setShouldShow(true);
                    startTimeRef.current = Date.now();
                }, delay);
            } else {
                setShouldShow(true);
                startTimeRef.current = Date.now();
            }
        } else {
            //when hiding, check if we need to enforce minimum duration
            if (minDuration > 0 && startTimeRef.current) {
                const elapsed = Date.now() - startTimeRef.current;
                const remaining = minDuration - elapsed;
                
                if (remaining > 0) {
                    minDurationTimer = setTimeout(() => {
                        setShouldShow(false);
                        startTimeRef.current = null;
                    }, remaining);
                } else {
                    setShouldShow(false);
                    startTimeRef.current = null;
                }
            } else {
                setShouldShow(false);
                startTimeRef.current = null;
            }
        }

        return () => {
            if (delayTimer) clearTimeout(delayTimer);
            if (minDurationTimer) clearTimeout(minDurationTimer);
        };
    }, [show, delay, minDuration]);

    if (!shouldShow) return null;

    const loadingComponents = {
        spinner: () => <LoadingSpinner message={message} />,
        dots: () => <DotsLoader message={message} />,
        skeleton: () => <SkeletonLoader message={message} rows={rows} />,
        progress: () => <ProgressLoader message={message} />,
        backdrop: () => <BackdropLoader message={message} />
    };

    //for backdrop mode, render children with overlay
    if (type === 'backdrop') {
        return (
            <>
                {children}
                <BackdropLoader message={message} />
            </>
        );
    }

    //for other modes, render the loading component directly
    return loadingComponents[type]?.() || <LoadingSpinner message={message} />
}

export default Loading;