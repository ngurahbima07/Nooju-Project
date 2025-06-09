import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

const data = [
  { value: 61, label: 'Direct Booking', color: '#1976d2' },
  { value: 12, label: 'Booking.com', color: '#90caf9' },
  { value: 11, label: 'Agoda', color: '#64b5f6' },
  { value: 9, label: 'Airbnb', color: '#42a5f5' },
  { value: 5, label: 'Hotels.com', color: '#1e88e5' },
  { value: 2, label: 'Others', color: '#bbdefb' }
];

export default function BookingByPlatformChart() {
  return (
    <MainCard title="Booking by Platform">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        {/* PieChart dengan Box pembungkus */}
        <Box sx={{ flexBasis: '50%', display: 'flex', justifyContent: 'center' }}>
          <PieChart
            width={180}
            height={180}
            slotProps={{ legend: { hidden: true } }}
            series={[
              {
                innerRadius: 60,
                outerRadius: 80,
                paddingAngle: 4,
                cornerRadius: 4,
                data,
                arcLabel: (item) => `${item.value}%`,
                arcLabelMinAngle: 15
              }
            ]}
          />
        </Box>

        {/* Legend kanan */}
        <Box sx={{ flexBasis: '50%' }}>
          {data.map((item, idx) => (
            <Box key={idx} display="flex" alignItems="center" gap={1} mb={0.5}>
              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
              <Typography variant="body2" fontWeight={500} sx={{ minWidth: 110 }}>
                {item.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.value}%
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    </MainCard>
  );
}
