import React, { useState, useMemo } from 'react';
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
const dummyBookings = [
  {
    id: 'BK001',
    source: 'Booking.com',
    guestName: 'John Smith',
    guestEmail: 'john.smith@email.com',
    roomType: 'Deluxe Suite',
    roomNumber: '101',
    arrival: '2024-06-15',
    departure: '2024-06-18',
    bookedAt: '2024-06-01T10:30:00',
    totalPayment: 450.0,
    paymentMethod: 'credit_card',
    status: 'confirmed',
    notes: 'Requested high floor, non-smoking'
  },
  {
    id: 'BK002',
    source: 'Direct',
    guestName: 'Sarah Johnson',
    guestEmail: 'sarah.j@email.com',
    roomType: 'Standard Room',
    roomNumber: '205',
    arrival: '2024-06-20',
    departure: '2024-06-22',
    bookedAt: '2024-06-05T14:15:00',
    totalPayment: 280.0,
    paymentMethod: 'bank_transfer',
    status: 'pending',
    notes: 'Waiting for payment confirmation'
  },
  {
    id: 'BK003',
    source: 'Expedia',
    guestName: 'Michael Brown',
    guestEmail: 'michael.brown@email.com',
    roomType: 'Executive Suite',
    roomNumber: '301',
    arrival: '2024-06-25',
    departure: '2024-06-28',
    bookedAt: '2024-06-10T09:45:00',
    totalPayment: 720.0,
    paymentMethod: 'credit_card',
    status: 'confirmed',
    notes: 'Anniversary stay - add complimentary champagne'
  },
  {
    id: 'BK004',
    source: 'Airbnb',
    guestName: 'Emily Davis',
    guestEmail: 'emily.davis@email.com',
    roomType: 'Standard Room',
    roomNumber: '102',
    arrival: '2024-06-12',
    departure: '2024-06-14',
    bookedAt: '2024-05-28T16:20:00',
    totalPayment: 180.0,
    paymentMethod: 'cash',
    status: 'cancelled',
    notes: 'Cancelled due to flight changes'
  },
  {
    id: 'BK005',
    source: 'Direct',
    guestName: 'Robert Wilson',
    guestEmail: 'robert.wilson@email.com',
    roomType: 'Premium Suite',
    roomNumber: '402',
    arrival: '2024-07-01',
    departure: '2024-07-05',
    bookedAt: '2024-06-08T11:10:00',
    totalPayment: 960.0,
    paymentMethod: 'credit_card',
    status: 'confirmed',
    notes: 'VIP client - room upgrade approved'
  },
  {
    id: 'BK006',
    source: 'Hotels.com',
    guestName: 'Lisa Anderson',
    guestEmail: 'lisa.anderson@email.com',
    roomType: 'Standard Room',
    roomNumber: '203',
    arrival: '2024-06-30',
    departure: '2024-07-02',
    bookedAt: '2024-06-12T13:55:00',
    totalPayment: 220.0,
    paymentMethod: 'bank_transfer',
    status: 'pending',
    notes: 'Requested late check-out'
  },
  {
    id: 'BK007',
    source: 'Booking.com',
    guestName: 'David Martinez',
    guestEmail: 'david.martinez@email.com',
    roomType: 'Deluxe Suite',
    roomNumber: '103',
    arrival: '2024-06-18',
    departure: '2024-06-21',
    bookedAt: '2024-06-03T08:30:00',
    totalPayment: 540.0,
    paymentMethod: 'credit_card',
    status: 'confirmed',
    notes: 'Allergic to nuts - please note for breakfast'
  }
];

const BookingManagement = () => {
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
    simulateLoading();
    return dummyBookings.filter((booking) => {
      const matchesSearch =
        searchText === '' ||
        booking.guestName.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.guestEmail.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchText.toLowerCase()) ||
        booking.roomNumber.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchText, statusFilter]);

  // Status chip component
  const StatusChip = ({ status }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'confirmed':
          return {
            color: 'success',
            icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
            label: 'Confirmed'
          };
        case 'pending':
          return {
            color: 'warning',
            icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
            label: 'Pending'
          };
        case 'cancelled':
          return {
            color: 'error',
            icon: <CancelIcon sx={{ fontSize: 16 }} />,
            label: 'Cancelled'
          };
        default:
          return {
            color: 'default',
            icon: <ScheduleIcon sx={{ fontSize: 16 }} />,
            label: 'Unknown'
          };
      }
    };

    const config = getStatusConfig(status);
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="filled"
        sx={{
          borderRadius: 1,
          fontWeight: 500,
          width: 100,
          justifyContent: 'flex-start'
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
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" fontWeight="bold" color="primary">
          {params.value}
        </Typography>
      )
    },
    {
      field: 'source',
      headerName: 'Source',
      width: 120,
      renderCell: (params) => <Chip label={params.value} size="small" variant="outlined" color="primary" sx={{ borderRadius: 1 }} />
    },
    {
      field: 'guest',
      headerName: 'Guest',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              bgcolor: theme.palette.primary.main,
              fontSize: 14,
              fontWeight: 500
            }}
          >
            {params.row.guestName.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {params.row.guestName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {params.row.guestEmail}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'room',
      headerName: 'Room',
      minWidth: 160,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={600}>
            {params.row.roomType}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Room {params.row.roomNumber}
          </Typography>
        </Box>
      )
    },
    {
      field: 'dates',
      headerName: 'Dates',
      minWidth: 180,
      flex: 1,
      renderCell: (params) => (
        <Box>
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
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentMethodIcon method={params.row.paymentMethod} />
          <Box>
            <Typography variant="body2" fontWeight={600}>
              ${params.row.totalPayment.toFixed(2)}
            </Typography>
            <Typography variant="caption" color="text.secondary" textTransform="capitalize">
              {params.row.paymentMethod.replace('_', ' ')}
            </Typography>
          </Box>
        </Box>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => <StatusChip status={params.value} />
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={() => handleView(params.row)}
              sx={{
                color: theme.palette.info.main,
                '&:hover': { backgroundColor: theme.palette.info.light }
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
                '&:hover': { backgroundColor: theme.palette.warning.light }
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
                '&:hover': { backgroundColor: theme.palette.error.light }
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
