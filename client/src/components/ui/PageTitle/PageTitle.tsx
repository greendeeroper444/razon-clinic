import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function PageTitle() {
    const location = useLocation();

    useEffect(() => {
        //format the path for the title
        const path = location.pathname === '/' ? ' - home' : ` - ${location.pathname.substring(1)}`;
        document.title = `Razon Pediatric Clinic${path}`;
    }, [location.pathname]);

    //thiscomponent doesn't render anything
    return null
}

export default PageTitle