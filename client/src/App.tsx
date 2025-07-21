import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
  TermsAndConditionPage,
  CalendarDateDetailsPage,
  GrowthMilestonePage
} from './pages'
import { ModalContext } from './hooks/hook'
import { toast, Toaster } from 'sonner'
import { AppointmentFormData, InventoryItemFormData, MedicalRecordFormData, RouteType, PersonalPatientFormData, FormDataType, ModalType } from './types'
import { addMedicalRecord } from './pages/services/medicalRecordService'
import { addAppointment } from './pages/services/appoinmentService'
import { addInventoryItem } from './pages/services/inventoryItemService'
import { addPersonalPatient } from './pages/services/personalPatient'
import { Layout, ModalComponent, PageTitle } from './components'



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
  { path: '/admin/calendar-date-details', component: CalendarDateDetailsPage, layout: 'admin' },
  { path: '/admin/growth-milestone', component: GrowthMilestonePage, layout: 'admin' },

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

  const handleSubmit = async (formData: FormDataType | string): Promise<void> => {

    //handle delete operations (when formData is a string ID)
    if (typeof formData === 'string') {
      //handle delete logic here
      console.log('Deleting item with ID:', formData);
      toast.success('Item deleted successfully');
      closeModal();
      return;
    }
    
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

export default App;