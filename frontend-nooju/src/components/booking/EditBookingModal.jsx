import React, { useState, useEffect, useCallback } from 'react'; // Tambahkan useCallback jika belum ada
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
  DialogActions,
  CircularProgress // <-- Pastikan ini di-import untuk loading state
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Payment as PaymentIcon,
  Comment as CommentIcon,
  GetApp as GetAppIcon // <-- Import icon download
} from '@mui/icons-material';
import AddPaymentContent from './AddPaymentContent';
import BookingComments from './BookingComments';
import axios from 'axios'; // <-- Import axios untuk panggilan API download

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
  handleAddComment, // Jika ini fungsi yang dipanggil untuk menambah komentar
  handleAddPayment, // Jika ini fungsi yang dipanggil untuk menambah pembayaran
  fetchReservations, // Digunakan untuk refresh data setelah aksi, sangat penting!
  events,
  onClose, // Ini adalah fungsi untuk menutup modal, dari parent
  onDownloadInvoice // <-- Prop baru untuk fungsi download
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
    status: 'confirm'
  });

  const [activeSection, setActiveSection] = useState('detail'); // 'detail' | 'payment' | 'comment'
  const [showManualTotalDialog, setShowManualTotalDialog] = useState(false);
  const [manualTotalInput, setManualTotalInput] = useState('');
  const [hasLoadedRates, setHasLoadedRates] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // State untuk loading tombol Save
  const [isDownloading, setIsDownloading] = useState(false); // <-- State untuk loading tombol download

  // Menggunakan useCallback untuk handleCloseModal agar tidak berubah setiap render jika tidak ada dependensi yang berubah
  const handleCloseModal = useCallback(
    (event, reason = '') => {
      // Jika modal ditutup pakai ESC atau backdrop (reason kosong atau escapeKeyDown)
      // atau jika tidak dalam mode edit (hanya view), langsung tutup
      if (!editMode || reason === 'escapeKeyDown' || reason === 'backdropClick') {
        cleanupAndClose();
        return;
      }

      // Jika sedang edit dan ada perubahan (perlu mekanisme deteksi perubahan yang lebih baik)
      // Untuk saat ini, kita bisa asumsikan jika dalam editMode, selalu tanyakan konfirmasi
      const confirmClose = window.confirm('Perubahan belum disimpan. Yakin ingin menutup?');
      if (confirmClose) {
        cleanupAndClose();
      }
    },
    [editMode, onClose, setSelectedEvent, setEditMode]
  ); // Tambahkan onClose, setSelectedEvent, setEditMode sebagai dependensi

  const cleanupAndClose = useCallback(() => {
    setShowRates(false);
    setDailyRates([]);
    setEditMode(false);
    setActiveSection('detail');
    if (setSelectedEvent) {
      // Pastikan setSelectedEvent ada sebelum memanggilnya
      setSelectedEvent(null); // Ini akan menutup modal di parent (BookingChart.jsx)
    }
    onClose(); // Ini adalah prop onClose dari parent yang akan mengatur `editModalOpen(false)`
  }, [onClose, setSelectedEvent, setEditMode]);

  useEffect(() => {
    if (selectedEvent) {
      // Set initial form data dari selectedEvent
      setFormData({
        firstName: selectedEvent.firstName || '',
        lastName: selectedEvent.lastName || '',
        email: selectedEvent.email || '',
        checkin: selectedEvent.start || '', // Menggunakan start dari FullCalendar event
        checkout: selectedEvent.end || '', // Menggunakan end dari FullCalendar event
        roomType: selectedEvent.roomType || '',
        subRoom: selectedEvent.subRoom || '',
        ratePlan: selectedEvent.ratePlan || 'Rooms Only',
        adult: selectedEvent.adult || 1,
        children: selectedEvent.children || 0,
        totalPrice: selectedEvent.totalPrice || 0,
        status: selectedEvent.extendedProps?.status || selectedEvent.status || 'confirm'
      });

      // Get rates if available (pastikan ini sesuai dengan struktur data Anda)
      const rawRates =
        selectedEvent.extendedProps?.daily_rates ||
        selectedEvent.extendedProps?.dailyRates ||
        selectedEvent.daily_rates ||
        selectedEvent.dailyRates ||
        [];

      if (Array.isArray(rawRates) && rawRates.length > 0) {
        setDailyRates(rawRates);
        setHasLoadedRates(true);
      } else {
        setDailyRates([]); // Reset jika tidak ada rates
        setHasLoadedRates(false);
      }

      setActiveSection('detail'); // Reset ke detail section saat event baru dipilih

      // Fetch latest data when modal opens (if ID exists and not initially in edit mode, or always for fresh data)
      const fetchLatestStatus = async () => {
        if (selectedEvent.id) {
          // Selalu fetch data terbaru jika ada ID
          try {
            const response = await axios.get(`http://localhost:8000/api/reservations/${selectedEvent.id}`);
            const latestData = response.data;

            setFormData((prev) => ({
              ...prev,
              status: latestData.status || prev.status,
              totalPrice: latestData.total_price || prev.totalPrice // Update total price juga
            }));

            // Update selectedEvent state di parent jika Anda ingin UI di parent juga refresh
            // Namun, ini biasanya dikelola oleh fetchReservations di BookingChart setelah update.
            //setSelectedEvent((prev) => ({
            //  ...prev,
            //  status: latestData.status,
            //  totalPrice: latestData.total_price,
            //  extendedProps: {
            //    ...prev.extendedProps,
            //    status: latestData.status,
            //    totalPrice: latestData.total_price,
            //  }
            //}));
          } catch (error) {
            console.error('Failed to fetch latest status:', error);
          }
        }
      };
      fetchLatestStatus(); // Panggil saat modal terbuka
    }
  }, [selectedEvent, editMode]); // selectedEvent dan editMode adalah dependensi yang wajar

  useEffect(() => {
    // Recalculate total price if daily rates change and in edit mode
    if (dailyRates.length > 0 && editMode) {
      const newTotal = calculateTotalFromRates();
      setFormData((prev) => ({ ...prev, totalPrice: newTotal }));
    }
  }, [dailyRates, editMode]); // calculateTotalFromRates adalah fungsi internal, jadi tidak perlu di sini

  const generateRates = (checkin, checkout, defaultPrice) => {
    const start = new Date(checkin);
    const end = new Date(checkout);
    // Hati-hati dengan perhitungan hari, pastikan checkout tidak dihitung sebagai malam.
    // Jika checkout adalah hari keberangkatan, maka jumlah malam adalah (checkout - checkin)
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) return;

    const fallbackPrice = 500000;
    // Gunakan defaultPrice yang sudah ada atau fallbackPrice, lalu bagi dengan jumlah hari
    const initialPricePerNight = Math.round(Number(defaultPrice || fallbackPrice) / days);

    const rates = [];
    const current = new Date(checkin);

    for (let i = 0; i < days; i++) {
      const dateStr = current.toISOString().split('T')[0];
      rates.push({ date: dateStr, price: initialPricePerNight });
      current.setDate(current.getDate() + 1);
    }
    setDailyRates(rates);
  };

  const calculateTotalFromRates = () => {
    return dailyRates.reduce((acc, curr) => acc + Number(curr.price), 0);
  };

  const handleSetTotalManual = () => {
    // Mengganti handleSetTotalPrice dengan ini
    setShowManualTotalDialog(true);
    setManualTotalInput(formData.totalPrice.toString()); // Set nilai awal input dengan total saat ini
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      // Recalculate total price if checkin, checkout, or roomType changes
      if (name === 'checkin' || name === 'checkout' || name === 'roomType') {
        if (newData.checkin && newData.checkout && newData.roomType) {
          // Asumsi calculateTotalPrice adalah fungsi yang di-pass dari parent
          // dan mengembalikan total harga berdasarkan roomType dan rentang tanggal
          newData.totalPrice = calculateTotalPrice(newData.roomType, newData.checkin, newData.checkout);
          // Jika Anda ingin dailyRates juga otomatis terisi/terupdate saat tanggal berubah
          if (editMode) {
            // Hanya generate rates jika dalam mode edit
            generateRates(newData.checkin, newData.checkout, newData.totalPrice);
          }
        } else {
          newData.totalPrice = 0; // Reset total jika tanggal atau tipe kamar tidak lengkap
          setDailyRates([]);
        }
      }
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Mulai loading untuk tombol simpan

    // Gunakan total dari dailyRates jika ada, jika tidak, gunakan formData.totalPrice
    const finalTotal = dailyRates.length > 0 ? calculateTotalFromRates() : formData.totalPrice;

    // Pastikan ID reservasi ada
    if (!selectedEvent || !selectedEvent.id) {
      console.error('Tidak ada ID reservasi untuk diperbarui.');
      setIsSaving(false);
      return;
    }

    // Panggil handleUpdateEvent dari parent
    await handleUpdateEvent(
      selectedEvent.id, // Teruskan ID reservasi
      { ...formData, totalPrice: finalTotal },
      dailyRates // Kirim juga dailyRates jika diperlukan di backend
    );
    setIsSaving(false); // Selesai loading
    cleanupAndClose(); // Tutup modal setelah simpan
    if (fetchReservations) {
      // Panggil fetchReservations dari parent untuk refresh data
      fetchReservations();
    }
  };

  // Fungsi untuk menangani download invoice
  const handleDownloadInvoiceClick = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      console.warn('Tidak ada booking ID untuk mengunduh invoice.');
      return;
    }
    setIsDownloading(true); // Mulai loading
    try {
      // Panggil prop onDownloadInvoice yang diteruskan dari parent (BookingChart.jsx)
      await onDownloadInvoice(selectedEvent.id);
    } catch (error) {
      console.error('Gagal mengunduh invoice di modal:', error);
      // Di sini Anda bisa menambahkan notifikasi atau alert jika ingin
    } finally {
      setIsDownloading(false); // Selesai loading
    }
  };

  if (!selectedEvent) return null; // Modal tidak akan render jika tidak ada event terpilih

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

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant={activeSection === 'detail' ? 'contained' : 'outlined'} onClick={() => setActiveSection('detail')}>
            Details
          </Button>
          <Button variant={activeSection === 'comment' ? 'contained' : 'outlined'} onClick={() => setActiveSection('comment')}>
            Comments
          </Button>
          <Button variant={activeSection === 'payment' ? 'contained' : 'outlined'} onClick={() => setActiveSection('payment')}>
            Payments
          </Button>
          {showRates && ( // Hanya tampilkan tombol rates jika showRates true
            <Button variant={activeSection === 'rates' ? 'contained' : 'outlined'} onClick={() => setActiveSection('rates')}>
              Rates
            </Button>
          )}
        </Stack>
        <Divider sx={{ mb: 2 }} />

        {/* --- Section Content --- */}
        {activeSection === 'comment' && <BookingComments bookingId={selectedEvent.id} onClose={() => setActiveSection('detail')} />}

        {activeSection === 'payment' && (
          <>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <IconButton size="small" onClick={() => setActiveSection('detail')}>
                <CloseIcon />
              </IconButton>
              <Typography variant="subtitle1" fontWeight={600}>
                Pembayaran
              </Typography>
            </Box>
            {/* Pastikan `AddPaymentContent` menerima props yang benar dan handleAddPayment adalah fungsi yang sesuai */}
            <AddPaymentContent
              bookingId={selectedEvent.id}
              totalPrice={selectedEvent?.totalPrice} // Gunakan totalPrice dari selectedEvent atau formData
              paidAmount={selectedEvent?.paidAmount} // Prop paidAmount jika ada di selectedEvent
              fetchReservations={fetchReservations} // Pastikan ini di-pass ke AddPaymentContent
              // OnAddPayment sukses, mungkin perlu refresh data atau update state
              onPaymentSuccess={fetchReservations} // Panggil fetchReservations setelah pembayaran sukses
            />
          </>
        )}

        {activeSection === 'rates' &&
          showRates && ( // Tampilkan hanya jika activeSection adalah 'rates' DAN showRates true
            <Grid item xs={12}>
              <Box mt={2} p={2} border={1} borderRadius={1} borderColor="divider">
                <Typography variant="h6" gutterBottom>
                  Daily Rates
                </Typography>
                {dailyRates.map((item, idx) => (
                  <Box key={`${item.date}-${idx}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
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

        {activeSection === 'detail' && (
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
                    {resources.map((res) => (
                      <MenuItem key={res.id} value={res.title}>
                        {res.title}
                      </MenuItem>
                    ))}
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
                      .find((res) => res.title === formData.roomType)
                      ?.extendedProps?.sub_rooms?.map((sub) => {
                        const isUnavailable = !checkRoomAvailability(
                          formData.roomType,
                          sub.title, // Menggunakan sub.title (nomor kamar)
                          formData.checkin,
                          formData.checkout,
                          selectedEvent.id,
                          events
                        );

                        return (
                          <MenuItem
                            key={sub.id}
                            value={sub.title}
                            disabled={isUnavailable}
                            sx={{ opacity: isUnavailable ? 0.5 : 1, color: isUnavailable ? 'text.disabled' : 'inherit' }}
                          >
                            {sub.title} {isUnavailable ? '(Dipakai)' : ''}
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
                      startAdornment: <InputAdornment position="start">IDR</InputAdornment>,
                      endAdornment: editMode && ( // Tampilkan tombol edit hanya jika dalam mode edit
                        <InputAdornment position="end">
                          <IconButton onClick={handleSetTotalManual} edge="end">
                            <EditIcon />
                          </IconButton>
                        </InputAdornment>
                      )
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
                            // Hanya generate jika belum pernah load dari backend atau dailyRates kosong
                            if (!hasLoadedRates || dailyRates.length === 0) {
                              generateRates(formData.checkin, formData.checkout, formData.totalPrice || 0);
                            }
                            setShowRates(true);
                            setActiveSection('rates'); // Pindah ke section rates
                          } else {
                            setShowRates(false);
                            setActiveSection('detail'); // Kembali ke detail
                          }
                        }}
                      >
                        {showRates ? 'Sembunyikan Rates' : 'Tampilkan Rates'}
                      </Button>
                    </Stack>
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
                  onClick={() => setActiveSection('payment')}
                >
                  Pembayaran
                </Button>
              )}

              <Button
                variant="outlined"
                color="secondary"
                startIcon={<CommentIcon />}
                fullWidth
                onClick={() => setActiveSection('comment')}
              >
                Komentar
              </Button>

              <Button
                variant="contained"
                onClick={handleDownloadInvoiceClick} // <-- Panggil fungsi download
                startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : <GetAppIcon />}
                disabled={isDownloading || !selectedEvent?.id} // Nonaktifkan saat loading atau tanpa ID
                fullWidth
              >
                {isDownloading ? 'Downloading...' : 'Download Invoice'}
              </Button>

              {editMode ? (
                <>
                  <Button variant="outlined" color="inherit" fullWidth onClick={() => setEditMode(false)}>
                    Batal Edit
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    startIcon={isSaving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                    disabled={isSaving}
                    fullWidth
                  >
                    {isSaving ? 'Saving...' : 'Simpan Perubahan'}
                  </Button>
                </>
              ) : (
                <Button variant="contained" startIcon={<EditIcon />} fullWidth onClick={() => setEditMode(true)}>
                  Edit
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Dialog untuk manual total price */}
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
                if (!isNaN(total)) {
                  if (dailyRates.length > 0) {
                    const perNight = Math.floor(total / dailyRates.length);
                    const updatedRates = dailyRates.map((item) => ({ ...item, price: perNight }));
                    setDailyRates(updatedRates);
                  }
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
    </Modal>
  );
};

export default EditBookingModal;
