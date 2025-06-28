// components/EditBookingModal.jsx
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
  Alert
} from '@mui/material';
import { CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, Cancel as CancelIcon } from '@mui/icons-material';
import axios from 'axios';

const EditBookingManagementModal = ({ open, onClose, booking, onSave, onDelete }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    roomType: '',
    subRoom: '',
    status: '',
    checkInDate: '',
    checkOutDate: '',
    totalPrice: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (booking) {
      setFormData({
        firstName: booking.guestName.split(' ')[0] || '',
        lastName: booking.guestName.split(' ')[1] || '',
        email: booking.guestEmail || '',
        roomType: booking.roomType || '',
        subRoom: booking.roomNumber || '',
        status: booking.status || 'confirmed',
        checkInDate: booking.arrival || '',
        checkOutDate: booking.departure || '',
        totalPrice: booking.totalPayment || 0,
        notes: booking.notes || ''
      });
    }
  }, [booking]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const updatedData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        room_type: formData.roomType,
        sub_room: formData.subRoom,
        status: formData.status,
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        total_price: formData.totalPrice,
        notes: formData.notes
      };

      await axios.put(`http://localhost:8000/api/reservations/${booking.id}`, updatedData);

      onSave({
        ...booking,
        ...updatedData,
        guestName: `${formData.firstName} ${formData.lastName}`,
        guestEmail: formData.email,
        roomType: formData.roomType,
        roomNumber: formData.subRoom,
        status: formData.status,
        arrival: formData.checkInDate,
        departure: formData.checkOutDate,
        totalPayment: formData.totalPrice,
        notes: formData.notes
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const StatusChip = ({ status }) => {
    const config = {
      confirmed: {
        color: 'success',
        icon: <CheckCircleIcon fontSize="small" />,
        label: 'Confirmed'
      },
      pending: {
        color: 'warning',
        icon: <ScheduleIcon fontSize="small" />,
        label: 'Pending'
      },
      cancelled: {
        color: 'error',
        icon: <CancelIcon fontSize="small" />,
        label: 'Cancelled'
      }
    }[status] || {
      color: 'default',
      icon: <ScheduleIcon fontSize="small" />,
      label: status
    };

    return <Chip icon={config.icon} label={config.label} color={config.color} size="small" variant="outlined" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Booking</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} />
              <TextField fullWidth label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} />
            </Box>

            <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Room Type</InputLabel>
                <Select name="roomType" value={formData.roomType} onChange={handleChange} label="Room Type">
                  <MenuItem value="Standard">Standard</MenuItem>
                  <MenuItem value="Superior">Superior</MenuItem>
                </Select>
              </FormControl>

              <TextField fullWidth label="Room Number" name="subRoom" value={formData.subRoom} onChange={handleChange} />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Check-in Date"
                name="checkInDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.checkInDate}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Check-out Date"
                name="checkOutDate"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={formData.checkOutDate}
                onChange={handleChange}
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Total Price"
                name="totalPrice"
                type="number"
                value={formData.totalPrice}
                onChange={handleChange}
                InputProps={{
                  startAdornment: '$'
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select name="status" value={formData.status} onChange={handleChange} label="Status">
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField fullWidth label="Notes" name="notes" multiline rows={3} value={formData.notes} onChange={handleChange} />
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={() => onDelete(booking.id)} color="error" variant="outlined">
          Delete Booking
        </Button>
        <Box>
          <Button onClick={onClose} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditBookingManagementModal;
