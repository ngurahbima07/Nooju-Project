import PropTypes from 'prop-types';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box } from '@mui/material';
import MainCard from 'components/MainCard';

export default function WeeklyBookingTrend({ labels, bookings, guests }) {
  const days = labels && labels.length ? labels : ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  const bookingData = bookings && bookings.length ? bookings : [0, 0, 0, 0, 0, 0, 0];
  const guestData = guests && guests.length ? guests : [0, 0, 0, 0, 0, 0, 0];

  return (
    <MainCard title="Trend Booking Mingguan" content={false}>
      <Box sx={{ px: 2, pt: 2 }}>
        <LineChart
          height={320}
          xAxis={[{ data: days, scaleType: 'point' }]}
          series={[
            {
              label: 'Booking',
              data: bookingData,
              area: true,
              curve: 'monotone',
              color: '#42a5f5'
            },
            {
              label: 'Tamu',
              data: guestData,
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

WeeklyBookingTrend.propTypes = {
  labels: PropTypes.arrayOf(PropTypes.string),
  bookings: PropTypes.arrayOf(PropTypes.number),
  guests: PropTypes.arrayOf(PropTypes.number)
};
