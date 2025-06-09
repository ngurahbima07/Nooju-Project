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
    <Box
      sx={{
        p: 4,
        bgcolor: 'background.paper',
        borderRadius: 2,
        maxWidth: 600,
        mx: 'auto',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <PaymentIcon color="primary" sx={{ mr: 1, fontSize: 32 }} />
        <Typography variant="h5" fontWeight="600" color="primary">
          Pembayaran Reservasi
        </Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Ringkasan Pembayaran */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Tagihan
            </Typography>
            <Typography variant="h6" fontWeight="700">
              Rp {Number(totalPrice || 0).toLocaleString('id-ID')}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Total Dibayar
            </Typography>
            <Box display="flex" alignItems="center">
              <Typography variant="h6" fontWeight="700" sx={{ mr: 1 }}>
                Rp {totalPaid.toLocaleString('id-ID')}
              </Typography>
              <Chip
                label={isLunas ? 'LUNAS' : 'BELUM LUNAS'}
                color={isLunas ? 'success' : 'error'}
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Form Pembayaran */}
      <Typography variant="subtitle1" fontWeight="600" mb={2}>
        Tambah Pembayaran Baru
      </Typography>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <TextField
            label="Tanggal Pembayaran"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={payment.paymentDate}
            onChange={(e) => setPayment({ ...payment, paymentDate: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8f9fa'
              }
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            select
            label="Metode Pembayaran"
            fullWidth
            value={payment.paymentType}
            onChange={(e) => setPayment({ ...payment, paymentType: e.target.value })}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8f9fa'
              }
            }}
          >
            <MenuItem value="Cash">
              <Box display="flex" alignItems="center">
                <AttachMoneyIcon sx={{ mr: 1, fontSize: 20 }} />
                Cash
              </Box>
            </MenuItem>
            <MenuItem value="Transfer">
              <Box display="flex" alignItems="center">
                <AccountBalanceIcon sx={{ mr: 1, fontSize: 20 }} />
                Transfer Bank
              </Box>
            </MenuItem>
            <MenuItem value="QRIS">
              <Box display="flex" alignItems="center">
                <QrCodeIcon sx={{ mr: 1, fontSize: 20 }} />
                QRIS
              </Box>
            </MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={4}>
          <TextField
            label="Jumlah Pembayaran"
            type="number"
            fullWidth
            value={payment.paymentAmount}
            onChange={(e) => setPayment({ ...payment, paymentAmount: e.target.value })}
            InputProps={{
              startAdornment: (
                <Typography color="text.secondary" mr={1}>
                  Rp
                </Typography>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                backgroundColor: '#f8f9fa'
              }
            }}
          />
        </Grid>
      </Grid>

      <Box textAlign="right" mb={4}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          size="large"
          sx={{
            px: 4,
            borderRadius: 2,
            fontWeight: '600',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none'
            }
          }}
        >
          Simpan Pembayaran
        </Button>
      </Box>

      {/* Daftar Pembayaran */}
      {payments.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight="600" mb={2}>
            Riwayat Pembayaran
          </Typography>

          <Stack spacing={2}>
            {payments.map((p) => (
              <Paper
                key={p.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)'
                  }
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body1" fontWeight="500">
                      {format(new Date(p.payment_date || p.paymentDate), 'dd MMMM yyyy')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {renderMethod(p.payment_type || p.paymentType)}
                    </Typography>
                  </Box>

                  <Box textAlign="right">
                    <Typography variant="h6" color="primary" fontWeight="700">
                      Rp {Number(p.payment_amount || p.paymentAmount).toLocaleString('id-ID')}
                    </Typography>
                    <IconButton onClick={() => handleDeleteClick(p.id)} sx={{ color: 'error.main' }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            p: 2,
            maxWidth: '400px'
          }
        }}
      >
        <DialogTitle fontWeight="600">Konfirmasi Penghapusan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus pembayaran ini? Data yang sudah dihapus tidak dapat dikembalikan.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
            Batal
          </Button>
          <Button onClick={confirmDelete} variant="contained" color="error" sx={{ borderRadius: 2 }}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AddPaymentModal;
