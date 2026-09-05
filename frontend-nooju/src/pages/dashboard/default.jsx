import { useEffect, useState } from 'react';
import { Grid, Typography, Stack, Box, useTheme, CircularProgress } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import BedIcon from '@mui/icons-material/Bed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { BarChart } from '@mui/x-charts/BarChart';
import MainCard from 'components/MainCard';

import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import LogoutIcon from '@mui/icons-material/Logout';
import BuildIcon from '@mui/icons-material/Build';
import { Accordion, AccordionSummary, AccordionDetails, List, ListItem, ListItemIcon, ListItemText, Avatar } from '@mui/material';
import BookingByPlatformChart from './BookingByPlatformChart';
import WeeklyBookingTrend from './WeeklyBookingTrend';

import RecentBookingsCard from 'components/dashboard/RecentBookingsCard';
import api from 'api/axios';

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

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

export default function DashboardQuickAnalytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    api
      .get('/dashboard/summary')
      .then((response) => {
        if (isMounted) setSummary(response.data);
      })
      .catch((err) => {
        console.error('Gagal memuat ringkasan dashboard:', err);
        if (isMounted) setError('Gagal memuat data dashboard');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  const checkinsToday = summary?.checkins_today || [];
  const checkoutsToday = summary?.checkouts_today || [];
  const maintenanceToday = summary?.maintenance_today || [];
  const monthlyChart = summary?.monthly_chart || { labels: [], data: [] };

  return (
    <Grid container spacing={3}>
      {error && (
        <Grid item xs={12}>
          <Typography color="error">{error}</Typography>
        </Grid>
      )}

      {/* Stat Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<HotelIcon />} title="Booking Hari Ini" value={summary?.bookings_today ?? 0} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          icon={<BedIcon />}
          title="Kamar Tersedia"
          value={`${summary?.rooms_available_today ?? 0} / ${summary?.total_rooms ?? 0}`}
          color="success"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<AttachMoneyIcon />} title="Pendapatan Hari Ini" value={formatCurrency(summary?.revenue_today)} color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard icon={<CalendarMonthIcon />} title="Booking Bulan Ini" value={summary?.bookings_this_month ?? 0} color="info" />
      </Grid>

      {/* Booking Bulanan Bar Chart */}
      <Grid item xs={12} md={8}>
        <MainCard title="Statistik Booking Bulanan" content={false}>
          <BarChart
            height={300}
            xAxis={[{ data: monthlyChart.labels, scaleType: 'band' }]}
            series={[{ data: monthlyChart.data, label: 'Booking' }]}
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
                Check-In Hari Ini ({checkinsToday.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Stack spacing={1.5}>
                {checkinsToday.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada check-in hari ini.
                  </Typography>
                )}
                {checkinsToday.map((item, idx) => (
                  <Stack key={idx} direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <NotificationsActiveIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">
                      Tamu: {item.guest} &ndash; {item.room}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Check-Out */}
          <Accordion sx={{ boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Check-Out Hari Ini ({checkoutsToday.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Stack spacing={1.5}>
                {checkoutsToday.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada check-out hari ini.
                  </Typography>
                )}
                {checkoutsToday.map((item, idx) => (
                  <Stack key={idx} direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                      <LogoutIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">
                      Tamu: {item.guest} &ndash; {item.room}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Maintenance */}
          <Accordion sx={{ boxShadow: 'none' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1" fontWeight={600}>
                Maintenance ({maintenanceToday.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Stack spacing={1.5}>
                {maintenanceToday.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    Tidak ada kamar maintenance hari ini.
                  </Typography>
                )}
                {maintenanceToday.map((item, idx) => (
                  <Stack key={idx} direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                      <BuildIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="body2">
                      {item.room} sedang maintenance{item.reason ? ` (${item.reason})` : ''}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </MainCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <WeeklyBookingTrend
          labels={summary?.weekly_trend?.labels}
          bookings={summary?.weekly_trend?.bookings}
          guests={summary?.weekly_trend?.guests}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <BookingByPlatformChart data={summary?.room_type_distribution} />
      </Grid>
      <Grid item xs={12} md={6} lg={12}>
        <RecentBookingsCard />
      </Grid>
    </Grid>
  );
}
