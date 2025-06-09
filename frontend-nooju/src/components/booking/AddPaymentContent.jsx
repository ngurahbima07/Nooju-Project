import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Grid,
  Button,
  IconButton,
  Paper,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PaymentIcon from '@mui/icons-material/Payment';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import QrCodeIcon from '@mui/icons-material/QrCode';
import axios from 'axios';
import { format } from 'date-fns';

const AddPaymentModal = ({ open, onClose, onSubmit, bookingId, totalPrice }) => {
  const [payment, setPayment] = useState({
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    paymentType: 'Transfer',
    paymentAmount: ''
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [payments, setPayments] = useState([]);

  const handleSubmit = async () => {
    if (!payment.paymentDate || !payment.paymentType || !payment.paymentAmount) {
      alert('Mohon lengkapi semua data pembayaran');
      return;
    }

    try {
      const res = await axios.post('http://localhost:8000/api/payments', {
        bookingId,
        paymentDate: payment.paymentDate,
        paymentType: payment.paymentType,
        paymentAmount: payment.paymentAmount
      });

      setPayments([...payments, res.data.data]);
      setPayment((prev) => ({ ...prev, paymentAmount: '' }));
    } catch (error) {
      console.error('Gagal menyimpan pembayaran:', error);
      alert('Terjadi kesalahan saat menyimpan pembayaran');
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedPaymentId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:8000/api/payments/${selectedPaymentId}`);
      setPayments((prev) => prev.filter((p) => p.id !== selectedPaymentId));
      setConfirmOpen(false);
      setSelectedPaymentId(null);
    } catch (err) {
      console.error('❌ Gagal menghapus pembayaran:', err);
      alert('Gagal menghapus pembayaran dari database');
    }
  };

  useEffect(() => {
    if (bookingId) {
      axios
        .get(`http://localhost:8000/api/payments/by-booking/${bookingId}`)
        .then((res) => setPayments(res.data))
        .catch((err) => console.error('❌ Gagal fetch payments:', err));
    }
  }, [bookingId]);

  const totalPaid = payments.reduce((sum, p) => {
    const amount = p?.payment_amount ?? p?.paymentAmount;
    return sum + (amount ? Number(amount) : 0);
  }, 0);

  const isLunas = totalPaid >= totalPrice;

  const renderMethod = (type) => {
    switch (type) {
      case 'Cash':
        return 'Cash';
      case 'Transfer':
        return 'Transfer Bank';
      case 'QRIS':
        return 'QRIS';
      default:
        return type;
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto', px: 2 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2}>
        <PaymentIcon color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight="600">
          Pembayaran Reservasi
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Ringkasan Pembayaran */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Total Tagihan
          </Typography>
          <Typography variant="subtitle1" fontWeight="600">
            Rp {Number(totalPrice || 0).toLocaleString('id-ID')}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="text.secondary">
            Total Dibayar
          </Typography>
          <Box display="flex" alignItems="center">
            <Typography variant="subtitle1" fontWeight="600" sx={{ mr: 1 }}>
              Rp {totalPaid.toLocaleString('id-ID')}
            </Typography>
            <Chip label={isLunas ? 'LUNAS' : 'BELUM LUNAS'} color={isLunas ? 'success' : 'error'} size="small" />
          </Box>
        </Grid>
      </Grid>

      {/* Form Pembayaran */}
      <Typography variant="subtitle2" fontWeight="600" mb={1}>
        Tambah Pembayaran
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Tanggal"
            type="date"
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={payment.paymentDate}
            onChange={(e) => setPayment({ ...payment, paymentDate: e.target.value })}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            select
            label="Metode"
            fullWidth
            size="small"
            value={payment.paymentType}
            onChange={(e) => setPayment({ ...payment, paymentType: e.target.value })}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Transfer">Transfer</MenuItem>
            <MenuItem value="QRIS">QRIS</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            label="Jumlah"
            type="number"
            fullWidth
            size="small"
            value={payment.paymentAmount}
            onChange={(e) => setPayment({ ...payment, paymentAmount: e.target.value })}
          />
        </Grid>
      </Grid>

      <Box textAlign="right" mb={3}>
        <Button variant="contained" onClick={handleSubmit} size="small">
          Simpan Pembayaran
        </Button>
      </Box>

      {/* Daftar Pembayaran */}
      {payments.length > 0 && (
        <Box>
          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            Riwayat Pembayaran
          </Typography>

          <Stack spacing={1}>
            {payments.map((p) => (
              <Paper key={p.id} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2">{format(new Date(p.payment_date || p.paymentDate), 'dd MMM yyyy')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {renderMethod(p.payment_type || p.paymentType)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Typography variant="body2" fontWeight="500" sx={{ mr: 2 }}>
                      Rp {Number(p.payment_amount || p.paymentAmount).toLocaleString('id-ID')}
                    </Typography>
                    <IconButton onClick={() => handleDeleteClick(p.id)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Dialog Konfirmasi Hapus */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>Apakah Anda yakin ingin menghapus pembayaran ini?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Batal</Button>
          <Button onClick={confirmDelete} color="error">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddPaymentModal;
