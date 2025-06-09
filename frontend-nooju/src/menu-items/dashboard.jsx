import { DashboardOutlined, CalendarOutlined } from '@ant-design/icons';

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: <DashboardOutlined />,
      breadcrumbs: false
    },
    {
      id: 'booking-chart',
      title: 'Booking Chart',
      type: 'item',
      url: 'booking-chart',
      icon: <CalendarOutlined /> // ✅ jangan terpisah lagi
    }
  ]
};

export default dashboard;
