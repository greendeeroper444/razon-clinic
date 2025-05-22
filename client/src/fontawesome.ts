// fontawesome.ts - Configure FontAwesome library
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faHouseMedical,
  faGaugeHigh,
  faCalendarCheck,
  faHospitalUser,
  faPills,
  faRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library so you can use them without importing individually
library.add(
  faHouseMedical,
  faGaugeHigh,
  faCalendarCheck,
  faHospitalUser,
  faPills,
  faRightFromBracket
);