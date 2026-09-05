// components/EditBookingManagementModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Stack,
  Chip,
  Alert,
  Tabs,
  Tab,
  Grid
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import api from '../../api/axios';
import { format } from 'date-fns';
import AddPaymentContent from './AddPaymentContent';
import BookingComments from './BookingComments';

const EditBookingManagementModal = ({ open, onClose, booking, onSave, onDelete, onRefreshBookings }) => {
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    roomType: '',
    subRoom: '',
    status: '',
    checkInDate: '',
    checkOutDate: '',
    totalPrice: 0,
    paidAmount: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState('details');

  useEffect(() => {
    if (booking) {
      setFormData({
        id: booking.id,
        firstName: booking.guestName.split(' ')[0] || '',
        lastName: booking.guestName.split(' ')[1] || '',
        email: booking.guestEmail || '',
        roomType: booking.roomType || '',
        subRoom: booking.roomNumber || '',
        status: booking.status || 'confirmed',
        checkInDate: booking.arrival ? format(new Date(booking.arrival), 'yyyy-MM-dd') : '',
        checkOutDate: booking.departure ? format(new Date(booking.departure), 'yyyy-MM-dd') : '',
        totalPrice: booking.totalPayment || 0,
        paidAmount: booking.paid_amount || 0
      });
      setError(null);
      setTabValue('details');
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        room_type: formData.roomType,
        sub_room: formData.subRoom,
        status: formData.status,
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        total_price: formData.totalPrice,
        paid_amount: formData.paidAmount
      };

      await api.put(`/reservations/${formData.id}`, payload);
      await onRefreshBookings(); // Tambahkan ini
      onSave(formData.id);
      onClose();
    } catch (err) {
      console.error('Error updating booking:', err);
      setError(err.response?.data?.message || 'Gagal memperbarui booking.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'confirm':
        return <Chip label="Confirmed" color="success" icon={<CheckCircleIcon />} />;
      case 'onhold':
        return <Chip label="On Hold" color="warning" icon={<ScheduleIcon />} />;
      case 'cancel':
        return <Chip label="Cancelled" color="error" icon={<CancelIcon />} />;
      default:
        return <Chip label="Unknown" />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Booking: {formData.firstName} {formData.lastName}
      </DialogTitle>
      <DialogContent dividers>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="booking sections" sx={{ mb: 2 }}>
          <Tab label="Detail Booking" value="details" />
          <Tab label="Pembayaran" value="payments" icon={<PaymentIcon />} iconPosition="start" />
          <Tab label="Komentar" value="comments" icon={<CommentIcon />} iconPosition="start" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {tabValue === 'details' && (
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Status Booking: {getStatusChip(formData.status)}</Typography>
              <Typography variant="h6">Sisa Bayar: Rp {(formData.totalPrice - formData.paidAmount).toLocaleString('id-ID')}</Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField select fullWidth label="Room Type" name="roomType" value={formData.roomType} onChange={handleChange}>
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Superior">Superior</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Sub Room" name="subRoom" value={formData.subRoom} onChange={handleChange} />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Check-in Date"
                  name="checkInDate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.checkInDate}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Check-out Date"
                  name="checkOutDate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.checkOutDate}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Total Price"
                  name="totalPrice"
                  type="number"
                  value={formData.totalPrice}
                  onChange={handleChange}
                  InputProps={{ startAdornment: 'Rp' }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select name="status" value={formData.status} onChange={handleChange} label="Status">
                    <MenuItem value="confirm">Confirmed</MenuItem>
                    <MenuItem value="onhold">On Hold</MenuItem>
                    <MenuItem value="cancel">Cancelled</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Stack>
        )}

        {tabValue === 'payments' && (
          <Box sx={{ p: 2 }}>
            <AddPaymentContent bookingId={formData.id} totalPrice={formData.totalPrice} onPaymentAdded={onRefreshBookings} />
          </Box>
        )}

        {tabValue === 'comments' && (
          <Box sx={{ p: 2 }}>
            <BookingComments bookingId={formData.id} readOnly />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={() => onDelete(booking.id)} color="error" variant="outlined" disabled={loading}>
          Delete Booking
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }} disabled={loading}>
            Cancel
          </Button>
          {tabValue === 'details' && (
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditBookingManagementModal;

