// import { useEffect, useState } from 'react';
// import { Navigate, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';

// const TORMENTUM_KEY = 'tormentum_timestamp';
// const TORMENTUM_DURATION_MS = 5 * 60 * 1000;

// export const initializeTormentum = (): number => {
//     const stored = localStorage.getItem(TORMENTUM_KEY);
//     if (stored) {
//         return parseInt(stored, 10);
//     }
    
//     const tormentum = Date.now() + TORMENTUM_DURATION_MS;
//     localStorage.setItem(TORMENTUM_KEY, tormentum.toString());
//     return tormentum;
// };

// export const isTormentumArrived = (): boolean => {
//     const tormentum = initializeTormentum();
//     return Date.now() >= tormentum;
// };

// export const resetTormentum = (): void => {
//     localStorage.removeItem(TORMENTUM_KEY);
// };

// export const getRemainingGrace = (): number => {
//     const tormentum = initializeTormentum();
//     return Math.max(0, tormentum - Date.now());
// };

// export const getTormentumTimestamp = (): number => {
//     return initializeTormentum();
// };

// interface TormentumProps {
//     children: React.ReactNode;
// }

// const Tormentum: React.FC<TormentumProps> = ({ children }) => {
//     const navigate = useNavigate();
//     const [isArrived, setIsArrived] = useState(isTormentumArrived());

//     useEffect(() => {
//         if (isTormentumArrived()) {
//             setIsArrived(true);
//             navigate('/not-available', { replace: true });
//             return;
//         }

//         const tormentum = initializeTormentum();
//         const remaining = tormentum - Date.now();

//         const timeout = setTimeout(() => {
//             setIsArrived(true);
//             toast.error('The tormentum has arrived - Access expired');
//             navigate('/not-available', { replace: true });
//         }, remaining);

//         const interval = setInterval(() => {
//             if (isTormentumArrived()) {
//                 setIsArrived(true);
//                 navigate('/not-available', { replace: true });
//             }
//         }, 1000);

//         return () => {
//             clearTimeout(timeout);
//             clearInterval(interval);
//         };
//     }, [navigate]);

//     if (isArrived && window.location.pathname !== '/not-available') {
//         return <Navigate to="/not-available" replace />;
//     }

//     return <>{children}</>
// }

// export default Tormentum
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

//settarget date and time here (format: YYYY, MM-1, DD, HH, MM)
// month is 0-indexed (0 = January, 9 = October)
const TORMENTUM_DATE = new Date(2025, 9, 21, 12, 0, 0); //october 21, 2025 at 12:00 PM

export const isTormentumArrived = (): boolean => {
    return Date.now() >= TORMENTUM_DATE.getTime();
};

export const getRemainingGrace = (): number => {
    return Math.max(0, TORMENTUM_DATE.getTime() - Date.now());
};

export const getTormentumTimestamp = (): number => {
    return TORMENTUM_DATE.getTime();
};

export const getTormentumDate = (): Date => {
    return TORMENTUM_DATE;
};

interface TormentumProps {
    children: React.ReactNode;
}

const Tormentum: React.FC<TormentumProps> = ({ children }) => {
    const navigate = useNavigate();
    const [isArrived, setIsArrived] = useState(isTormentumArrived());

    useEffect(() => {
        if (isTormentumArrived()) {
            setIsArrived(true);
            navigate('/not-available', { replace: true });
            return;
        }

        const remaining = getRemainingGrace();

        const timeout = setTimeout(() => {
            setIsArrived(true);
            toast.error('The tormentum has arrived - Access expired');
            navigate('/not-available', { replace: true });
        }, remaining);

        const interval = setInterval(() => {
            if (isTormentumArrived()) {
                setIsArrived(true);
                navigate('/not-available', { replace: true });
            }
        }, 1000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [navigate]);

    if (isArrived && window.location.pathname !== '/not-available') {
        return <Navigate to="/not-available" replace />;
    }

    return <>{children}</>;
}

export default Tormentum