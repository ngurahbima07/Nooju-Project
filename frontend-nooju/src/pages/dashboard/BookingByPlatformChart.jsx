import PropTypes from 'prop-types';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Stack, Typography } from '@mui/material';
import MainCard from 'components/MainCard';

const COLORS = ['#1976d2', '#90caf9', '#64b5f6', '#42a5f5', '#1e88e5', '#bbdefb'];

// Catatan: chart ini dulunya "Booking by Platform" (persentase per OTA) tapi
// datanya 100% hardcode/fiktif -- sistem belum punya kolom sumber booking di
// database. Untuk sementara diganti "Distribusi Tipe Kamar" (data asli dari
// reservasi bulan ini) sampai fitur sinkronisasi OTA dibuat.
export default function BookingByPlatformChart({ data }) {
  const rows = (data && data.length ? data : []).map((item, idx) => ({
    ...item,
    color: COLORS[idx % COLORS.length]
  }));

  const total = rows.reduce((sum, item) => sum + item.value, 0);

  return (
    <MainCard title="Distribusi Tipe Kamar (Bulan Ini)">
      {total === 0 ? (
        <Typography color="text.secondary">Belum ada booking pada bulan ini.</Typography>
      ) : (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
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
                  data: rows,
                  arcLabel: (item) => `${item.value}`,
                  arcLabelMinAngle: 15
                }
              ]}
            />
          </Box>

          <Box sx={{ flexBasis: '50%' }}>
            {rows.map((item, idx) => (
              <Box key={idx} display="flex" alignItems="center" gap={1} mb={0.5}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                <Typography variant="body2" fontWeight={500} sx={{ minWidth: 110 }}>
                  {item.label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.value} booking
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>
      )}
    </MainCard>
  );
}

BookingByPlatformChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.number
    })
  )
};
