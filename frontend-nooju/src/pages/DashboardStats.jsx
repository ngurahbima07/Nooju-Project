import { Grid, Paper, Typography, Stack, Box } from '@mui/material';
import HotelIcon from '@mui/icons-material/Hotel';
import BedIcon from '@mui/icons-material/Bed';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const StatCard = ({ title, value, icon, color = 'primary' }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            bgcolor: (theme) => theme.palette[color].light,
            color: (theme) => theme.palette[color].main,
            p: 1.5,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5">{value}</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default function DashboardStats() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Check-In Hari Ini" value={12} icon={<HotelIcon />} color="primary" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Kamar Kosong" value={18} icon={<BedIcon />} color="success" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Pendapatan Hari Ini" value="Rp 5.250.000" icon={<AttachMoneyIcon />} color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard title="Booking Bulan Ini" value={87} icon={<CalendarMonthIcon />} color="info" />
      </Grid>
    </Grid>
  );
}
