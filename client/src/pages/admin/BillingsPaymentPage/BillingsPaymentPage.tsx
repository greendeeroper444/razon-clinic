import React, { useState } from 'react'
import styles from './BillingsPaymentPage.module.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus, 
  faSearch, 
  faFilter, 
  faDownload,
  faCreditCard,
  faCheck,
  faClock,
  faExclamationTriangle,
  faEye,
  faEdit,
  faTimes,
  faUser,
  faCalendar,
  faReceipt,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';

const BillingsPaymentPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedBills, setSelectedBills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);

  const billingData = [
    {
      id: 1,
      appointmentId: 'APT-001',
      patientId: 'PAT-001',
      patientName: 'John Doe',
      amount: 150.00,
      paymentStatus: 'Paid',
      dateIssued: '2025-01-15',
      dueDate: '2025-02-15',
      service: 'General Consultation',
      description: 'Routine health checkup and consultation',
      paymentMethod: 'Credit Card',
      doctorName: 'Dr. Smith',
      diagnosis: 'General health assessment - all normal',
      notes: 'Patient is in good health. Recommended annual checkup.'
    },
    {
      id: 2,
      appointmentId: 'APT-002',
      patientId: 'PAT-002',
      patientName: 'Jane Smith',
      amount: 320.00,
      paymentStatus: 'Unpaid',
      dateIssued: '2025-01-20',
      dueDate: '2025-02-20',
      service: 'Dental Cleaning',
      description: 'Professional dental cleaning and examination',
      paymentMethod: 'Pending',
      doctorName: 'Dr. Johnson',
      diagnosis: 'Minor plaque buildup, overall dental health good',
      notes: 'Recommended bi-annual cleanings. Schedule next appointment in 6 months.'
    },
    {
      id: 3,
      appointmentId: 'APT-003',
      patientId: 'PAT-003',
      patientName: 'Mike Johnson',
      amount: 85.00,
      paymentStatus: 'Pending',
      dateIssued: '2025-01-25',
      dueDate: '2025-02-25',
      service: 'Follow-up Visit',
      description: 'Follow-up examination after treatment',
      paymentMethod: 'Insurance Pending',
      doctorName: 'Dr. Wilson',
      diagnosis: 'Recovery progressing well',
      notes: 'Patient showing good improvement. Next follow-up in 2 weeks.'
    },
    {
      id: 4,
      appointmentId: 'APT-004',
      patientId: 'PAT-004',
      patientName: 'Sarah Wilson',
      amount: 200.00,
      paymentStatus: 'Paid',
      dateIssued: '2025-01-10',
      dueDate: '2025-02-10',
      service: 'Physical Therapy',
      description: 'Physical therapy session for back pain',
      paymentMethod: 'Debit Card',
      doctorName: 'Dr. Brown',
      diagnosis: 'Lower back strain - improving',
      notes: 'Continue exercises at home. Schedule 2 more sessions.'
    },
    {
      id: 5,
      appointmentId: 'APT-005',
      patientId: 'PAT-005',
      patientName: 'David Brown',
      amount: 450.00,
      paymentStatus: 'Unpaid',
      dateIssued: '2025-01-30',
      dueDate: '2025-02-28',
      service: 'Surgery Consultation',
      description: 'Pre-operative consultation and assessment',
      paymentMethod: 'Pending',
      doctorName: 'Dr. Davis',
      diagnosis: 'Candidate for minor outpatient procedure',
      notes: 'Surgery scheduled for next month. Pre-op instructions provided.'
    }
  ];

  const handleNewBill = () => {
    console.log('Creating new bill...');
  };

  const handleProcessPayment = (billId) => {
    console.log('Processing payment for bill:', billId);
  };

  const handleViewDetails = (billId) => {
    const bill = billingData.find(b => b.id === billId);
    setSelectedBill(bill);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBill(null);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Paid':
        return faCheck;
      case 'Pending':
        return faClock;
      case 'Unpaid':
        return faExclamationTriangle;
      default:
        return faClock;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Paid':
        return styles.statusPaid;
      case 'Pending':
        return styles.statusPending;
      case 'Unpaid':
        return styles.statusUnpaid;
      default:
        return styles.statusPending;
    }
  };

  const filteredData = billingData.filter(bill => {
    const matchesSearch = bill.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.appointmentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || bill.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filteredData.reduce((sum, bill) => sum + bill.amount, 0);
  const paidAmount = filteredData.filter(bill => bill.paymentStatus === 'Paid').reduce((sum, bill) => sum + bill.amount, 0);
  const unpaidAmount = filteredData.filter(bill => bill.paymentStatus === 'Unpaid').reduce((sum, bill) => sum + bill.amount, 0);

  return (
    <div className={styles.content}>
      <div className={styles.contentHeader}>
        <h1 className={styles.contentTitle}>Billing & Payments</h1>
        <div className={styles.contentActions}>
          <button 
            type='button'
            className={styles.btnSecondary} 
            onClick={() => console.log('Export data')}
          >
            <FontAwesomeIcon icon={faDownload} />
            Export
          </button>
          <button 
            type='button'
            className={styles.btnPrimary} 
            onClick={handleNewBill}
          >
            <FontAwesomeIcon icon={faPlus} />
            New Bill
          </button>
        </div>
      </div>

      {/* summary cards */}
      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <div className={styles.cardIcon}>
            <FontAwesomeIcon icon={faCreditCard} />
          </div>
          <div className={styles.cardContent}>
            <h3>Total Revenue</h3>
            <p className={styles.cardAmount}>₱{totalAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={`${styles.cardIcon} ${styles.iconSuccess}`}>
            <FontAwesomeIcon icon={faCheck} />
          </div>
          <div className={styles.cardContent}>
            <h3>Paid Amount</h3>
            <p className={`${styles.cardAmount} ${styles.amountSuccess}`}>₱{paidAmount.toFixed(2)}</p>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={`${styles.cardIcon} ${styles.iconDanger}`}>
            <FontAwesomeIcon icon={faExclamationTriangle} />
          </div>
          <div className={styles.cardContent}>
            <h3>Outstanding</h3>
            <p className={`${styles.cardAmount} ${styles.amountDanger}`}>₱{unpaidAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* searcha nd filter section */}
      <div className={styles.filtersSection}>
        <div className={styles.searchBox}>
          <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by patient name or appointment ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <div className={styles.filterControls}>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>
      </div>

      {/* billoing tablee */}
      <div className={styles.tableContainer}>
        <table className={styles.billingTable}>
          <thead>
            <tr>
              <th>
                <input type="checkbox" className={styles.checkbox} />
              </th>
              <th>Appointment ID</th>
              <th>Patient</th>
              <th>Service</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date Issued</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((bill) => (
              <tr key={bill.id} className={styles.tableRow}>
                <td>
                  <input type="checkbox" className={styles.checkbox} />
                </td>
                <td className={styles.appointmentId}>{bill.appointmentId}</td>
                <td>
                  <div className={styles.patientInfo}>
                    <span className={styles.patientName}>{bill.patientName}</span>
                    <span className={styles.patientId}>{bill.patientId}</span>
                  </div>
                </td>
                <td>{bill.service}</td>
                <td className={styles.amount}>₱{bill.amount.toFixed(2)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(bill.paymentStatus)}`}>
                    <FontAwesomeIcon icon={getStatusIcon(bill.paymentStatus)} />
                    {bill.paymentStatus}
                  </span>
                </td>
                <td>{new Date(bill.dateIssued).toLocaleDateString()}</td>
                <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                <td>
                  <div className={styles.actions}>
                    <button 
                       className={`${styles.actionBtn} ${styles.view}`}
                      onClick={() => handleViewDetails(bill.id)}
                      title="View Details"
                    >
                      {/* <FontAwesomeIcon icon={faEye} /> */}View
                    </button>
                    {bill.paymentStatus !== 'Paid' && (
                      <button 
                        className={`${styles.btnIcon} ${styles.btnPay}`}
                        onClick={() => handleProcessPayment(bill.id)}
                        title="Process Payment"
                      >
                        <FontAwesomeIcon icon={faCreditCard} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className={styles.emptyState}>
          <FontAwesomeIcon icon={faCreditCard} className={styles.emptyIcon} />
          <h3>No billing records found</h3>
          <p>Try adjusting your search criteria or create a new bill.</p>
        </div>
      )}

      {/* Mmodal */}
      {showModal && selectedBill && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Billing Details</h2>
              <button className={styles.modalClose} onClick={closeModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalGrid}>
                <div className={styles.modalSection}>
                  <h3><FontAwesomeIcon icon={faUser} /> Patient Information</h3>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Patient Name:</span>
                    <span className={styles.value}>{selectedBill.patientName}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Patient ID:</span>
                    <span className={styles.value}>{selectedBill.patientId}</span>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3><FontAwesomeIcon icon={faCalendar} /> Appointment Details</h3>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Appointment ID:</span>
                    <span className={styles.value}>{selectedBill.appointmentId}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Service:</span>
                    <span className={styles.value}>{selectedBill.service}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Doctor:</span>
                    <span className={styles.value}>{selectedBill.doctorName}</span>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3><FontAwesomeIcon icon={faDollarSign} /> Payment Information</h3>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Amount:</span>
                    <span className={`${styles.value} ${styles.amount}`}>₱{selectedBill.amount.toFixed(2)}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.statusBadge} ${getStatusClass(selectedBill.paymentStatus)}`}>
                      <FontAwesomeIcon icon={getStatusIcon(selectedBill.paymentStatus)} />
                      {selectedBill.paymentStatus}
                    </span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Payment Method:</span>
                    <span className={styles.value}>{selectedBill.paymentMethod}</span>
                  </div>
                </div>

                <div className={styles.modalSection}>
                  <h3><FontAwesomeIcon icon={faReceipt} /> Additional Details</h3>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Date Issued:</span>
                    <span className={styles.value}>{new Date(selectedBill.dateIssued).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Due Date:</span>
                    <span className={styles.value}>{new Date(selectedBill.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Description:</span>
                    <span className={styles.value}>{selectedBill.description}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Diagnosis:</span>
                    <span className={styles.value}>{selectedBill.diagnosis}</span>
                  </div>
                  <div className={styles.infoGroup}>
                    <span className={styles.label}>Notes:</span>
                    <span className={styles.value}>{selectedBill.notes}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              {selectedBill.paymentStatus !== 'Paid' && (
                <button 
                  className={styles.btnPrimary}
                  onClick={() => handleProcessPayment(selectedBill.id)}
                >
                  <FontAwesomeIcon icon={faCreditCard} />
                  Process Payment
                </button>
              )}
              <button className={styles.btnOutline} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingsPaymentPage