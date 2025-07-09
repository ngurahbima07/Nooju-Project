import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';

// Components
import EditBookingManagementModal from 'components/booking/EditBookingManagementModal';
import BookingComments from 'components/booking/BookingComments';

// Material-UI Components
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Stack,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
  useMediaQuery,
  Tooltip,
  LinearProgress,
  DialogContentText,
  Card,
  CardContent,
  Grid,
  Divider
} from '@mui/material';

// Data Grid Components
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';

// Icons
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  CreditCard as CreditCardIcon,
  AccountBalance as BankIcon,
  AttachMoney as CashIcon,
  Add as AddIcon,
  FilterAlt as FilterIcon,
  Refresh as RefreshIcon,
  DoorFront as DoorFrontIcon,
  CalendarMonth as CalendarMonthIcon
} from '@mui/icons-material';

// IMPOR MAIN CARD UNTUK KONSISTENSI DESAIN
import MainCard from 'components/MainCard';

const BookingManagement = () => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fungsi untuk mengambil data booking
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8000/api/reservations');

      // *** KRUSIAL: Filter out any null/undefined entries from the raw response data ***
      const rawBookings = Array.isArray(response.data) ? response.data.filter((booking) => booking != null) : [];

      const formattedBookings = rawBookings
        .map((booking) => ({
          // *** KRUSIAL: PASTIKAN ID SELALU ADA DAN VALID UNTUK DATAGRID ***
          // Konversi id ke string, jika booking.id null/undefined, set id menjadi null
          id: booking.id != null ? String(booking.id) : null,
          guestName: `${booking.first_name || ''} ${booking.last_name || ''}`,
          guestEmail: booking.email || '',
          roomType: booking.room_type || '',
          roomNumber: booking.sub_room || '',
          arrival: booking.check_in_date || '',
          departure: booking.check_out_date || '',
          totalPayment: booking.total_price != null ? Number(booking.total_price) : 0,
          status: booking.status || 'pending',
          paid_amount: booking.paid_amount != null ? Number(booking.paid_amount) : 0
        }))
        // *** KRUSIAL: FILTER TAMBAHAN: Hapus baris yang memiliki ID null setelah pemformatan ***
        .filter((booking) => booking.id != null);

      setBookings(formattedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Gagal memuat data booking.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleEdit = (booking) => {
    setBookingToEdit(booking);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (bookingId) => {
    // Setelah edit, muat ulang data
    fetchBookings();
  };

  const handleDeleteBooking = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:8000/api/reservations/${id}`);
      setAlertMessage('Booking berhasil dihapus!');
      setAlertOpen(true);
      fetchBookings(); // Muat ulang data setelah penghapusan
      setDeleteConfirmOpen(false); // Tutup konfirmasi hapus
      setEditModalOpen(false); // Tutup modal edit jika terbuka
    } catch (err) {
      console.error('Error deleting booking:', err);
      setAlertMessage('Gagal menghapus booking: ' + (err.response?.data?.message || err.message));
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = useMemo(() => {
    let currentBookings = bookings;

    if (filterStatus !== 'all') {
      currentBookings = currentBookings.filter((booking) => booking.status === filterStatus);
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentBookings = currentBookings.filter(
        (booking) =>
          booking.guestName.toLowerCase().includes(lowerCaseSearchTerm) ||
          booking.guestEmail.toLowerCase().includes(lowerCaseSearchTerm) ||
          booking.roomType.toLowerCase().includes(lowerCaseSearchTerm) ||
          booking.roomNumber.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
    return currentBookings;
  }, [bookings, filterStatus, searchTerm]);

  const columns = useMemo(
    () => [
      { field: 'guestName', headerName: 'Guest Name', width: 200 },
      { field: 'guestEmail', headerName: 'Email', width: 200 },
      { field: 'roomType', headerName: 'Room Type', width: 120 },
      { field: 'roomNumber', headerName: 'Room No.', width: 100 },
      { field: 'arrival', headerName: 'Check-in', width: 130 },
      { field: 'departure', headerName: 'Check-out', width: 130 },
      {
        field: 'totalPayment',
        headerName: 'Total Price',
        width: 130,
        valueFormatter: (params) => `Rp ${Number(params.value).toLocaleString('id-ID')}`
      },
      {
        field: 'paid_amount',
        headerName: 'Paid Amount',
        width: 130,
        valueFormatter: (params) => `Rp ${Number(params.value).toLocaleString('id-ID')}`
      },
      {
        field: 'remaining_payment',
        headerName: 'Remaining',
        width: 130,
        // *** Ini baris 182, sudah defensif. Masalahnya jika params.row itu sendiri undefined ***
        valueGetter: (params) => {
          if (!params || !params.row) return 0;
          return (params.row.totalPayment ?? 0) - (params.row.paid_amount ?? 0);
        },

        valueFormatter: (params) => `Rp ${Number(params.value).toLocaleString('id-ID')}`
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        renderCell: (params) => {
          switch (params.value) {
            case 'confirm':
            case 'confirmed':
              return <Chip label="Confirmed" color="success" icon={<CheckCircleIcon />} />;
            case 'onhold':
            case 'pending':
              return <Chip label="Pending" color="warning" icon={<ScheduleIcon />} />;
            case 'cancel':
            case 'cancelled':
              return <Chip label="Cancelled" color="error" icon={<CancelIcon />} />;
            default:
              return <Chip label="Unknown" />;
          }
        }
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 150,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Tooltip title="View Details">
              <IconButton onClick={() => handleView(params.row)} size="small">
                <ViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Booking">
              <IconButton onClick={() => handleEdit(params.row)} size="small">
                <EditIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Booking">
              <IconButton onClick={() => confirmDelete(params.row)} size="small">
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        )
      }
    ],
    []
  );

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const confirmDelete = (booking) => {
    setBookingToDelete(booking);
    setDeleteConfirmOpen(true);
  };

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <Stack direction="row" justifyContent="space-between" width="100%" alignItems="center" p={1}>
          <Stack direction="row" spacing={1}>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport />
          </Stack>
          <Box>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ mr: 1 }}
            />
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="confirm">Confirmed</MenuItem>
                <MenuItem value="onhold">Pending</MenuItem>
                <MenuItem value="cancel">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Stack>
      </GridToolbarContainer>
    );
  }

  return (
    // Mengganti Paper dengan MainCard untuk konsistensi desain
    <MainCard title="Booking Management">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredBookings}
          columns={columns}
          pageSizeOptions={[5, 10, 20]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 }
            }
          }}
          loading={loading}
          slots={{
            toolbar: CustomToolbar,
            loadingOverlay: LinearProgress
          }}
          disableRowSelectionOnClick
          autoHeight={isMobile}
        />
      </Box>

      {/* Edit Booking Modal (menggunakan EditBookingManagementModal yang sudah dimodifikasi) */}
      {bookingToEdit && (
        <EditBookingManagementModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          booking={bookingToEdit}
          onSave={handleSaveEdit}
          onDelete={handleDeleteBooking}
          onRefreshBookings={fetchBookings} // Meneruskan fungsi refresh data
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Anda yakin ingin menghapus booking atas nama **{bookingToDelete ? bookingToDelete.guestName : ''}**?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Batal</Button>
          <Button onClick={() => handleDeleteBooking(bookingToDelete.id)} color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'primary.main',
            color: 'common.white',
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Avatar
            sx={{
              bgcolor: 'primary.light',
              width: 40,
              height: 40
            }}
          >
            {selectedBooking?.guestName?.charAt(0) || 'B'}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {selectedBooking?.guestName || 'Booking Details'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {selectedBooking?.guestEmail || ''}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          {selectedBooking && (
            <Box>
              {/* Main Details Card */}
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 0,
                  borderLeft: 0,
                  borderRight: 0,
                  boxShadow: 'none'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    {/* Room Information */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ROOM INFORMATION
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1
                          }}
                        >
                          <DoorFrontIcon color="primary" />
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {selectedBooking.roomType}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Room #{selectedBooking.roomNumber}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Stay Duration */}
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        STAY DURATION
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'secondary.light',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1
                          }}
                        >
                          <CalendarMonthIcon color="secondary" />
                        </Box>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {format(new Date(selectedBooking.arrival), 'MMM dd, yyyy')} -{' '}
                            {format(new Date(selectedBooking.departure), 'MMM dd, yyyy')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {differenceInDays(new Date(selectedBooking.departure), new Date(selectedBooking.arrival))} nights
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Payment Information */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        PAYMENT INFORMATION
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={1.5}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">Total Price:</Typography>
                            <Typography variant="body1" fontWeight={600}>
                              Rp {Number(selectedBooking.totalPayment).toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1">Paid Amount:</Typography>
                            <Typography variant="body1" color="success.main">
                              Rp {Number(selectedBooking.paid_amount).toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                          <Divider />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body1" fontWeight={500}>
                              Remaining:
                            </Typography>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color={selectedBooking.totalPayment - selectedBooking.paid_amount > 0 ? 'error.main' : 'success.main'}
                            >
                              Rp {Number(selectedBooking.totalPayment - selectedBooking.paid_amount).toLocaleString('id-ID')}
                            </Typography>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    {/* Status */}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        BOOKING STATUS
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5
                        }}
                      >
                        {selectedBooking.status === 'confirmed' && (
                          <Chip
                            label="Confirmed"
                            color="success"
                            icon={<CheckCircleIcon />}
                            sx={{
                              px: 1,
                              py: 1.5,
                              fontSize: '0.875rem'
                            }}
                          />
                        )}
                        {selectedBooking.status === 'pending' && (
                          <Chip
                            label="Pending Payment"
                            color="warning"
                            icon={<ScheduleIcon />}
                            sx={{
                              px: 1,
                              py: 1.5,
                              fontSize: '0.875rem'
                            }}
                          />
                        )}
                        {selectedBooking.status === 'cancelled' && (
                          <Chip
                            label="Cancelled"
                            color="error"
                            icon={<CancelIcon />}
                            sx={{
                              px: 1,
                              py: 1.5,
                              fontSize: '0.875rem'
                            }}
                          />
                        )}
                        {!['confirmed', 'pending', 'cancelled'].includes(selectedBooking.status) && (
                          <Chip
                            label="Unknown"
                            color="default"
                            sx={{
                              px: 1,
                              py: 1.5,
                              fontSize: '0.875rem'
                            }}
                          />
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Comments Section */}
              <Box sx={{ p: 3, pt: 0 }}>
                <BookingComments bookingId={selectedBooking.id} readOnly />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: 'grey.50'
          }}
        >
          <Button
            onClick={() => setViewDialogOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none'
            }}
          >
            Close
          </Button>
          <Button
            onClick={() => {
              handleEdit(selectedBooking);
              setViewDialogOpen(false);
            }}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              textTransform: 'none'
            }}
            startIcon={<EditIcon />}
          >
            Edit Booking
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={alertOpen} onClose={() => setAlertOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Notification</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 1 }}>
            {alertMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAlertOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={() => setAlertOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default BookingManagement;
