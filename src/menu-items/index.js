import dashboard from './dashboard';
import pages from './pages';
import utilities from './utilities';
import other from './other';
import company from './company';
import basicMasters from './basicMasters';
import RolesAndResponsibilities from './RolesAndResponsibilities';

const loginUserRole = localStorage.getItem('ROLE');

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  // items: [dashboard, pages, utilities, other, company, basicMasters]
  // items: [dashboard, ...(loginUserRole === 'PRODUCT_ADMIN' ? [company] : [basicMasters])]
  items: [dashboard, company, basicMasters, RolesAndResponsibilities]
};

export default menuItems;
