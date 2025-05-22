import styles from './HomePage.module.css'
import FooterComponent from '../../../components/FooterComponent/FooterComponent';
import { useNavigate } from 'react-router-dom';
import SectionFeatures from '../../../components/SectionFeatures/SectionFeatures';

const HomePage = () => {
    const navigate = useNavigate();

  return (
    <div>
        <section className={styles.hero}>
            <h1>Book Your Appointment Online</h1>
            <p>Accessible. Reliable. Fast healthcare booking at your fingertips.</p>
            <button className={styles.btnPrimary} onClick={() => navigate('/login')}>Book Now</button>
        </section>

        <SectionFeatures />

        <FooterComponent />
    </div>
  )
}

export default HomePage