import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Payment as PaymentIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import AddPaymentContent from './AddPaymentContent';
import BookingComments from './BookingComments';

const EditBookingModal = ({
  selectedEvent,

  setSelectedEvent,
  editMode,
  setEditMode,
  resources,
  handleUpdateEvent,
  setDeleteConfirm,
  calculateTotalPrice,
  checkRoomAvailability,
  handleAddComment,
  handleAddPayment,
  fetchReservations,
  events,
  onClose
}) => {
  const [showRates, setShowRates] = useState(false);
  const [dailyRates, setDailyRates] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    checkin: '',
    checkout: '',
    roomType: '',
    subRoom: '',
    ratePlan: 'Rooms Only',
    adult: 1,
    children: 0,
    totalPrice: 0,
    status: 'confirm' // <-- tambahkan
  });

  const [activeSection, setActiveSection] = useState('detail'); // 'detail' | 'payment'

  const handleCloseModal = (event, reason = '') => {
    // Jika modal ditutup pakai ESC atau backdrop (reason kosong atau escapeKeyDown)
    if (!editMode) {
      cleanupAndClose();
      return;
    }

    const totalPaid = (selectedEvent?.payments || []).reduce((sum, p) => sum + Number(p.payment_amount), 0);

    // Jika sedang edit, tampilkan konfirmasi
    const confirmClose = window.confirm('Perubahan belum disimpan. Yakin ingin menutup?');
    if (confirmClose) {
      cleanupAndClose();
    }
  };

  const [showManualTotalDialog, setShowManualTotalDialog] = useState(false);
  const [manualTotalInput, setManualTotalInput] = useState('');

  const [hasLoadedRates, setHasLoadedRates] = useState(false);

  const cleanupAndClose = () => {
    setShowRates(false);
    setDailyRates([]); // ✅ reset harga harian
    setEditMode(false); // reset edit mode juga
    setActiveSection('detail'); // <-- tambahkan ini untuk reset
    onClose(); // ini harus setSelectedEvent(null) di parent
  };

  useEffect(() => {
    if (selectedEvent) {
      // Fetch latest data when modal opens (only when not in edit mode)
      const fetchLatestStatus = async () => {
        if (!editMode && selectedEvent.id) {
          try {
            const response = await axios.get(`http://localhost:8000/api/reservations/${selectedEvent.id}`);
            const latestData = response.data;

            setFormData((prev) => ({
              ...prev,
              status: latestData.status || prev.status
            }));

            // Update selectedEvent with latest status
            setSelectedEvent((prev) => ({
              ...prev,
              status: latestData.status,
              extendedProps: {
                ...prev.extendedProps,
                status: latestData.status
              }
            }));
          } catch (error) {
            console.error('Failed to fetch latest status:', error);
          }
        }
      };

      // Set initial form data
      setFormData({
        firstName: selectedEvent.firstName || '',
        lastName: selectedEvent.lastName || '',
        email: selectedEvent.email || '',
        checkin: selectedEvent.checkin || '',
        checkout: selectedEvent.checkout || '',
        roomType: selectedEvent.roomType || '',
        subRoom: selectedEvent.subRoom || '',
        ratePlan: selectedEvent.ratePlan || 'Rooms Only',
        adult: selectedEvent.adult || 1,
        children: selectedEvent.children || 0,
        totalPrice: selectedEvent.totalPrice || 0,
        status: selectedEvent.extendedProps?.status || selectedEvent.status || 'confirm'
      });

      // Get rates if available
      const rawRates =
        selectedEvent.extendedProps?.daily_rates ||
        selectedEvent.extendedProps?.dailyRates ||
        selectedEvent.daily_rates ||
        selectedEvent.dailyRates ||
        [];

      if (Array.isArray(rawRates)) {
        setDailyRates(rawRates);
        setHasLoadedRates(true);
      }

      // Fetch latest status
      fetchLatestStatus();
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (dailyRates.length > 0 && editMode) {
      const newTotal = calculateTotalFromRates();
      setFormData((prev) => ({ ...prev, totalPrice: newTotal }));
    }
  }, [dailyRates, editMode]);

  const generateRates = (checkin, checkout, defaultPrice) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) return;

    const fallbackPrice = 500000; // ← harga default fallback
    const pricePerNight = Math.round(Number(defaultPrice || fallbackPrice) / days);

    const rates = [];
    const current = new Date(checkin);

    for (let i = 0; i < days; i++) {
      const dateStr = current.toISOString().split('T')[0];
      rates.push({ date: dateStr, price: pricePerNight });
      current.setDate(current.getDate() + 1);
    }

    setDailyRates(rates);
  };

  const calculateTotalFromRates = () => {
    return dailyRates.reduce((acc, curr) => acc + Number(curr.price), 0);
  };

  const handleSetTotalPrice = () => {
    const nights = dailyRates.length;
    if (nights === 0) return;

    const total = prompt('Masukkan total harga (misal: 12000000):');
    if (!total || isNaN(total)) return;

    const perNight = Math.floor(Number(total) / nights);
    const newRates = dailyRates.map((item) => ({ ...item, price: perNight }));
    setDailyRates(newRates);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === 'checkin' || name === 'checkout' || name === 'roomType') {
        if (newData.checkin && newData.checkout && newData.roomType) {
          newData.totalPrice = calculateTotalPrice(newData.roomType, newData.checkin, newData.checkout);
        }
      }

      return newData;
    });
  };

  const handleSubmit = (e) => {
    console.log('Status yang akan dikirim:', formData.status);

    e.preventDefault();
    const finalTotal = dailyRates.length > 0 ? calculateTotalFromRates() : formData.totalPrice;
    handleUpdateEvent({ ...formData, totalPrice: finalTotal }, dailyRates);
  };

  if (!selectedEvent) return null;

  return (
    <Modal open={!!selectedEvent} onClose={handleCloseModal}>
      <Box
        sx={{
          p: 3,
          bgcolor: 'white',
          borderRadius: 2,
          maxWidth: 800,
          mx: 'auto',
          mt: 10,
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        component="form"
        onSubmit={handleSubmit}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" gutterBottom>
            {editMode ? 'Edit Reservasi' : 'Detail Reservasi'} - {formData.roomType} Room
          </Typography>
          <IconButton onClick={() => handleCloseModal()}>
            <CloseIcon />
          </IconButton>
        </Box>

        {activeSection === 'comment' ? (
          <BookingComments bookingId={selectedEvent.id} onClose={() => setActiveSection('detail')} />
        ) : activeSection === 'payment' ? (
          <>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <IconButton size="small" onClick={() => setActiveSection('detail')}>
                <CloseIcon />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>
                Pembayaran
              </Typography>
            </Box>

            <AddPaymentContent onSubmit={handleAddPayment} bookingId={selectedEvent.id} totalPrice={selectedEvent?.total_price} />
          </>
        ) : (
          <Box display="flex" gap={3} mt={2}>
            <Box flex={1}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Nama Depan"
                    name="firstName"
                    value={formData.firstName}
                    fullWidth
                    required
                    InputProps={{ readOnly: !editMode }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Nama Belakang"
                    name="lastName"
                    value={formData.lastName}
                    fullWidth
                    required
                    InputProps={{ readOnly: !editMode }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Check-in"
                    name="checkin"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formData.checkin}
                    InputProps={{ readOnly: !editMode }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Check-out"
                    name="checkout"
                    type="date"
                    fullWidth
                    required
                    InputLabelProps={{ shrink: true }}
                    value={formData.checkout}
                    InputProps={{ readOnly: !editMode }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    fullWidth
                    InputProps={{ readOnly: !editMode }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Tipe Kamar"
                    name="roomType"
                    select
                    fullWidth
                    required
                    value={formData.roomType}
                    InputProps={{ readOnly: !editMode }}
                    onChange={handleChange}
                  >
                    <MenuItem value="Standard">Standard</MenuItem>
                    <MenuItem value="Superior">Superior</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Nomor Kamar"
                    name="subRoom"
                    select
                    fullWidth
                    required
                    value={formData.subRoom}
                    onChange={handleChange}
                    disabled={!editMode}
                  >
                    <MenuItem value="UNASSIGNED">Belum dipilih</MenuItem>
                    {resources
                      .filter((room) => room.type === formData.roomType)
                      .map((room) => {
                        const roomNumber = room.title.split(' ')[1];
                        const isUnavailable = !checkRoomAvailability(
                          formData.roomType,
                          roomNumber,
                          formData.checkin,
                          formData.checkout,
                          selectedEvent.id,
                          events
                        );

                        return (
                          <MenuItem
                            key={room.id}
                            value={roomNumber}
                            disabled={isUnavailable}
                            sx={{ opacity: isUnavailable ? 0.5 : 1, color: isUnavailable ? 'text.disabled' : 'inherit' }}
                          >
                            {roomNumber} {isUnavailable ? '(Dipakai)' : ''}
                          </MenuItem>
                        );
                      })}
                  </TextField>
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Rate Plan"
                    name="ratePlan"
                    select
                    fullWidth
                    value={formData.ratePlan}
                    InputProps={{ readOnly: !editMode }}
                    onChange={handleChange}
                  >
                    <MenuItem value="Rooms Only">Rooms Only</MenuItem>
                    <MenuItem value="Breakfast Included">Breakfast Included</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    label="Dewasa"
                    name="adult"
                    type="number"
                    fullWidth
                    value={formData.adult}
                    required
                    InputProps={{ readOnly: !editMode, inputProps: { min: 1 } }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    label="Anak-anak"
                    name="children"
                    type="number"
                    fullWidth
                    value={formData.children}
                    InputProps={{ readOnly: !editMode, inputProps: { min: 0 } }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Total Harga"
                    value={(formData.totalPrice || 0).toLocaleString('id-ID', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      startAdornment: <InputAdornment position="start">IDR</InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <TextField
                    label="Status"
                    name="status"
                    select
                    fullWidth
                    required
                    value={formData.status || 'confirm'}
                    onChange={handleChange}
                    InputProps={{ readOnly: !editMode }}
                  >
                    <MenuItem value="confirm">Confirm</MenuItem>
                    <MenuItem value="onhold">On Hold</MenuItem>
                    <MenuItem value="cancel">Cancel</MenuItem>
                  </TextField>
                </Grid>

                {editMode && (
                  <Grid item xs={12}>
                    <Stack direction="row" spacing={2}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          if (!showRates) {
                            // ✅ hanya generate jika belum pernah load dari backend
                            if (!hasLoadedRates || dailyRates.length === 0) {
                              generateRates(formData.checkin, formData.checkout, formData.totalPrice || 0);
                            }

                            setShowRates(true);
                          } else {
                            setShowRates(false);
                          }
                        }}
                      >
                        {showRates ? 'Sembunyikan Rates' : 'Tampilkan Rates'}
                      </Button>

                      {showRates && (
                        <Button variant="outlined" onClick={() => setShowManualTotalDialog(true)}>
                          Set Total Manual
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                )}

                {showRates && (
                  <Grid item xs={12}>
                    <Box mt={2} p={2} border={1} borderRadius={1} borderColor="divider">
                      {dailyRates.map((item, idx) => (
                        <Box
                          key={`${item.date}-${idx}`}
                          sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}
                        >
                          <Typography>{item.date}</Typography>
                          <TextField
                            type="number"
                            size="small"
                            value={item.price}
                            onChange={(e) => {
                              const updated = [...dailyRates];
                              updated[idx].price = parseFloat(e.target.value) || 0;
                              setDailyRates(updated);

                              const total = updated.reduce((acc, curr) => acc + Number(curr.price), 0);
                              setFormData((prev) => ({ ...prev, totalPrice: total }));
                            }}
                            inputProps={{
                              step: '10000',
                              min: '0'
                            }}
                            sx={{ width: '150px' }}
                          />
                        </Box>
                      ))}
                      <Typography variant="subtitle1" sx={{ mt: 2 }}>
                        Total: Rp {calculateTotalFromRates().toLocaleString('id-ID')}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            <Box display="flex" flexDirection="column" gap={2} minWidth={180}>
              <Button variant="contained" color="error" startIcon={<DeleteIcon />} fullWidth onClick={() => setDeleteConfirm(true)}>
                Hapus
              </Button>

              {!selectedEvent.extendedProps?.isMaintenance && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<PaymentIcon />}
                  fullWidth
                  onClick={() => setActiveSection('payment')} // ✅ ubah ke dynamic section
                >
                  Pembayaran
                </Button>
              )}

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CommentIcon />}
                fullWidth
                onClick={() => setActiveSection('comment')} // <<< Pastikan ini
              >
                Komentar
              </Button>

              {editMode ? (
                <>
                  <Button variant="outlined" color="inherit" fullWidth onClick={() => setEditMode(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={() => {
                      const finalTotal = calculateTotalFromRates();
                      handleUpdateEvent(
                        {
                          id: selectedEvent.id, // ✅ tambahkan ID
                          ...formData,
                          totalPrice: finalTotal
                        },
                        dailyRates // ✅ kirim juga
                      );
                    }}
                  >
                    Simpan
                  </Button>
                </>
              ) : (
                <Button variant="contained" startIcon={<EditIcon />} fullWidth onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </Box>
            <Divider sx={{ my: 2 }} />
            <Dialog open={showManualTotalDialog} onClose={() => setShowManualTotalDialog(false)} maxWidth="xs" fullWidth>
              <DialogTitle>Set Total Manual</DialogTitle>
              <DialogContent sx={{ minWidth: 360 }}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Masukkan total harga (misal: 12000000)"
                  type="number"
                  fullWidth
                  inputProps={{ style: { fontSize: '1.1rem' } }}
                  value={manualTotalInput}
                  onChange={(e) => setManualTotalInput(e.target.value)}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setShowManualTotalDialog(false)}>Batal</Button>
                <Button
                  onClick={() => {
                    const total = parseFloat(manualTotalInput);
                    if (!isNaN(total) && dailyRates.length > 0) {
                      const perNight = Math.floor(total / dailyRates.length);
                      const updatedRates = dailyRates.map((item) => ({ ...item, price: perNight }));
                      setDailyRates(updatedRates);
                      setFormData((prev) => ({ ...prev, totalPrice: total }));
                    }
                    setShowManualTotalDialog(false);
                    setManualTotalInput('');
                  }}
                >
                  Simpan
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        )}
      </Box>
    </Modal>
  );
};

export default EditBookingModal;
