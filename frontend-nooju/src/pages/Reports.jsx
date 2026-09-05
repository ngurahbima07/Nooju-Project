import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import MainCard from 'components/MainCard';
import api from 'api/axios';

const REPORT_TYPES = [
  { key: 'occupancy', label: 'Occupancy' },
  { key: 'sales', label: 'Sales' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'payment', label: 'Payment' }
];

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

function getFirstDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
}

function getLastDayOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
}

// ==============================|| OCCUPANCY TABLE ||============================== //

function OccupancyTable({ data }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Kamar-Malam Terisi: <strong>{data.total_occupied}</strong> &middot; Tersedia: <strong>{data.total_available}</strong>{' '}
        &middot; Rata-rata Okupansi: <strong>{data.overall_rate}%</strong>
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tanggal</TableCell>
              <TableCell align="right">Terisi</TableCell>
              <TableCell align="right">Tersedia</TableCell>
              <TableCell align="right">Okupansi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.daily.map((day) => (
              <TableRow key={day.date}>
                <TableCell>{day.date}</TableCell>
                <TableCell align="right">{day.occupied}</TableCell>
                <TableCell align="right">{day.available}</TableCell>
                <TableCell align="right">{day.rate}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ==============================|| SALES TABLE ||============================== //

function SalesTable({ data }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Sales: <strong>{formatCurrency(data.total_sales)}</strong> ({data.total_bookings} booking)
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Check-in</TableCell>
              <TableCell>Tamu</TableCell>
              <TableCell>Kamar</TableCell>
              <TableCell align="right">Malam</TableCell>
              <TableCell align="right">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.bookings.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>Tidak ada booking pada periode ini.</TableCell>
              </TableRow>
            )}
            {data.bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.check_in_date}</TableCell>
                <TableCell>{b.guest}</TableCell>
                <TableCell>
                  {b.room_type} - {b.sub_room}
                </TableCell>
                <TableCell align="right">{b.nights}</TableCell>
                <TableCell align="right">{formatCurrency(b.total_price)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ==============================|| REVENUE TABLE ||============================== //

function RevenueTable({ data }) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Revenue: <strong>{formatCurrency(data.total_revenue)}</strong>
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tanggal Bayar</TableCell>
              <TableCell>Tamu</TableCell>
              <TableCell>Metode</TableCell>
              <TableCell align="right">Jumlah</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.payments.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>Tidak ada pembayaran pada periode ini.</TableCell>
              </TableRow>
            )}
            {data.payments.map((p, idx) => (
              <TableRow key={idx}>
                <TableCell>{p.payment_date}</TableCell>
                <TableCell>{p.guest}</TableCell>
                <TableCell>{p.payment_type}</TableCell>
                <TableCell align="right">{formatCurrency(p.payment_amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ==============================|| PAYMENT STATUS TABLE ||============================== //

function PaymentTable({ data }) {
  const statusColor = (status) => {
    if (status === 'Lunas') return 'success';
    if (status === 'Sebagian') return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Tagihan: <strong>{formatCurrency(data.total_billed)}</strong> &middot; Sudah Dibayar:{' '}
        <strong>{formatCurrency(data.total_paid)}</strong> &middot; Outstanding: <strong>{formatCurrency(data.total_outstanding)}</strong>
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tamu</TableCell>
              <TableCell>Kamar</TableCell>
              <TableCell>Check-in</TableCell>
              <TableCell align="right">Total Tagihan</TableCell>
              <TableCell align="right">Sudah Dibayar</TableCell>
              <TableCell align="right">Sisa</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.reservations.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>Tidak ada booking pada periode ini.</TableCell>
              </TableRow>
            )}
            {data.reservations.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.guest}</TableCell>
                <TableCell>{r.room}</TableCell>
                <TableCell>{r.check_in_date}</TableCell>
                <TableCell align="right">{formatCurrency(r.total_price)}</TableCell>
                <TableCell align="right">{formatCurrency(r.paid_amount)}</TableCell>
                <TableCell align="right">{formatCurrency(r.balance_due)}</TableCell>
                <TableCell>
                  <Chip size="small" label={r.status_label} color={statusColor(r.status_label)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

// ==============================|| REPORTS PAGE ||============================== //

export default function Reports() {
  const [tab, setTab] = useState(0);
  const [startDate, setStartDate] = useState(getFirstDayOfMonth());
  const [endDate, setEndDate] = useState(getLastDayOfMonth());
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const reportKey = REPORT_TYPES[tab].key;

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
    setData(null);
    setError('');
  };

  const handleShow = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/reports/${reportKey}`, {
        params: { start_date: startDate, end_date: endDate }
      });
      setData(response.data);
    } catch (err) {
      console.error('Gagal memuat laporan:', err);
      setError(err.response?.data?.message || 'Gagal memuat laporan');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format) => {
    setDownloading(true);
    setError('');
    try {
      const response = await api.get(`/reports/${reportKey}/${format}`, {
        params: { start_date: startDate, end_date: endDate },
        responseType: 'blob'
      });
      const extension = format === 'excel' ? 'xlsx' : 'pdf';
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `laporan-${reportKey}-${startDate}-${endDate}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Gagal mengunduh laporan:', err);
      setError('Gagal mengunduh laporan');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <MainCard title="Laporan Operasional">
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        {REPORT_TYPES.map((rt) => (
          <Tab key={rt.key} label={rt.label} />
        ))}
      </Tabs>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Dari Tanggal"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Sampai Tanggal"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm="auto">
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="contained" onClick={handleShow} disabled={loading}>
              {loading ? 'Memuat...' : 'Tampilkan'}
            </Button>
            <Button variant="outlined" onClick={() => handleDownload('pdf')} disabled={downloading}>
              Download PDF
            </Button>
            <Button variant="outlined" onClick={() => handleDownload('excel')} disabled={downloading}>
              Download Excel
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {loading && <CircularProgress size={24} />}

      {!loading && data && reportKey === 'occupancy' && <OccupancyTable data={data} />}
      {!loading && data && reportKey === 'sales' && <SalesTable data={data} />}
      {!loading && data && reportKey === 'revenue' && <RevenueTable data={data} />}
      {!loading && data && reportKey === 'payment' && <PaymentTable data={data} />}

      {!loading && !data && !error && (
        <Typography color="text.secondary">Pilih periode lalu klik &quot;Tampilkan&quot; untuk melihat laporan.</Typography>
      )}
    </MainCard>
  );
}
