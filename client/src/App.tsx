import { useEffect, useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ModalContext } from './hooks/hook'
import { toast, Toaster } from 'sonner'
import { AppointmentFormData, InventoryItemFormData, MedicalRecordFormData, PatientFormData, FormDataType, ModalType, BillingFormData } from './types'
import { Layout, Modal, PageTitle, ProtectedRoute, RootRedirect, Tormentum} from './components'
import { addAppointment, addBilling, addInventoryItem, addMedicalRecord, addPatient } from './services'
import { routes } from './routes'
import './services/httpClient'
import { useAuthenticationStore } from './stores'
import { isTormentumArrived } from './components/ui/Tormentum/Tormentum'
import { PaginaNonPraesto } from './pages'
import { routeText } from './constants/messages'


function App() {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalType, setModalType] = useState<ModalType>('appointment');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  
  //initialize authentication on app load
  const initializeAuth = useAuthenticationStore(state => state.initializeAuth);

  useEffect(() => {
    // initializeAuth()
    if (!isTormentumArrived()) {
      initializeAuth();
    }
  }, [initializeAuth])
  

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
        } catch (error) {
          console.error('Error adding appointment:', error);
        }
        break;
      case 'patient':
        await addPatient(formData as PatientFormData);
          
        toast.success('Personal patient added successfully');
        break;
      case 'item':
          await addInventoryItem(formData as InventoryItemFormData);
          
          toast.success('Inventory item added successfully');
        break;
      case 'medical':
        try {
          await addMedicalRecord(formData as MedicalRecordFormData);
          
          toast.success('Medical record added successfully');
        } catch (error) {
          console.error('Error adding medical:', error);
        }
        break;
      case 'billing':
        try {
          await addBilling(formData as BillingFormData);
          
          toast.success('Billings added successfully');
        } catch (error) {
          console.error('Error adding billing:', error);
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
            <Route 
              path={`/${routeText}` }
              element={
                <Layout
                  type="public"
                  sidebarCollapsed={sidebarCollapsed}
                  toggleSidebar={toggleSidebar}
                  hideNavigation={true}
                >
                  {
                    PaginaNonPraesto ? (
                      <PaginaNonPraesto />
                    ) : (
                      <div>Not Available</div>
                    )
                  }
                </Layout>
              } 
            />

            <Route path="*" element={
              <Tormentum>
                <Routes>
                  <Route path="/" element={<RootRedirect />} />
                  
                  {
                    routes.filter(route => route.layout === 'admin').map((route) => (
                      <Route 
                        key={route.path}
                        path={route.path} 
                        element={
                          <ProtectedRoute allowedUserTypes={['admin']}>
                            <Layout
                              type={route.layout}
                              sidebarCollapsed={sidebarCollapsed}
                              toggleSidebar={toggleSidebar}
                            >
                              <route.component openModal={openModal} />
                            </Layout>
                          </ProtectedRoute>
                        } 
                      />
                    ))
                  }

                  {
                    routes.filter(route => route.layout === 'user').map((route) => (
                      <Route 
                        key={route.path}
                        path={route.path} 
                        element={
                          <ProtectedRoute allowedUserTypes={['user']}>
                            <Layout
                              type={route.layout}
                              sidebarCollapsed={sidebarCollapsed}
                              toggleSidebar={toggleSidebar}
                            >
                              <route.component openModal={openModal} />
                            </Layout>
                          </ProtectedRoute>
                        } 
                      />
                    ))
                  }

                  {
                    routes.filter(route => route.layout === 'public' && route.path !== '/' && route.path !== `/${routeText}`).map((route) => (
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
              </Tormentum>
            } />
          </Routes>
          <Modal
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