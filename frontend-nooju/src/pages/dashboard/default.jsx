import { Grid, Typography, Stack, Box, useTheme } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import BedIcon from '@mui/icons-material/Bed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import MainCard from 'components/MainCard';

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LogoutIcon from '@mui/icons-material/Logout';
import BuildIcon from '@mui/icons-material/Build';
import { Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import BookingListTable from './BookingListTable';
import BookingByPlatformChart from './BookingByPlatformChart';
import WeeklyBookingTrend from './WeeklyBookingTrend';

const StatCard = ({ icon, title, value, color }) => {
  const theme = useTheme();

  return (
    <MainCard sx={{ p: 2 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box
          sx={{
            p: 1.5,
            bgcolor: theme.palette[color].light,
            color: theme.palette[color].main,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="textSecondary">
            {title}
          </Typography>
          <Typography variant="h5" sx={{ mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </MainCard>
  );
};

export default function DashboardQuickAnalytics() {
  return (
    <Grid container spacing={3}>
      {/* Stat Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<HotelIcon />} title="Booking Hari Ini" value={14} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<BedIcon />} title="Kamar Tersedia" value={27} color="success" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<AttachMoneyIcon />} title="Pendapatan Hari Ini" value="Rp 5.200.000" color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<CalendarMonthIcon />} title="Booking Bulan Ini" value={112} color="info" />
      </Grid>

      {/* Booking Bulanan Bar Chart */}
      <Grid item xs={12} md={8}>
        <MainCard title="Statistik Booking Bulanan" content={false}>
          <BarChart
            height={300}
            xAxis={[{ data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], scaleType: 'band' }]}
            series={[{ data: [25, 40, 33, 45, 50, 60], label: 'Booking' }]}
          />
        </MainCard>
      </Grid>

      {/* notifikasi */}
      <Grid item xs={12} md={4}>
        <MainCard title="Notifikasi Hari Ini">
          {/* Check-In */}
          <Accordion defaultExpanded sx={{ boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Check-In Hari Ini
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <NotificationsActiveIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2">Tamu: John Doe – Room 101</Typography>
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <NotificationsActiveIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="body2">Tamu: Sarah Smith – Room 202</Typography>
                </Stack>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Check-Out */}
          <Accordion sx={{ boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Check-Out Hari Ini
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                  <LogoutIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2">Tamu: Michael – Room 305</Typography>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Maintenance */}
          <Accordion sx={{ boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Maintenance
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                  <BuildIcon fontSize="small" />
                </Avatar>
                <Typography variant="body2">Room 404 sedang maintenance</Typography>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <WeeklyBookingTrend />
      </Grid>

      <Grid item xs={12} md={6}>
        <BookingByPlatformChart />
      </Grid>

      <Grid item xs={12} md={12}>
        <BookingListTable />
      </Grid>
    </Grid>
  );
}
