import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import BookingChart from 'pages/Bookingchart';
import AuthGuard from './AuthGuard';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const BookingManagement = Loadable(lazy(() => import('pages/BookingManagement')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// render - reports
const Reports = Loadable(lazy(() => import('pages/Reports')));

// render - smart pricing
const SmartPricingSettings = Loadable(lazy(() => import('pages/SmartPricingSettings')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthGuard>
      <DashboardLayout />
    </AuthGuard>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },

    {
      path: 'booking-chart',
      element: <BookingChart />
    },
    {
      path: 'booking-management',
      element: <BookingManagement />
    },
    {
      path: 'reports',
      element: <Reports />
    },
    {
      path: 'smart-pricing',
      element: <SmartPricingSettings />
    }
  ]
};

export default MainRoutes;
