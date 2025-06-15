import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
  LinearProgress
} from '@mui/material';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
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
  Refresh as RefreshIcon
} from '@mui/icons-material';

// Enhanced dummy data with more realistic information

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:8000/api/reservations');

        const mapped = res.data.map((r) => ({
          id: r.id,
          source: 'Direct',
          guestName: `${r.first_name} ${r.last_name}`,
          guestEmail: r.email || '-',
          roomType: r.room_type,
          roomNumber: r.sub_room,
          arrival: r.check_in_date,
          departure: r.check_out_date,
          bookedAt: r.created_at,
          totalPayment: parseFloat(r.total_price),
          paymentMethod: 'cash',
          status: r.status || 'confirmed',
          notes: ''
        }));

        setBookings(mapped);
      } catch (error) {
        console.error('❌ Gagal fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Simulate loading
  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 800);
  };

  // Filter bookings based on search and status
  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const matchesSearch =
        searchText === '' ||
        booking.guestName.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.id.toString().toLowerCase().includes(searchText.toLowerCase()) ||
        booking.roomNumber?.toString().toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter, bookings]);

  // Status chip component
  const StatusChip = ({ status }) => {
    // Pastikan status lowercase agar konsisten
    const normalized = (status || '').toLowerCase();

    const config = {
      confirmed: {
        color: 'success',
        icon: <CheckCircleIcon sx={{ fontSize: 16, mb: '2px' }} />,
        label: 'Confirmed'
      },
      pending: {
        color: 'warning',
        icon: <ScheduleIcon sx={{ fontSize: 16, mb: '2px' }} />,
        label: 'Pending'
      },
      cancelled: {
        color: 'error',
        icon: <CancelIcon sx={{ fontSize: 16, mb: '2px' }} />,
        label: 'Cancelled'
      },
      canceled: {
        // jaga-jaga untuk typo di backend
        color: 'error',
        icon: <CancelIcon sx={{ fontSize: 16, mb: '2px' }} />,
        label: 'Cancelled'
      },
      unassigned: {
        color: 'info',
        icon: <ScheduleIcon sx={{ fontSize: 16, mb: '2px' }} />,
        label: 'Unassigned'
      }
    }[normalized] || {
      color: 'default',
      icon: <ScheduleIcon sx={{ fontSize: 16, mb: '2px' }} />,
      label: normalized.charAt(0).toUpperCase() + normalized.slice(1)
    };

    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
        sx={{
          borderRadius: 2,
          fontWeight: 500,
          px: 1.5,
          minWidth: 100,
          justifyContent: 'flex-start',
          textTransform: 'capitalize',
          height: 28,
          display: 'flex',
          alignItems: 'center'
        }}
      />
    );
  };

  // Payment method icon component
  const PaymentMethodIcon = ({ method }) => {
    switch (method) {
      case 'credit_card':
        return <CreditCardIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />;
      case 'bank_transfer':
        return <BankIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />;
      case 'cash':
        return <CashIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />;
      default:
        return <PaymentIcon sx={{ fontSize: 18, color: theme.palette.grey[500] }} />;
    }
  };

  // Handle action clicks
  const handleView = (booking) => {
    setSelectedBooking(booking);
    setViewDialogOpen(true);
  };

  const handleEdit = (booking) => {
    setAlertMessage(`Edit booking for ${booking.guestName} (${booking.id})`);
    setAlertOpen(true);
  };

  const handleDelete = (booking) => {
    setAlertMessage(`Delete booking for ${booking.guestName} (${booking.id})`);
    setAlertOpen(true);
  };

  const handleAddNew = () => {
    setAlertMessage('Add new booking clicked');
    setAlertOpen(true);
  };

  const handleRefresh = () => {
    simulateLoading();
    setAlertMessage('Data refreshed successfully');
    setAlertOpen(true);
  };

  // Custom toolbar with improved layout
  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <Box sx={{ p: 2, width: '100%' }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', md: 'center' }}>
            <TextField
              size="small"
              placeholder="Search bookings..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  width: { xs: '100%', md: 280 }
                }
              }}
              sx={{ minWidth: { xs: '100%', md: 280 } }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)} sx={{ borderRadius: 2 }}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1, ml: { xs: 0, md: 'auto' } }}>
              <Tooltip title="Refresh data">
                <IconButton onClick={handleRefresh} size="small">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                size="small"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { boxShadow: 'none' }
                }}
              >
                New Booking
              </Button>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5 }}>
                <GridToolbarColumnsButton />
                <GridToolbarFilterButton />
                <GridToolbarDensitySelector />
                <GridToolbarExport />
              </Box>
            </Box>
          </Stack>
        </Box>
      </GridToolbarContainer>
    );
  };

  // Define columns with improved styling
  const columns = [
    {
      field: 'id',
      headerName: 'Booking ID',
      minWidth: 90,
      width: 110,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography
            variant="body2"
            fontWeight="bold"
            color="primary"
            noWrap
            sx={{
              textAlign: 'center',
              letterSpacing: 1
            }}
          >
            {params.value}
          </Typography>
        </Box>
      )
    },
    {
      field: 'source',
      headerName: 'Source',
      minWidth: 90,
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Chip label={params.value} size="small" variant="outlined" color="primary" sx={{ borderRadius: 1 }} />
        </Box>
      )
    },
    {
      field: 'guest',
      headerName: 'Guest',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            py: 1
          }}
        >
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {params.row.guestName.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {params.row.guestName}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: 'block',
                textOverflow: 'ellipsis'
              }}
            >
              {params.row.guestEmail}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'dates',
      headerName: 'Dates',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 1
          }}
        >
          <Typography variant="body2">
            <Box component="span" fontWeight={600}>
              Arr:
            </Box>{' '}
            {new Date(params.row.arrival).toLocaleDateString()}
          </Typography>
          <Typography variant="body2">
            <Box component="span" fontWeight={600}>
              Dep:
            </Box>{' '}
            {new Date(params.row.departure).toLocaleDateString()}
          </Typography>
        </Box>
      )
    },
    {
      field: 'payment',
      headerName: 'Payment',
      minWidth: 170,
      flex: 0.9,
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            py: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentMethodIcon method={params.row.paymentMethod} />
            <Typography variant="body2" fontWeight={700} noWrap>
              {params.row.totalPayment.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0
              })}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" textTransform="capitalize" noWrap>
            {params.row.paymentMethod.replace('_', ' ')}
          </Typography>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      minWidth: 120,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <StatusChip status={params.value} />
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5
          }}
        >
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={() => handleView(params.row)}
              sx={{
                color: theme.palette.info.main,
                '&:hover': { backgroundColor: theme.palette.info.lighter }
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit booking">
            <IconButton
              size="small"
              onClick={() => handleEdit(params.row)}
              sx={{
                color: theme.palette.warning.main,
                '&:hover': { backgroundColor: theme.palette.warning.lighter }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete booking">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row)}
              sx={{
                color: theme.palette.error.main,
                '&:hover': { backgroundColor: theme.palette.error.lighter }
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`
      }}
    >
      <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="h5" fontWeight={700} color="text.primary">
          Booking Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and track all reservations and guest information
        </Typography>
      </Box>

      <DataGrid
        rows={filteredBookings}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 25]}
        pagination
        disableSelectionOnClick
        loading={loading}
        components={{
          Toolbar: CustomToolbar,
          LoadingOverlay: LinearProgress
        }}
        sx={{
          border: 0,
          '& .MuiDataGrid-cell': {
            borderBottom: `1px solid ${theme.palette.divider}`
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: theme.palette.grey[50],
            borderBottom: `2px solid ${theme.palette.divider}`
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: theme.palette.action.hover
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: `2px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.grey[50]
          },
          '& .MuiDataGrid-toolbarContainer': {
            padding: 0
          },
          '& .MuiDataGrid-virtualScroller': {
            minHeight: '300px'
          }
        }}
      />

      {/* Booking Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.common.white,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <ViewIcon />
          Booking Details
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Booking ID:
                  </Typography>
                  <Typography variant="body1">{selectedBooking.id}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Guest:
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">{selectedBooking.guestName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedBooking.guestEmail}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Room:
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">{selectedBooking.roomType}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Room {selectedBooking.roomNumber}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Dates:
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">
                      {new Date(selectedBooking.arrival).toLocaleDateString()} - {new Date(selectedBooking.departure).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.floor((new Date(selectedBooking.departure) - new Date(selectedBooking.arrival)) / (1000 * 60 * 60 * 24))} nights
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Payment:
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body1">${selectedBooking.totalPayment.toFixed(2)}</Typography>
                    <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                      {selectedBooking.paymentMethod.replace('_', ' ')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Status:
                  </Typography>
                  <Box>
                    <StatusChip status={selectedBooking.status} />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Notes:
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, p: 1.5, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
                    {selectedBooking.notes || 'No special requests'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setViewDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Close
          </Button>
          <Button
            onClick={() => {
              handleEdit(selectedBooking);
              setViewDialogOpen(false);
            }}
            variant="contained"
            sx={{ borderRadius: 2 }}
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
    </Paper>
  );
};

export default BookingManagement;
