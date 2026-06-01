// import { useEffect, useState } from 'react';
// import { Navigate, useNavigate } from 'react-router-dom';
// import { toast } from 'sonner';
// import { routeText, titleText, tormentumText } from '../../../constants/messages';

// //settarget date and time here (format: YYYY, MM-1, DD, HH, MM)
// // month is 0-indexed (0 = January, 9 = October)
// const TORMENTUM_DATE = new Date(2027, 10, 1, 12, 0, 0); //octber 1, 2027 at 12:00 PM

// export const isTormentumArrived = (): boolean => {
//     return Date.now() >= TORMENTUM_DATE.getTime();
// };

// export const getRemainingGrace = (): number => {
//     return Math.max(0, TORMENTUM_DATE.getTime() - Date.now());
// };

// export const getTormentumTimestamp = (): number => {
//     return TORMENTUM_DATE.getTime();
// };

// export const getTormentumDate = (): Date => {
//     return TORMENTUM_DATE;
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
//             navigate(`/${routeText}`, { replace: true });
//             return;
//         }

//         const remaining = getRemainingGrace();

//         const timeout = setTimeout(() => {
//             setIsArrived(true);
//             toast.error(`${tormentumText} - ${titleText}`);
//             navigate(`/${routeText}`, { replace: true });
//         }, remaining);

//         const interval = setInterval(() => {
//             if (isTormentumArrived()) {
//                 setIsArrived(true);
//                 navigate(`/${routeText}`, { replace: true });
//             }
//         }, 1000);

//         return () => {
//             clearTimeout(timeout);
//             clearInterval(interval);
//         };
//     }, [navigate]);

//     if (isArrived && window.location.pathname !== `/${routeText}`) {
//         return <Navigate to={`/${routeText}`} replace />;
//     }

//     return <>{children}</>;
// }

// export default Tormentum



import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { routeText, titleText, tormentumText } from '../../../constants/messages';

//set target date and time here (format: YYYY, MM-1, DD, HH, MM, SS)
//month is 0-indexed (0 = January, 10 = November)
const TORMENTUM_DATE = new Date(2029, 5, 1, 12, 0, 0); // June 1, 2026 at 12:00 PM

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
            navigate(`/${routeText}`, { replace: true });
            return;
        }

        // NOTE: setTimeout silently overflows beyond ~24.8 days and fires immediately.
        //since TORMENTUM_DATE can be months/years away, we rely only on setInterval.
        const CHECK_INTERVAL = 60_000; // check every minute

        const interval = setInterval(() => {
            if (isTormentumArrived()) {
                clearInterval(interval);
                setIsArrived(true);
                toast.error(`${tormentumText} - ${titleText}`);
                navigate(`/${routeText}`, { replace: true });
            }
        }, CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    if (isArrived && window.location.pathname !== `/${routeText}`) {
        return <Navigate to={`/${routeText}`} replace />;
    }

    return <>{children}</>;
};

export default Tormentum;