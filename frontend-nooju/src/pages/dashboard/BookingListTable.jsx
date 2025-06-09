import { useState } from 'react';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import {
  Box,
  Chip,
  Typography,
  Stack,
  Button,
  TextField,
  InputAdornment,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  LocalHotel as RoomIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as PaymentIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';

const bookings = [
  {
    id: 1,
    bookingId: 'BK-2025-001',
    source: 'Website',
    guest: {
      name: 'Ayu Lestari',
      email: 'ayu@example.com',
      phone: '+62 812 3456 7890'
    },
    room: {
      type: 'Superior',
      number: '102',
      color: '#FBBF24'
    },
    dates: {
      arrival: '2025-04-02',
      departure: '2025-04-05',
      bookedAt: '2025-03-25T10:00:00'
    },
    payment: {
      amount: 2100000,
      currency: 'IDR',
      method: 'Credit Card'
    },
    status: 'Confirmed',
    statusColor: '#22C55E'
  },
  {
    id: 2,
    bookingId: 'BK-2025-002',
    source: 'Travel Agent',
    guest: {
      name: 'Budi Santoso',
      email: 'budi@example.com',
      phone: '+62 813 4567 8901'
    },
    room: {
      type: 'Standard',
      number: '103',
      color: '#86EFAC'
    },
    dates: {
      arrival: '2025-04-03',
      departure: '2025-04-06',
      bookedAt: '2025-03-28T13:15:00'
    },
    payment: {
      amount: 1800000,
      currency: 'IDR',
      method: 'Cash'
    },
    status: 'Pending',
    statusColor: '#FACC15'
  },
  {
    id: 3,
    bookingId: 'BK-2025-003',
    source: 'Mobile App',
    guest: {
      name: 'Clara Wijaya',
      email: 'clara@example.com',
      phone: '+62 811 2233 4455'
    },
    room: {
      type: 'Deluxe',
      number: '104',
      color: '#A78BFA'
    },
    dates: {
      arrival: '2025-04-01',
      departure: '2025-04-04',
      bookedAt: '2025-03-27T09:30:00'
    },
    payment: {
      amount: 2500000,
      currency: 'IDR',
      method: 'Bank Transfer'
    },
    status: 'Checked-in',
    statusColor: '#0EA5E9'
  },
  {
    id: 4,
    bookingId: 'BK-2025-004',
    source: 'Walk-in',
    guest: {
      name: 'Daniel Lee',
      email: 'daniel@example.com',
      phone: '+62 822 3344 5566'
    },
    room: {
      type: 'Executive',
      number: '105',
      color: '#FCA5A5'
    },
    dates: {
      arrival: '2025-04-04',
      departure: '2025-04-08',
      bookedAt: '2025-03-30T15:45:00'
    },
    payment: {
      amount: 3700000,
      currency: 'IDR',
      method: 'PayPal'
    },
    status: 'Cancelled',
    statusColor: '#EF4444'
  },
  {
    id: 5,
    bookingId: 'BK-2025-005',
    source: 'Website',
    guest: {
      name: 'Eka Putri',
      email: 'eka@example.com',
      phone: '+62 821 5566 7788'
    },
    room: {
      type: 'Family',
      number: '106',
      color: '#E5E7EB'
    },
    dates: {
      arrival: '2025-04-05',
      departure: '2025-04-10',
      bookedAt: '2025-03-29T11:00:00'
    },
    payment: {
      amount: 4300000,
      currency: 'IDR',
      method: 'Credit Card'
    },
    status: 'Confirmed',
    statusColor: '#22C55E'
  }
];

const formatCurrency = (amount) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);

const formatDate = (dateStr) => dayjs(dateStr).format('DD MMM YYYY');

const statusIcons = {
  Confirmed: <CheckCircleIcon fontSize="small" />,
  Pending: <AssignmentIcon fontSize="small" />,
  'Checked-in': <RoomIcon fontSize="small" />,
  Cancelled: <DeleteIcon fontSize="small" />
};

const columns = [
  {
    field: 'source',
    headerName: 'Source',
    flex: 0.7,
    renderCell: (params) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Chip
          label={params.value}
          size="small"
          sx={{
            backgroundColor: '#F3F4F6',
            color: '#374151',
            fontWeight: 500,
            borderRadius: 1
          }}
        />
      </Box>
    )
  },

  {
    field: 'guest',
    headerName: 'Guest',
    flex: 1.2,
    renderCell: (params) => (
      <Stack spacing={0.3} justifyContent="center" height="100%">
        <Typography fontWeight={600} noWrap lineHeight={1.1}>
          {params.value.name}
        </Typography>
        <Tooltip title={params.value.email}>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', lineHeight: 1.2 }}>
            {params.value.email}
          </Typography>
        </Tooltip>
      </Stack>
    )
  },
  {
    field: 'room',
    headerName: 'Room',
    flex: 1,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={1}>
        <Avatar
          sx={{
            bgcolor: params.value.color,
            width: 24,
            height: 24,
            fontSize: '0.75rem'
          }}
        >
          {params.value.number}
        </Avatar>
        <Typography noWrap>{params.value.type}</Typography>
      </Stack>
    )
  },
  {
    field: 'arrival',
    headerName: 'Arrival',
    flex: 0.9,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <CalendarIcon fontSize="small" color="action" />
        <Typography noWrap>{formatDate(params.row.dates.arrival)}</Typography>
      </Stack>
    )
  },
  {
    field: 'departure',
    headerName: 'Departure',
    flex: 0.9,
    renderCell: (params) => (
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <CalendarIcon fontSize="small" color="action" />
        <Typography noWrap>{formatDate(params.row.dates.departure)}</Typography>
      </Stack>
    )
  },
  {
    field: 'payment',
    headerName: 'Payment',
    flex: 1,
    minWidth: 150, // Tambahkan minWidth
    renderCell: (params) => (
      <Stack spacing={0} py={0}>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <PaymentIcon fontSize="small" color="action" />
          <Typography
            fontWeight={600}
            noWrap
            sx={{ whiteSpace: 'nowrap' }} // Pastikan tidak wrap
          >
            {formatCurrency(params.value.amount)}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
          {params.value.method}
        </Typography>
      </Stack>
    )
  },
  {
    field: 'status',
    headerName: 'Status',
    flex: 0.8,
    renderCell: (params) => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Chip
          label={params.value}
          icon={statusIcons[params.value]}
          size="small"
          sx={{
            borderRadius: 1,
            backgroundColor: `${params.row.statusColor}20`,
            color: params.row.statusColor,
            fontWeight: 500,
            border: `1px solid ${params.row.statusColor}`,
            '& .MuiChip-icon': {
              color: params.row.statusColor
            }
          }}
        />
      </Box>
    )
  }
];

export default function EnhancedBookingList() {
  const [searchText, setSearchText] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSearchChange = (event) => setSearchText(event.target.value);
  const handleFilterClick = (event) => setFilterAnchorEl(event.currentTarget);
  const handleFilterClose = () => setFilterAnchorEl(null);
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    handleFilterClose();
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.guest.name.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.bookingId.toLowerCase().includes(searchText.toLowerCase()) ||
      booking.room.number.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 1 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
        <Typography variant="h5" fontWeight={700}>
          Booking Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search bookings..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              )
            }}
            value={searchText}
            onChange={handleSearchChange}
            sx={{ width: 300 }}
          />
          <Button variant="outlined" startIcon={<FilterIcon />} onClick={handleFilterClick}>
            Filter
          </Button>
          <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={handleFilterClose}>
            {['all', 'Confirmed', 'Pending', 'Checked-in', 'Cancelled'].map((status) => (
              <MenuItem key={status} onClick={() => handleStatusFilter(status)} selected={statusFilter === status}>
                {status === 'all' ? 'All Statuses' : status}
              </MenuItem>
            ))}
          </Menu>
        </Stack>
      </Stack>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredBookings}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5, 10, 25]}
          disableSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px solid #f0f0f0', py: 1.5 },
            '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f9fafb', fontWeight: 700 },
            '& .MuiDataGrid-footerContainer': { backgroundColor: '#f9fafb' },
            '& .MuiDataGrid-toolbarContainer': { justifyContent: 'flex-end', px: 2 }
          }}
        />
      </Box>
    </Paper>
  );
}
