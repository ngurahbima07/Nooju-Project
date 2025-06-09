import { LineChart } from '@mui/x-charts/LineChart';
import { Box } from '@mui/material';
import MainCard from 'components/MainCard';

export default function WeeklyBookingTrend() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const bookings = [25, 40, 30, 50, 45, 90, 80];
  const guests = [10, 20, 28, 30, 32, 48, 40];

  return (
    <MainCard title="Trend Booking Mingguan" content={false}>
      <Box sx={{ px: 2, pt: 2 }}>
        <LineChart
          height={320}
          xAxis={[{ data: days, scaleType: 'point' }]}
          series={[
            {
              label: 'Bookings',
              data: bookings,
              area: true,
              curve: 'monotone',
              color: '#42a5f5'
            },
            {
              label: 'Guests',
              data: guests,
              area: true,
              curve: 'monotone',
              color: '#1e88e5'
            }
          ]}
          grid={{ horizontal: true }}
          margin={{ top: 20, bottom: 50, left: 40, right: 20 }}
          sx={{
            '& .MuiLineElement-root': { strokeWidth: 2.5 },
            '& .MuiMarkElement-root': { r: 0 },
            '& .MuiChartsAxis-tickLabel': { fontSize: 12 },
            '& .MuiChartsLegend-series': { flexDirection: 'row-reverse' },
            '& .MuiChartsLegend-root': { justifyContent: 'center', mt: 2 }
          }}
        />
      </Box>
    </MainCard>
  );
}
