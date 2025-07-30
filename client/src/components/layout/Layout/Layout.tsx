import React from 'react'
import '../../../App.css';
import { LayoutProps } from '../../../types';
import { OpenModalProps, useModal } from '../../../hooks/hook';
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import Navigation from '../Navigation/Navigation';

function Layout({children, type, sidebarCollapsed, toggleSidebar}: LayoutProps) {
    const { openModal } = useModal();
    
    //clone children to pass openModal prop for backward compatibility
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            //using type assertion to fix the cloneElement typing error
            return React.cloneElement(child, { openModal } as OpenModalProps);
        }
        return child;
    });
  
  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {
            type === 'admin' && (
                <div className='sidebar'>
                    <Sidebar
                        sidebarCollapsed={sidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                    />
                </div>
            )
        }
        
        {
            type === 'admin' ? (
                <div className='main-content-admin'>
                    <Navbar
                        sidebarCollapsed={sidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                    />
                    <div className='content-area'>
                        {childrenWithProps} 
                    </div>
                </div>
            ) : (
                <div className='main-content-public'>
                    <header>
                        <Navigation />
                    </header>

                    <div className='content-area'>
                        {childrenWithProps} 
                    </div>
                </div>
            )
        }
    </div>
  )
}

export default Layout