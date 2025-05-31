import React, { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import {
  HomePage,
  DashboardPage,
  AppointmentPage, 
  PatientsPage,
  InventoryPage,
  ArchivePage,
  LoginPage,
  SignupPage,
  AboutPage,
  ServicesPage,
  ContactPage,
  UserAppointmentPage,
  ForgotPasswordPage,
  AppointmentDetailsPage,
  UserAppointmentDetailsPage,
  MedicalRecordsPage,
  BillingsPaymentPage,
  TermsAndConditionPage
} from './pages'
import NavigationComponent from './components/NavigationComponent/NavigationComponent'
import SidebarComponent from './components/SidebarComponent/SidebarComponent'
import NavbarComponent from './components/NavbarComponent/NavbarComponent'
import styles from './pages/public/HomePage/HomePage.module.css'
import ModalComponent from './components/ModalComponent/ModalComponent'
import { ModalContext, useModal, OpenModalProps } from './hooks/hook'
import { toast, Toaster } from 'sonner'
import { AppointmentFormData, InventoryItemFormData, LayoutProps, MedicalRecordFormData, PatientFormData, RouteType } from './types'
import { addAppointment } from './pages/services/appoinmentService'
import { addInventoryItem } from './pages/services/inventoryItemService'
import { addPersonalPatient } from './pages/services/personalPatient'
import { PersonalPatientFormData } from './types/personalPatient'
import { addMedicalRecord } from './pages/services/medicalRecordService'

//define modal types to match what ModalComponent is expecting
type ModalType = 'appointment' | 'patient' | 'item' | 'medical';


//union type for all possible form data
type FormDataType = AppointmentFormData | PatientFormData | InventoryItemFormData;


const routes: RouteType[] = [
  //public routes
  { path: '/', component: HomePage, layout: 'user' },
  { path: '/login', component: LoginPage, layout: 'user' },
  { path: '/signup', component: SignupPage, layout: 'user' },
  { path: '/forgot-password', component: ForgotPasswordPage, layout: 'user' },
  { path: '/about', component: AboutPage, layout: 'user' },
  { path: '/services', component: ServicesPage, layout: 'user' },
  { path: '/contact', component: ContactPage, layout: 'user' },
  { path: '/terms-and-conditions', component: TermsAndConditionPage, layout: 'user' },

  //admin routes
  { path: '/admin/dashboard', component: DashboardPage, layout: 'admin' },
  { path: '/admin/appointments', component: AppointmentPage, layout: 'admin' },
    { path: '/admin/appointments/details/:appointmentId', component: AppointmentDetailsPage, layout: 'admin' },
  { path: '/admin/patients', component: PatientsPage, layout: 'admin' },
  { path: '/admin/inventory', component: InventoryPage, layout: 'admin' },
  { path: '/admin/archives', component: ArchivePage, layout: 'admin' },
  { path: '/admin/medical-records', component: MedicalRecordsPage, layout: 'admin' },
  { path: '/admin/billings-payment', component: BillingsPaymentPage, layout: 'admin' },

  //user routees
  { path: '/user/appointments', component: UserAppointmentPage, layout: 'user' },
      { path: '/user/appointments/details/:appointmentId', component: UserAppointmentDetailsPage, layout: 'user' },
  
]

function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('appointment');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  //check for mobile view on initial load and window resize
  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth <= 768) {
        setSidebarCollapsed(true);
      }
    };
    
    //initial check
    checkMobile();
    
    //listen for resize events
    window.addEventListener('resize', checkMobile);
    
    //cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  //modal functions
  const openModal = (type: ModalType): void => {
    setModalType(type);
    setIsModalOpen(true);
  }

  const closeModal = (): void => setIsModalOpen(false);

  const handleSubmit = async (formData: FormDataType): Promise<void> => {
    console.log('Form submitted:', formData);
    console.log('Form type:', modalType);
    
    //handle the data based on modal type
    switch (modalType) {
      case 'appointment':
        try {
          await addAppointment(formData as AppointmentFormData);
          
          toast.success('Appointment added successfully');
          window.dispatchEvent(new CustomEvent('appointment-refresh'));
        } catch (error) {
          console.error('Error adding appointment:', error);
        }
        break;
      case 'patient':
        await addPersonalPatient(formData as PersonalPatientFormData);
          
        toast.success('Personal patient added successfully');
        window.dispatchEvent(new CustomEvent('patient-refresh'));
        break;
      case 'item':
          await addInventoryItem(formData as InventoryItemFormData);
          
          toast.success('Inventory item added successfully');
          window.dispatchEvent(new CustomEvent('inventory-refresh'));
        break;
      case 'medical':
        try {
          await addMedicalRecord(formData as MedicalRecordFormData);
          
          toast.success('Medical record added successfully');
          window.dispatchEvent(new CustomEvent('medical-refresh'));
        } catch (error) {
          console.error('Error adding medical:', error);
        }
        break;
      default:
        break;
    }
    closeModal();
  }
  
  //handle sidebar toggle
  const toggleSidebar = (): void => {
    setSidebarCollapsed(!sidebarCollapsed);
  }

  return (
    <BrowserRouter>
      <ModalContext.Provider value={{ openModal }}>
        <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <Toaster position="top-center" richColors />
          <PageTitle />
          <Routes>
            {
              routes.map((route) => (
                <Route 
                  key={route.path}
                  path={route.path} 
                  element={
                    <Layout 
                      type={route.layout}
                      sidebarCollapsed={sidebarCollapsed}
                      toggleSidebar={toggleSidebar}
                    >
                      <route.component openModal={openModal} />
                    </Layout>
                  } 
                />
              ))
            }
          </Routes>
          <ModalComponent
            isOpen={isModalOpen}
            onClose={closeModal}
            modalType={modalType}
            onSubmit={handleSubmit}
          />
        </div>
      </ModalContext.Provider>
    </BrowserRouter>
  )
}

//dynamic Layout component that handles both admin and user layouts
function Layout({children, type, sidebarCollapsed, toggleSidebar}: LayoutProps) {
  const {openModal} = useModal();
  
  //clone children to pass openModal prop for backward compatibility
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      //using type assertion to fix the cloneElement typing error
      return React.cloneElement(child, {openModal} as OpenModalProps);
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
              <header className={styles.header}>
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

//component that sets page title based on current route
function PageTitle() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname === '/' ? ' - home' : ` - ${location.pathname.substring(1)}`;
    document.title = `Razon Pediatric Clinic${path}`;
  }, [location.pathname]);

  return null;
}

export default App;