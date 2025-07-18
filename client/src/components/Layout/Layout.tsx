import React from 'react'
import '../../App.css';
import { LayoutProps } from '../../types';
import { OpenModalProps, useModal } from '../../hooks/hook';
import SidebarComponent from '../SidebarComponent/SidebarComponent';
import NavbarComponent from '../NavbarComponent/NavbarComponent';
import NavigationComponent from '../NavigationComponent/NavigationComponent';

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
                    <SidebarComponent
                        sidebarCollapsed={sidebarCollapsed}
                        toggleSidebar={toggleSidebar}
                    />
                </div>
            )
        }
        
        {
            type === 'admin' ? (
                <div className='main-content-admin'>
                    <NavbarComponent
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
                        <NavigationComponent />
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