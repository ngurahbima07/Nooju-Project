import React, { useState, useEffect } from 'react';
import { Stack } from '@mui/material';
import { Modal, Box, Typography, Grid, TextField, MenuItem, Button } from '@mui/material';

const AddBookingModal = ({
  open,
  onClose,
  newEvent,
  setNewEvent,
  onSave,
  formErrors,
  setFormErrors,
  resources,
  checkRoomAvailability,
  calculateTotalPrice,
  events
}) => {
  const [showRates, setShowRates] = useState(false);
  const [dailyRates, setDailyRates] = useState([]);
  const [manualTotal, setManualTotal] = useState('');

  // Generate rates when dates or total price change
  useEffect(() => {
    if (newEvent.checkin && newEvent.checkout && newEvent.totalPrice > 0) {
      const nights = calculateNights(newEvent.checkin, newEvent.checkout);
      if (dailyRates.length !== nights || dailyRates.length === 0) {
        generateRates(newEvent.totalPrice, newEvent.checkin, newEvent.checkout);
      }
    }
  }, [newEvent.checkin, newEvent.checkout, newEvent.totalPrice]);

  useEffect(() => {
    if (open) {
      setDailyRates([]);
      setManualTotal('');
    }
  }, [open]);

  const calculateNights = (checkin, checkout) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    return Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  };

  const generateRates = (totalPrice, checkin, checkout) => {
    const nights = calculateNights(checkin, checkout);
    const pricePerNight = Math.round(totalPrice / nights);

    const rates = [];
    const currentDate = new Date(checkin);

    for (let i = 0; i < nights; i++) {
      rates.push({
        date: currentDate.toISOString().split('T')[0],
        price: pricePerNight
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDailyRates(rates);
  };

  const calculateTotalFromRates = () => {
    return dailyRates.reduce((acc, curr) => acc + Number(curr.price), 0);
  };

  const handleDivideTotal = () => {
    if (!manualTotal || isNaN(manualTotal) || dailyRates.length === 0) return;

    const total = Number(manualTotal);
    const pricePerNight = Math.round(total / dailyRates.length);

    setDailyRates((prevRates) => prevRates.map((item) => ({ ...item, price: pricePerNight })));
  };

  // Update total price when daily rates change
  useEffect(() => {
    if (dailyRates.length > 0) {
      const total = calculateTotalFromRates();
      if (total !== newEvent.totalPrice) {
        setNewEvent((prev) => ({ ...prev, totalPrice: total }));
      }
    }
  }, [dailyRates]);

  const handleToggleRates = () => {
    if (newEvent.totalPrice <= 0) {
      alert('Harap masukkan total harga terlebih dahulu');
      return;
    }
    setShowRates(!showRates);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 3,
          bgcolor: 'white',
          borderRadius: 2,
          maxWidth: 600,
          mx: 'auto',
          mt: 10,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <Typography variant="h6">Tambah Booking</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              fullWidth
              value={newEvent.firstName}
              onChange={(e) => setNewEvent({ ...newEvent, firstName: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              fullWidth
              value={newEvent.lastName}
              onChange={(e) => setNewEvent({ ...newEvent, lastName: e.target.value })}
              required
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Check-in"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.checkin}
              onChange={(e) => {
                const updatedCheckin = e.target.value;
                setNewEvent((prev) => {
                  const newTotalPrice = calculateTotalPrice(prev.roomType, updatedCheckin, prev.checkout);
                  return {
                    ...prev,
                    checkin: updatedCheckin,
                    totalPrice: newTotalPrice
                  };
                });
              }}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Check-out"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={newEvent.checkout}
              onChange={(e) => {
                const updatedCheckout = e.target.value;
                setNewEvent((prev) => {
                  const isInvalid = new Date(updatedCheckout) <= new Date(prev.checkin);
                  const newTotalPrice = calculateTotalPrice(prev.roomType, prev.checkin, updatedCheckout);
                  setFormErrors((prevErr) => ({
                    ...prevErr,
                    invalidDateRange: isInvalid
                  }));
                  return {
                    ...prev,
                    checkout: updatedCheckout,
                    totalPrice: newTotalPrice
                  };
                });
              }}
              error={formErrors.invalidDateRange}
              helperText={formErrors.invalidDateRange ? 'Check-out harus setelah check-in' : ''}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Email"
              fullWidth
              value={newEvent.email}
              onChange={(e) => setNewEvent({ ...newEvent, email: e.target.value })}
              type="email"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Room Type"
              select
              fullWidth
              value={newEvent.roomType}
              onChange={(e) => {
                const updatedRoomType = e.target.value;
                setNewEvent((prev) => ({
                  ...prev,
                  roomType: updatedRoomType,
                  subRoom: '',
                  totalPrice: calculateTotalPrice(updatedRoomType, prev.checkin, prev.checkout)
                }));
              }}
              required
            >
              <MenuItem value="Standard">Standard</MenuItem>
              <MenuItem value="Superior">Superior</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Room Number"
              select
              fullWidth
              value={newEvent.subRoom}
              onChange={(e) => setNewEvent({ ...newEvent, subRoom: e.target.value })}
              disabled={!newEvent.roomType}
              required
            >
              <MenuItem value="" disabled>
                — Pilih Nomor Kamar —
              </MenuItem>
              <MenuItem value="UNASSIGNED">Belum dipilih</MenuItem>
              {resources
                .filter((room) => room.type === newEvent.roomType)
                .map((room) => {
                  const roomNumber = room.title.split(' ')[1];
                  const isUnavailable = !checkRoomAvailability(roomNumber, newEvent.checkin, newEvent.checkout, null, events);

                  return (
                    <MenuItem key={room.id} value={roomNumber} disabled={isUnavailable}>
                      {roomNumber} {isUnavailable ? '(Dipakai)' : ''}
                    </MenuItem>
                  );
                })}
            </TextField>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Rate Plan"
              select
              fullWidth
              value={newEvent.ratePlan}
              onChange={(e) => setNewEvent({ ...newEvent, ratePlan: e.target.value })}
            >
              <MenuItem value="Rooms Only">Rooms Only</MenuItem>
              <MenuItem value="Breakfast Included">Breakfast Included</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Adult"
              type="number"
              fullWidth
              value={newEvent.adult}
              onChange={(e) => setNewEvent({ ...newEvent, adult: e.target.value })}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>
          <Grid item xs={3}>
            <TextField
              label="Children"
              type="number"
              fullWidth
              value={newEvent.children}
              onChange={(e) => setNewEvent({ ...newEvent, children: e.target.value })}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Total Accommodation (IDR)"
              fullWidth
              value={(newEvent.totalPrice || 0).toLocaleString('id-ID', {
                style: 'currency',
                currency: 'IDR'
              })}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <Button variant="outlined" onClick={handleToggleRates} fullWidth disabled={!newEvent.checkin || !newEvent.checkout}>
              {showRates ? 'Sembunyikan Detail Harga' : 'Tampilkan Detail Harga'}
            </Button>
          </Grid>

          {showRates && (
            <Grid item xs={12}>
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  border: '1px solid #eee',
                  borderRadius: 1
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Detail Harga Per Malam
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <TextField
                    label="Total Harga (IDR)"
                    type="number"
                    size="small"
                    fullWidth
                    value={manualTotal}
                    onChange={(e) => setManualTotal(e.target.value)}
                    placeholder="Masukkan total harga"
                  />
                  <Button variant="contained" onClick={handleDivideTotal} disabled={!manualTotal || dailyRates.length === 0}>
                    Bagi Merata
                  </Button>
                </Stack>

                {dailyRates.map((item, idx) => (
                  <Stack key={idx} direction="row" spacing={2} alignItems="center" mb={1}>
                    <Typography variant="body2" sx={{ width: 120 }}>
                      {item.date}
                    </Typography>
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={item.price}
                      onChange={(e) => {
                        const updated = [...dailyRates];
                        updated[idx].price = Number(e.target.value) || 0;
                        setDailyRates(updated);
                      }}
                    />
                  </Stack>
                ))}

                <Box
                  sx={{
                    mt: 2,
                    p: 2,
                    bgcolor: '#f5f5f5',
                    borderRadius: 1,
                    textAlign: 'right'
                  }}
                >
                  <Typography variant="subtitle1">Total: Rp {calculateTotalFromRates().toLocaleString('id-ID')}</Typography>
                </Box>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box mt={2} textAlign="right">
              <Button
                onClick={() => {
                  const total = calculateTotalFromRates();
                  onSave({ ...newEvent, totalPrice: total }, dailyRates); // ✅dailyRates
                }}
                variant="contained"
                disabled={
                  !newEvent.firstName ||
                  !newEvent.lastName ||
                  !newEvent.checkin ||
                  !newEvent.checkout ||
                  !newEvent.roomType ||
                  !newEvent.subRoom
                }
              >
                Simpan Booking
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Modal>
  );
};

export default AddBookingModal;
