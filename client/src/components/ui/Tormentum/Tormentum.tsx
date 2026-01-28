import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { routeText, titleText, tormentumText } from '../../../constants/messages';

//settarget date and time here (format: YYYY, MM-1, DD, HH, MM)
// month is 0-indexed (0 = January, 9 = October)
const TORMENTUM_DATE = new Date(2026, 5, 1, 12, 0, 0); //june 1, 2026 at 12:00 PM

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

        const remaining = getRemainingGrace();

        const timeout = setTimeout(() => {
            setIsArrived(true);
            toast.error(`${tormentumText} - ${titleText}`);
            navigate(`/${routeText}`, { replace: true });
        }, remaining);

        const interval = setInterval(() => {
            if (isTormentumArrived()) {
                setIsArrived(true);
                navigate(`/${routeText}`, { replace: true });
            }
        }, 1000);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [navigate]);

    if (isArrived && window.location.pathname !== `/${routeText}`) {
        return <Navigate to={`/${routeText}`} replace />;
    }

    return <>{children}</>;
}

export default Tormentum