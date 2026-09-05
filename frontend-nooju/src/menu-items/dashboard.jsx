import { DashboardOutlined, CalendarOutlined, ProfileOutlined, FileTextOutlined, TagsOutlined } from '@ant-design/icons';

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
    },
    {
      id: 'booking-management',
      title: 'Booking Management',
      type: 'item',
      url: '/booking-management',
      icon: <ProfileOutlined />
    },
    {
      id: 'reports',
      title: 'Laporan',
      type: 'item',
      url: '/reports',
      icon: <FileTextOutlined />
    },
    {
      id: 'smart-pricing',
      title: 'Smart Pricing',
      type: 'item',
      url: '/smart-pricing',
      icon: <TagsOutlined />
    }
  ]
};

export default dashboard;
