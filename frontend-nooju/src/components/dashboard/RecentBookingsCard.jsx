import { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  Divider,
  Paper,
  Avatar,
  Chip,
  Skeleton,
  Box,
  useTheme
} from '@mui/material';
import axios from 'axios';
import {
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Hotel as RoomIcon,
  AttachMoney as PriceIcon,
  NightsStay as NightsIcon
} from '@mui/icons-material';

export default function RecentBookingsCard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/reservations/recent')
      .then((res) => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching recent bookings:', err);
        setLoading(false);
      });
  }, []);

  const getStatusChip = (status) => {
    let color = 'default';
    switch (status.toLowerCase()) {
      case 'confirmed':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'cancelled':
        color = 'error';
        break;
      default:
        color = 'info';
    }
    return <Chip label={status} color={color} size="small" />;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <CardHeader
        title="Recent Bookings"
        titleTypographyProps={{ variant: 'h6', fontWeight: 600 }}
        sx={{
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
        action={
          <Typography variant="caption" color="text.secondary">
            Last 10 bookings
          </Typography>
        }
      />
      <CardContent sx={{ p: 0 }}>
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 1 }} />
            ))}
          </Box>
        ) : bookings.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No recent bookings found
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: theme.palette.background.default }}>
                <TableCell sx={{ fontWeight: 600 }}>Guest</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Dates</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Room</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Nights</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bookings.map((booking) => (
                <TableRow key={booking.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.light, width: 32, height: 32 }}>
                        <PersonIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {booking.first_name} {booking.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{booking.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Box>
                        <Typography variant="body2">{formatDate(booking.check_in_date)}</Typography>
                        <Typography variant="body2">{formatDate(booking.check_out_date)}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RoomIcon fontSize="small" color="action" />
                      <Typography variant="body2">{booking.room_type}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <NightsIcon fontSize="small" color="action" />
                      <Typography variant="body2">{calculateNights(booking.check_in_date, booking.check_out_date)}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PriceIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={500}>
                        Rp {Number(booking.total_price).toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(booking.status || 'Confirmed')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Paper>
  );
}

function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function calculateNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end - start;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
