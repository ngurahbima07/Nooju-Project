import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
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
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import { DeleteOutlined, SaveOutlined, PlusOutlined } from '@ant-design/icons';

import MainCard from 'components/MainCard';
import api from 'api/axios';

function formatCurrency(value) {
  return (Number(value) || 0).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

// ==============================|| HARGA DASAR PER TIPE KAMAR ||============================== //

function RoomPricesSection({ onNotify }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pricing/room-prices');
      setPrices(res.data);
      const nextDrafts = {};
      res.data.forEach((rp) => {
        nextDrafts[rp.id] = rp.base_price;
      });
      setDrafts(nextDrafts);
    } catch (err) {
      onNotify('error', 'Gagal memuat harga dasar kamar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (id) => {
    setSavingId(id);
    try {
      await api.put(`/pricing/room-prices/${id}`, { base_price: drafts[id] });
      onNotify('success', 'Harga dasar berhasil disimpan');
      load();
    } catch (err) {
      onNotify('error', err.response?.data?.message || 'Gagal menyimpan harga dasar');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <MainCard title="Harga Dasar per Tipe Kamar" sx={{ mb: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Harga dasar ini adalah titik awal sebelum dikalikan multiplier okupansi, musiman, dan lead-time.
      </Typography>
      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <Grid container spacing={2}>
          {prices.map((rp) => (
            <Grid item xs={12} sm={6} key={rp.id}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label={rp.room_type}
                  type="number"
                  fullWidth
                  value={drafts[rp.id] ?? ''}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [rp.id]: e.target.value }))}
                  InputProps={{ startAdornment: <Box sx={{ mr: 1 }}>Rp</Box> }}
                />
                <IconButton color="primary" onClick={() => handleSave(rp.id)} disabled={savingId === rp.id}>
                  <SaveOutlined />
                </IconButton>
              </Stack>
            </Grid>
          ))}
        </Grid>
      )}
    </MainCard>
  );
}

// ==============================|| KALENDER MUSIMAN (SEASONS) ||============================== //

function SeasonsSection({ onNotify }) {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', multiplier: 1.3 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pricing/seasons');
      setSeasons(res.data);
    } catch (err) {
      onNotify('error', 'Gagal memuat daftar season');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.start_date || !form.end_date) {
      onNotify('error', 'Nama, tanggal mulai, dan tanggal selesai wajib diisi');
      return;
    }
    setSaving(true);
    try {
      await api.post('/pricing/seasons', form);
      onNotify('success', 'Season berhasil ditambahkan');
      setForm({ name: '', start_date: '', end_date: '', multiplier: 1.3 });
      load();
    } catch (err) {
      const validationErrors = err.response?.data?.errors;
      const firstMessage = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      onNotify('error', firstMessage || err.response?.data?.message || 'Gagal menambahkan season');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/pricing/seasons/${id}`);
      onNotify('success', 'Season berhasil dihapus');
      load();
    } catch (err) {
      onNotify('error', 'Gagal menghapus season');
    }
  };

  return (
    <MainCard title="Kalender Musiman (Season)" sx={{ mb: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Tetapkan periode khusus (mis. Nyepi, libur sekolah, Tahun Baru) dengan multiplier harga sendiri. Kalau tanggal tidak masuk
        season manapun, sistem otomatis pakai aturan akhir pekan (Jumat &amp; Sabtu malam = 1.15x).
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <TextField
            label="Nama Season"
            fullWidth
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
        </Grid>
        <Grid item xs={6} sm={2.5}>
          <TextField
            label="Mulai"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.start_date}
            onChange={(e) => setForm((prev) => ({ ...prev, start_date: e.target.value }))}
          />
        </Grid>
        <Grid item xs={6} sm={2.5}>
          <TextField
            label="Selesai"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={form.end_date}
            onChange={(e) => setForm((prev) => ({ ...prev, end_date: e.target.value }))}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <TextField
            label="Multiplier"
            type="number"
            fullWidth
            inputProps={{ step: 0.05, min: 0.1 }}
            value={form.multiplier}
            onChange={(e) => setForm((prev) => ({ ...prev, multiplier: e.target.value }))}
          />
        </Grid>
        <Grid item xs={6} sm="auto">
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={handleAdd} disabled={saving}>
            Tambah
          </Button>
        </Grid>
      </Grid>

      {loading ? (
        <CircularProgress size={24} />
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Nama</TableCell>
                <TableCell>Mulai</TableCell>
                <TableCell>Selesai</TableCell>
                <TableCell align="right">Multiplier</TableCell>
                <TableCell align="right">Aksi</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {seasons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>Belum ada season yang didefinisikan.</TableCell>
                </TableRow>
              )}
              {seasons.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.start_date}</TableCell>
                  <TableCell>{s.end_date}</TableCell>
                  <TableCell align="right">{s.multiplier}x</TableCell>
                  <TableCell align="right">
                    <IconButton color="error" size="small" onClick={() => handleDelete(s.id)}>
                      <DeleteOutlined />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </MainCard>
  );
}

// ==============================|| SIMULATOR HARGA ||============================== //

function PriceSimulatorSection({ onNotify }) {
  const [roomType, setRoomType] = useState('Standard');
  const [checkIn, setCheckIn] = useState(getToday());
  const [checkOut, setCheckOut] = useState(getTomorrow());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post('/pricing/calculate', {
        room_type: roomType,
        check_in_date: checkIn,
        check_out_date: checkOut
      });
      setResult(res.data);
    } catch (err) {
      onNotify('error', err.response?.data?.message || 'Gagal menghitung simulasi harga');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard title="Simulator Harga">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Coba hitung harga untuk kombinasi tipe kamar dan tanggal tertentu, seolah-olah booking dibuat hari ini.
      </Typography>

      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <TextField select label="Tipe Kamar" fullWidth value={roomType} onChange={(e) => setRoomType(e.target.value)}>
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Superior">Superior</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="Check-in"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <TextField
            label="Check-out"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm="auto">
          <Button variant="contained" onClick={handleCalculate} disabled={loading}>
            {loading ? 'Menghitung...' : 'Hitung Harga'}
          </Button>
        </Grid>
      </Grid>

      {result && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Harga Dasar: <strong>{formatCurrency(result.base_price)}</strong> &middot; {result.total_nights} malam &middot; Total:{' '}
            <strong>{formatCurrency(result.total_price)}</strong>
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Tanggal</TableCell>
                  <TableCell align="right">Okupansi</TableCell>
                  <TableCell align="right">Musiman</TableCell>
                  <TableCell align="right">Lead-Time</TableCell>
                  <TableCell align="right">Harga Malam Ini</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {result.nights.map((n) => (
                  <TableRow key={n.date}>
                    <TableCell>
                      {n.date}
                      {n.is_weekend && <Chip size="small" label="Weekend" sx={{ ml: 1 }} />}
                      {n.is_high_season && <Chip size="small" color="warning" label="High Season" sx={{ ml: 1 }} />}
                    </TableCell>
                    <TableCell align="right">{n.occupancy_multiplier}x</TableCell>
                    <TableCell align="right">{n.seasonal_multiplier}x</TableCell>
                    <TableCell align="right">{n.lead_time_multiplier}x</TableCell>
                    <TableCell align="right">{formatCurrency(n.final_price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </MainCard>
  );
}

// ==============================|| SMART PRICING SETTINGS PAGE ||============================== //

export default function SmartPricingSettings() {
  const [notice, setNotice] = useState(null);

  const handleNotify = (severity, message) => {
    setNotice({ severity, message });
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 1 }}>
        Smart Pricing
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Penentuan harga berbasis aturan (rule-based) dari 3 variabel: okupansi internal, kalender musiman, dan lead-time booking.
      </Typography>

      {notice && (
        <Alert severity={notice.severity} sx={{ mb: 3 }}>
          {notice.message}
        </Alert>
      )}

      <RoomPricesSection onNotify={handleNotify} />
      <SeasonsSection onNotify={handleNotify} />
      <PriceSimulatorSection onNotify={handleNotify} />
    </Box>
  );
}
