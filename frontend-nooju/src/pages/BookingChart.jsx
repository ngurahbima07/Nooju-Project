import React, { useState, useRef, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import resourceTimelinePlugin from '@fullcalendar/resource-timeline';
import interactionPlugin from '@fullcalendar/interaction';
import HotelIcon from '@mui/icons-material/Hotel';
import BedIcon from '@mui/icons-material/Bed';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { Snackbar, Alert } from '@mui/material';
import MainCard from 'components/MainCard';
import MaintenanceModal from 'components/booking/MaintenanceModal';
import InputAdornment from '@mui/material/InputAdornment';
import CommentIcon from '@mui/icons-material/Comment';
import PaymentIcon from '@mui/icons-material/Payment';
import { useTheme } from '@mui/material';
import { formatDateIndo } from '../utils/booking';
import Tooltip from '@mui/material/Tooltip';
import AddPaymentContent from 'components/booking/AddPaymentContent';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import api from '../api/axios';
import { calculateTotalPrice, checkRoomAvailability } from '../utils/booking';
import EditBookingModal from 'components/booking/EditBookingModal';
import AddBookingModal from 'components/booking/AddBookingModal';
import '../App.css'; // ✅ Import global CSS di sini saja
import BuildIcon from '@mui/icons-material/Build';
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  TextField,
  IconButton,
  MenuItem,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';

export default function BookingChart() {
  const [events, setEvents] = useState([]);
  const [formErrors, setFormErrors] = useState({
    invalidDateRange: false
  });
  const [newEvent, setNewEvent] = useState({
    open: false,
    firstName: '',
    lastName: '',
    email: '',
    roomType: '',
    subRoom: '',
    ratePlan: '',
    adult: '',
    children: '',
    checkin: '',
    checkout: '',
    totalPrice: 0
  });

  const [openPaymentModal, setOpenPaymentModal] = useState(false);

  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [maintenanceEvent, setMaintenanceEvent] = useState({
    roomType: '',
    room: '',
    reason: '',
    start: '',
    end: ''
  });
  const [filterDate, setFilterDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // ini tetap oke, karena initialDate dari FullCalendar juga akan pakai ini
  });

  const [lockDrag, setLockDrag] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [roomStatus, setRoomStatus] = useState({
    available: 0,
    booked: 0,
    maintenance: 0
  });

  const [isLoading, setIsLoading] = useState({
    resources: true,
    events: true
  });

  const [monthlyOccupancy, setMonthlyOccupancy] = useState(0);
  const [rescheduleInfo, setRescheduleInfo] = useState({
    open: false,
    event: null,
    newStart: '',
    newEnd: '',
    revert: () => {}
  });

  const calendarRef = useRef(null);
  const isProcessingRef = useRef(false);
  const theme = useTheme();
  const [readyToRender, setReadyToRender] = useState(false);
  const [resources, setResources] = useState([]);

  const fetchReservations = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, events: true }));

      const response = await api.get('/reservations');
      console.log('🛎️ Total data dari API:', response.data.length);

      // TAMBAHKAN filter & mapping seperti sebelumnya!
      const filtered = response.data.filter((item) => item.status === 'confirm' || item.status === 'onhold');
      console.log('✅ Booking yang dihitung:', filtered.length);

      filtered.forEach((item) => {
        const checkin = new Date(item.check_in_date);
        const checkout = new Date(item.check_out_date);
        const nights = (checkout - checkin) / (1000 * 60 * 60 * 24);
        console.log(`🧾 ${item.first_name} ${item.last_name}: ${item.check_in_date} → ${item.check_out_date} (${nights} malam)`);
      });
      const formatted = filtered.map((item) => {
        const isUnassigned = !item.sub_room || item.sub_room === 'UNASSIGNED';
        const resourceId = isUnassigned ? 'UNASSIGNED' : `${item.room_type}-${item.sub_room}`;

        return {
          id: String(item.id),
          title: item.is_maintenance ? `Maintenance - ${item.room_type} ${item.sub_room}` : `${item.first_name} ${item.last_name}`,
          start: item.check_in_date,
          end: item.check_out_date,
          resourceId,
          status: item.status,
          extendedProps: item,
          daily_rates: item.daily_rates || [],
          paid_amount: item.paid_amount || 0,
          backgroundColor: item.is_maintenance ? '#ff9800' : !item.sub_room || item.sub_room === 'UNASSIGNED' ? '#bfbfbf' : '#3788D8'
        };
      });

      setEvents(formatted);
      setIsLoading((prev) => ({ ...prev, events: false }));
    } catch (error) {
      if (!axios.isCancel(error)) {
        setIsLoading((prev) => ({ ...prev, events: false }));
        showSnackbar('Gagal memuat data reservasi', 'error');
        console.error('Fetch error:', error);
        setEvents([]);
      }
    }
  };

  // Initialize rooms and resources

  useEffect(() => {
    const initializeResources = () => {
      const rooms = [
        ...Array.from({ length: 4 }, (_, i) => ({
          id: `Standard-${i + 1}`,
          title: `Standard ${i + 1}`,
          type: 'Standard'
        })),
        ...Array.from({ length: 8 }, (_, i) => ({
          id: `Superior-${i + 5}`,
          title: `Superior ${i + 5}`,
          type: 'Superior'
        })),
        {
          id: 'UNASSIGNED',
          title: 'Belum Ditentukan',
          type: 'Unassigned',
          eventColor: '#bfbfbf' // Gray color for unassigned
        }
      ];

      setResources(rooms);
      setIsLoading((prev) => ({ ...prev, resources: false }));
    };

    initializeResources();
  }, []);

  // Fetch events from API
  // Gantikan bagian fetch data dengan ini:
  useEffect(() => {
    const abortController = new AbortController();
    // let isMounted = true;

    // Only fetch if resources are already loaded
    if (!isLoading.resources) {
      fetchReservations();
    }

    return () => {
      // isMounted = false;
      abortController.abort();
    };
  }, [isLoading.resources]); // Add dependency to re-fetch when resources are ready

  // Tambahkan useEffect ini untuk cleanup FullCalendar
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();

    return () => {
      if (calendarApi) {
        // Hancurkan instance calendar dan bersihkan event listeners
        calendarApi.destroy();
      }
    };
  }, []);

  //

  // Live clock
  useEffect(() => {
    let timerId;
    let isActive = true;

    const updateClock = () => {
      if (isActive) {
        setCurrentTime(new Date());
        timerId = setTimeout(updateClock, 1000);
      }
    };

    updateClock(); // Memulai timer

    return () => {
      isActive = false; // Komponen unmounted
      clearTimeout(timerId); // Bersihkan timeout
    };
  }, []);

  // Calculate room status
  useEffect(() => {
    // 🛡️ Cegah perhitungan jika data belum siap
    if (!events.length || !resources.length) return;

    const today = new Date();
    const validRooms = resources.filter((r) => r.id !== 'UNASSIGNED');
    const validRoomIds = new Set(validRooms.map((r) => r.id));

    const bookedRoomsSet = new Set(
      events
        .filter((event) => {
          const checkin = new Date(event.extendedProps?.check_in_date);
          const checkout = new Date(event.extendedProps?.check_out_date);
          const roomId = `${event.extendedProps?.room_type}-${event.extendedProps?.sub_room}`;

          return (
            validRoomIds.has(roomId) &&
            !isNaN(checkin) &&
            !isNaN(checkout) &&
            !event.extendedProps?.isMaintenance &&
            checkin <= today &&
            today < checkout
          );
        })
        .map((event) => `${event.extendedProps?.room_type}-${event.extendedProps?.sub_room}`)
    );

    const bookedRooms = bookedRoomsSet.size;

    const maintenanceRooms = events.filter((event) => {
      if (!(event.extendedProps?.isMaintenance || event.extendedProps?.is_maintenance)) return false;
      const start = new Date(event.start);
      const end = new Date(event.end);
      return start <= today && today < end;
    }).length;

    // console.log('📊 Total Rooms:', validRooms.length);
    // console.log('🏨 Rooms in Use Today:', [...bookedRoomsSet]);
    // console.log('🔧 Maintenance Rooms:', maintenanceRooms);
    // console.log('✅ Available Rooms:', validRooms.length - bookedRooms - maintenanceRooms);

    setRoomStatus({
      available: validRooms.length - bookedRooms - maintenanceRooms,
      booked: bookedRooms,
      maintenance: maintenanceRooms
    });

    // Hitung okupansi bulanan berdasarkan filterDate atau today
    const baseDate = filterDate ? new Date(filterDate) : today;
    const currentMonth = baseDate.getMonth();
    const currentYear = baseDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    let occupiedNights = 0;

    events.forEach((event) => {
      if (event.extendedProps?.isMaintenance) return;

      const rawStart = new Date(event.start);
      const rawEnd = new Date(event.end);

      // Clamp range ke dalam bulan yang dipilih
      const start = rawStart < firstDay ? firstDay : rawStart;
      const end = rawEnd > lastDay ? lastDay : rawEnd;

      const nights = Math.max(0, (end - start) / (1000 * 60 * 60 * 24));
      occupiedNights += nights;
      console.log(`🛌 ${event.title}: ${event.start} → ${event.end}, dihitung ${nights} malam (clamped)`);
    });

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const totalPossibleNights = validRooms.length * daysInMonth;

    const occupancyPercentage = Math.round((occupiedNights / totalPossibleNights) * 100);
    setMonthlyOccupancy(occupancyPercentage);

    // 🔍 DEBUG LOG UNTUK MEMASTIKAN OCCUPANCY
    console.log('🎯 Room Count:', validRooms.length);
    console.log('📆 Days in Month:', daysInMonth);
    console.log('🛏️ Total Possible Nights:', totalPossibleNights);
    console.log('✅ Occupied Nights:', occupiedNights);
    console.log('📈 Occupancy %:', occupancyPercentage);
  }, [events, resources, filterDate]);

  // Hitung harga otomatis lewat Smart Pricing (rule-based: okupansi, musiman,
  // lead-time). Dipakai oleh AddBookingModal & EditBookingModal supaya harga
  // yang tampil di form booking selalu konsisten dengan mesin Smart Pricing
  // di backend, bukan lagi tabel harga flat yang di-hardcode di frontend.
  // Kalau API-nya gagal (mis. koneksi putus), fallback ke harga flat lama
  // (calculateTotalPrice) supaya form booking tetap bisa dipakai.
  const calculateSmartPrice = async (roomType, checkin, checkout, bookingDate) => {
    if (!roomType || !checkin || !checkout) {
      return { total: 0, nights: [] };
    }
    if (new Date(checkout) <= new Date(checkin)) {
      return { total: 0, nights: [] };
    }

    try {
      const payload = {
        room_type: roomType,
        check_in_date: checkin,
        check_out_date: checkout
      };
      if (bookingDate) {
        payload.booking_date = bookingDate;
      }

      const response = await api.post('/pricing/calculate', payload);

      return {
        total: response.data.total_price,
        nights: (response.data.nights || []).map((n) => ({ date: n.date, price: n.final_price }))
      };
    } catch (error) {
      console.error('❌ Gagal menghitung Smart Pricing, pakai harga fallback:', error.response?.data || error.message);
      return { total: calculateTotalPrice(roomType, checkin, checkout), nights: [] };
    }
  };

  // Download invoice untuk satu booking. Dipindahkan ke level komponen (bukan di dalam
  // useEffect) supaya bisa dioper sebagai prop ke EditBookingModal.
  const handleDownloadInvoice = async (bookingId) => {
    try {
      const response = await api.get(`/invoice/${bookingId}`, {
        responseType: 'blob' // Penting untuk handle file download
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      showSnackbar('Invoice berhasil diunduh', 'success');
    } catch (error) {
      console.error('Gagal mengunduh invoice:', error);
      showSnackbar('Gagal mengunduh invoice', 'error');
      throw error; // Re-throw error agar bisa ditangkap di EditBookingModal
    }
  };

  const handleFilterDateChange = (e) => {
    const selected = e.target.value;
    setFilterDate(selected);

    // Gunakan T12:00 agar aman dari pergeseran UTC
    const parsedDate = new Date(`${selected}T12:00:00`);
    if (calendarRef.current && !isNaN(parsedDate)) {
      calendarRef.current.getApi().gotoDate(parsedDate);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const [calendarKey, setCalendarKey] = useState(0); // Tambahkan ini

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleDateClick = (arg) => {
    let roomType = '';
    let subRoom = '';

    if (arg.resource?.id) {
      const parts = arg.resource.id.split('-');
      roomType = parts[0]; // "Standard" atau "Superior"
      subRoom = parts[1]; // "1", "5", dst
    }

    const checkin = arg.dateStr;
    const checkout = new Date(checkin);
    checkout.setDate(checkout.getDate() + 1);

    setNewEvent({
      open: true,
      firstName: '',
      lastName: '',
      email: '',
      roomType,
      subRoom,
      ratePlan: '',
      adult: '',
      children: '',
      checkin,
      checkout: checkout.toISOString().split('T')[0]
    });
  };

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();
    const props = info.event.extendedProps;

    console.log('🧪 extendedProps:', props);

    if (props?.isMaintenance) {
      setSelectedEvent({
        id: info.event.id,
        title: info.event.title,
        start: info.event.startStr,
        end: info.event.endStr,
        reason: props.reason,
        isMaintenance: true,
        subRoom: props.subRoom,
        roomType: props.roomType
      });
    } else {
      setSelectedEvent({
        id: info.event.id,
        title: info.event.title,
        start: info.event.startStr,
        end: info.event.endStr,
        backgroundColor: info.event.backgroundColor,
        firstName: props.first_name,
        lastName: props.last_name,
        email: props.email,
        roomType: props.room_type,
        subRoom: props.sub_room || 'UNASSIGNED',
        ratePlan: props.rate_plan === 'With Breakfast' ? 'Breakfast Included' : props.rate_plan || 'Rooms Only',
        adult: props.adult,
        children: props.children,
        checkin: props.check_in_date,
        checkout: props.check_out_date,
        totalPrice: props.total_price,
        dailyRates: props.daily_rates || [],
        total_price: props.total_price, // ✅ TAMBAHKAN INI
        status: props.status
      });
    }
    setEditMode(false);
  };

  const handleEventDrop = useCallback(
    (info) => {
      if (rescheduleInfo.open || isProcessingRef.current) {
        info.revert();
        return;
      }

      if (lockDrag) {
        info.revert();
        showSnackbar('Fitur drag sedang dikunci.', 'warning');
        return;
      }

      isProcessingRef.current = true;

      const newStart = info.event.startStr;
      const newEnd = info.event.endStr;

      setRescheduleInfo({
        open: true,
        event: info.event,
        newStart,
        newEnd,
        oldStart: info.event.extendedProps.check_in_date,
        oldEnd: info.event.extendedProps.check_out_date,
        revert: () => {
          info.revert();
          isProcessingRef.current = false;
          setRescheduleInfo({ open: false });
        }
      });
    },
    [lockDrag]
  );

  const handleEventResize = (info) => {
    if (rescheduleInfo.open || isProcessingRef.current) {
      info.revert();
      return;
    }

    if (lockDrag) {
      info.revert();
      showSnackbar('Fitur resize sedang dikunci.', 'warning');
      return;
    }

    setRescheduleInfo({
      open: true,
      event: info.event,
      newStart: info.event.startStr,
      newEnd: info.event.endStr,
      revert: info.revert
    });
  };

  const confirmReschedule = useCallback(() => {
    const { event, newStart, newEnd, revert } = rescheduleInfo;

    if (!event?.id) {
      revert?.();
      return;
    }

    const isAvailable = checkRoomAvailability(
      event.extendedProps?.room_type,
      event.extendedProps?.sub_room,
      newStart,
      newEnd,
      event.id,
      events
    );

    if (!isAvailable) {
      showSnackbar(`Kamar ${event.extendedProps.sub_room} tidak tersedia.`, 'error');
      revert?.();
      return;
    }

    showSnackbar('Menyimpan perubahan...');

    api
      .put(`/reservations/${event.id}`, {
        ...event.extendedProps,
        check_in_date: newStart,
        check_out_date: newEnd
      })
      .then((res) => {
        const calendarApi = calendarRef.current?.getApi();
        const updatedEvent = calendarApi?.getEventById(String(event.id));

        if (updatedEvent) {
          updatedEvent.setDates(res.data.check_in_date, res.data.check_out_date);
          updatedEvent.setProp(
            'title',
            res.data.sub_room === 'UNASSIGNED'
              ? `${res.data.first_name} ${res.data.last_name} - Belum Pilih Kamar`
              : `${res.data.first_name} ${res.data.last_name} - ${res.data.room_type} - ${res.data.sub_room}`
          );
          updatedEvent.setProp('backgroundColor', res.data.sub_room === 'UNASSIGNED' ? '#bfbfbf' : '#3788D8');
        }

        setEvents((prev) =>
          prev.map((ev) =>
            ev.id === String(res.data.id)
              ? {
                  ...ev,
                  start: res.data.check_in_date,
                  end: res.data.check_out_date,
                  extendedProps: res.data
                }
              : ev
          )
        );

        showSnackbar(
          `Reservasi berhasil dijadwal ulang ke ${formatDateIndo(res.data.check_in_date)} - ${formatDateIndo(res.data.check_out_date)}.`,
          'success'
        );
      })
      .catch((err) => {
        console.error('Gagal reschedule:', err);
        showSnackbar('Gagal update jadwal!', 'error');
        revert?.();
      })
      .finally(() => {
        isProcessingRef.current = false;
        setRescheduleInfo({ open: false });
      });
  }, [rescheduleInfo]);

  const handleAddComment = () => {
    // buka modal comment / show input
    console.log('Tambah Comment diklik');
  };

  const handleAddPayment = async (paymentData) => {
    try {
      await api.post('/payments', paymentData);

      // 1. Fetch semua pembayaran untuk booking ini
      const res = await api.get(`/payments/by-booking/${paymentData.bookingId}`);

      // 2. Hitung total pembayaran
      const totalPaid = res.data.reduce((sum, payment) => sum + parseFloat(payment.payment_amount), 0);

      // 3. Update event di frontend
      setEvents((prev) =>
        prev.map((event) =>
          event.id === String(paymentData.bookingId)
            ? {
                ...event,
                extendedProps: {
                  ...event.extendedProps,
                  paid_amount: totalPaid // Pastikan menggunakan paid_amount bukan paidAmount
                }
              }
            : event
        )
      );

      showSnackbar('Pembayaran berhasil disimpan!', 'success');
    } catch (error) {
      console.error('Gagal menyimpan pembayaran:', error);
      showSnackbar('Gagal menyimpan pembayaran', 'error');
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleAddEvent = async (eventData, dailyRates) => {
    setIsSubmitting(true);

    const isAvailable = checkRoomAvailability(
      eventData.roomType,
      eventData.subRoom,
      eventData.checkin,
      eventData.checkout,
      null, // excludeId (karena ini booking baru)
      events
    );

    if (!isAvailable) {
      showSnackbar(`Kamar ${eventData.subRoom} tidak tersedia pada tanggal tersebut!`, 'error');
      setIsSubmitting(false);
      return;
    }
    try {
      console.log('✅ dailyRates yang dikirim ke backend:', dailyRates);

      const payload = {
        first_name: eventData.firstName.trim(),
        last_name: eventData.lastName.trim(),
        email: eventData.email?.trim() || null,
        room_type: eventData.roomType,
        sub_room: eventData.subRoom || 'UNASSIGNED',
        rate_plan: eventData.ratePlan === 'With Breakfast' ? 'Breakfast Included' : eventData.ratePlan || 'Rooms Only',
        adult: parseInt(eventData.adult) || 1,
        children: parseInt(eventData.children) || 0,
        check_in_date: eventData.checkin,
        check_out_date: eventData.checkout,
        total_price: parseFloat(eventData.totalPrice) || 0,
        daily_rates: dailyRates, // Kirim dailyRates ke backend
        status: 'confirm' // <-- tambahkan ini
      };

      const response = await api.post('/reservations', payload);

      const newEventData = {
        id: response.data.data.id,
        title: `${response.data.data.first_name} ${response.data.data.last_name}`,
        start: response.data.data.check_in_date,
        end: response.data.data.check_out_date,
        backgroundColor: response.data.data.sub_room === 'UNASSIGNED' ? '#bfbfbf' : '#3788d8',
        resourceId:
          response.data.data.sub_room === 'UNASSIGNED' ? 'UNASSIGNED' : `${response.data.data.room_type}-${response.data.data.sub_room}`,
        extendedProps: {
          ...response.data.data,
          daily_rates: response.data.data.daily_rates // Gunakan data dari response
        }
      };

      await fetchReservations();
      showSnackbar('Reservasi berhasil disimpan!', 'success');
      setNewEvent({ ...eventData, open: false });
    } catch (error) {
      console.error('❌ Gagal menyimpan reservasi:', error.response?.data || error.message, error);
      const validationErrors = error.response?.data?.errors;
      const firstValidationMessage = validationErrors ? Object.values(validationErrors)[0]?.[0] : null;
      const message = firstValidationMessage || error.response?.data?.message || 'Gagal menyimpan reservasi';
      showSnackbar(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEvent = async (updatedData, dailyRates) => {
    setIsSubmitting(true);

    const isAvailable = checkRoomAvailability(
      updatedData.roomType,
      updatedData.subRoom,
      updatedData.checkin,
      updatedData.checkout,
      updatedData.id, // excludeId (booking yang sedang di-edit)
      events
    );

    if (!isAvailable) {
      showSnackbar(`Kamar ${updatedData.subRoom} tidak tersedia pada tanggal baru!`, 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      // Debug log
      console.log('✅ dailyRates yang dikirim ke backend:', dailyRates);
      console.log('📦 updatedData:', updatedData);

      // Validasi ID
      if (!updatedData.id) {
        console.error('❌ ID tidak tersedia pada updatedData');
        showSnackbar('Gagal update: ID tidak tersedia', 'error');
        return;
      }

      const payload = {
        first_name: updatedData.firstName.trim(),
        last_name: updatedData.lastName.trim(),
        email: updatedData.email?.trim() || null,
        room_type: updatedData.roomType,
        sub_room: updatedData.subRoom || 'UNASSIGNED',
        rate_plan: updatedData.ratePlan || 'Rooms Only',
        adult: parseInt(updatedData.adult) || 1,
        children: parseInt(updatedData.children) || 0,
        check_in_date: updatedData.checkin,
        check_out_date: updatedData.checkout,
        total_price: parseFloat(updatedData.totalPrice) || 0,
        daily_rates: dailyRates,
        status: updatedData.status // <-- TAMBAHKAN INI!
      };

      const response = await api.put(`/reservations/${updatedData.id}`, payload);
      // Setelah berhasil update reservasi, fetch ulang pembayaran terbaru
      await api.get(`/payments/by-booking/${updatedData.id}`);

      // Update event lokal
      await fetchReservations();
      showSnackbar('Reservasi berhasil diupdate!', 'success');
      setEditMode(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('❌ Gagal update:', error);
      showSnackbar('Gagal update reservasi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent?.id) {
      showSnackbar('Event tidak valid', 'error');
      return;
    }

    api
      .delete(`/reservations/${selectedEvent.id}`)
      .then(() => {
        setEvents((prev) => prev.filter((event) => event.id !== selectedEvent.id));

        const calendarApi = calendarRef.current?.getApi();
        const eventObj = calendarApi?.getEventById(selectedEvent.id);
        if (eventObj) {
          eventObj.remove();
        }

        showSnackbar('Reservasi berhasil dihapus!');
        setSelectedEvent(null);
        setDeleteConfirm(false);
      })
      .catch((err) => {
        showSnackbar('Gagal update ke backend ❌', 'error');
        console.error('❌ ERROR UPDATE:', err.response?.data || err.message, err);
      });
  };

  const [initialCalendarDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 3);
    return date.toISOString().split('T')[0];
  });

  const handleAddMaintenance = async () => {
    try {
      if (!maintenanceEvent.roomType || !maintenanceEvent.room || !maintenanceEvent.start || !maintenanceEvent.end) {
        showSnackbar('Mohon isi semua field yang diperlukan untuk maintenance.');
        return;
      }

      const { room, start, end } = maintenanceEvent;

      const isAvailable = checkRoomAvailability(maintenanceEvent.roomType, room, start, end, null, events);

      if (!isAvailable) {
        showSnackbar(`Kamar nomor ${room} tidak tersedia pada tanggal tersebut.`, 'error');
        return;
      }

      const payload = {
        room_type: maintenanceEvent.roomType,
        sub_room: maintenanceEvent.room,
        reason: maintenanceEvent.reason,
        start_date: maintenanceEvent.start,
        end_date: maintenanceEvent.end
      };

      const response = await api.post('/maintenance', payload);

      // Tambahkan ke events
      const newMaintenance = {
        id: response.data.data.id,
        title: `Maintenance - ${maintenanceEvent.roomType} ${maintenanceEvent.room}`,
        start: maintenanceEvent.start,
        end: maintenanceEvent.end,
        backgroundColor: '#ff9800', // Orange color for maintenance
        resourceId: `${maintenanceEvent.roomType}-${maintenanceEvent.room}`,
        extendedProps: {
          isMaintenance: true,
          reason: maintenanceEvent.reason,
          roomType: maintenanceEvent.roomType,
          subRoom: maintenanceEvent.room
        }
      };

      setEvents((prev) => [...prev, newMaintenance]);
      setMaintenanceModal(false);
      showSnackbar('Maintenance berhasil ditambahkan!', 'success');
    } catch (error) {
      console.error('Error adding maintenance:', error);
      showSnackbar(`Gagal menambahkan maintenance: ${error.response?.data?.message || error.message}`, 'error');
    }
  };

  const handleDeleteMaintenance = async (id) => {
    try {
      await api.delete(`/maintenance/${id}`);
      setEvents((prev) => prev.filter((event) => event.id !== id));
      showSnackbar('Maintenance berhasil dihapus!', 'success');
    } catch (error) {
      console.error('Error deleting maintenance:', error);
      showSnackbar(`Gagal menghapus maintenance: ${error.message}`, 'error');
    }
  };

  const renderEventContent = (eventInfo) => {
    const eventData = eventInfo.event;
    const isUnassigned = eventData.extendedProps?.sub_room === 'UNASSIGNED' || eventData.resourceId === 'UNASSIGNED';

    // Pastikan menggunakan nama properti yang konsisten (paid_amount atau paidAmount)
    const event = eventInfo.event;
    const paid = parseFloat(event.extendedProps.paid_amount || 0);
    const total = parseFloat(event.extendedProps.total_price || 0);

    const paymentInfo = `💰 Dibayar: Rp ${paid.toLocaleString('id-ID')} / Rp ${total.toLocaleString('id-ID')}`;
    return (
      <Tooltip title={paymentInfo} arrow>
        <Box
          sx={{
            padding: '2px 4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: '12px',
            backgroundColor: isUnassigned ? '#bfbfbf' : eventData.backgroundColor,
            color: isUnassigned ? '#333' : '#fff',
            borderRadius: '2px',
            border: isUnassigned ? '1px dashed #999' : 'none',
            cursor: 'pointer'
          }}
        >
          {isUnassigned ? '⚠️ ' : ''}
          {eventData.title}
        </Box>
      </Tooltip>
    );
  };

  const renderResourceLabel = (resourceInfo) => (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <HotelIcon fontSize="small" sx={{ mr: 1 }} />
      {resourceInfo.resource.title}
    </Box>
  );

  return (
    <>
      <Box sx={{ mb: 4 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Booking Chart
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              p: 1,
              borderRadius: 1
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {currentTime.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 500, ml: 2 }}>
              {currentTime.toLocaleTimeString('id-ID')}
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            mb: 4,
            flexWrap: 'wrap'
          }}
        >
          <MainCard sx={{ p: 2, flex: 1, bgcolor: 'secondary.A100' }} content={false}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  bgcolor: 'success.main',
                  color: 'white',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <HotelIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Rooms Available
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {roomStatus.available}
                </Typography>
              </Box>
            </Box>
          </MainCard>

          <MainCard sx={{ p: 2, flex: 1, bgcolor: 'secondary.A100' }} content={false}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  bgcolor: 'warning.main',
                  color: 'white',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <BedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Rooms Booked
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {roomStatus.booked}
                </Typography>
              </Box>
            </Box>
          </MainCard>

          <MainCard sx={{ p: 2, flex: 1, bgcolor: 'secondary.A100' }} content={false}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <BuildIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  In Maintenance
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {roomStatus.maintenance}
                </Typography>
              </Box>
            </Box>
          </MainCard>

          <MainCard sx={{ p: 2, flex: 1, bgcolor: 'secondary.A100' }} content={false}>
            <Box display="flex" alignItems="center" gap={2}>
              <Box
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  p: 1,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <CalendarMonthIcon fontSize="small" />
              </Box>
              <Box>
                <Typography variant="subtitle2" color="textSecondary">
                  Monthly Occupancy
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {monthlyOccupancy}%
                </Typography>
              </Box>
            </Box>
          </MainCard>
        </Box>

        {/* Controls Section */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            mb: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              type="date"
              label="Filter Tanggal"
              value={filterDate}
              onChange={handleFilterDateChange}
              InputLabelProps={{ shrink: true }}
              size="small"
            />

            <Stack direction="row" spacing={1}>
              <Button
                sx={{
                  backgroundColor: (theme) => theme.palette.primary.light,
                  color: 'white',
                  boxShadow: (theme) => theme.shadows[1],
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: 'white'
                  }
                }}
                onClick={() => calendarRef.current.getApi().prev()}
              >
                ❮
              </Button>

              <Button
                onClick={() => calendarRef.current.getApi().next()}
                sx={{
                  backgroundColor: (theme) => theme.palette.primary.light,
                  color: 'white',
                  boxShadow: (theme) => theme.shadows[1],
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.primary.main,
                    color: 'white'
                  }
                }}
              >
                ❯
              </Button>

              <Button variant="outlined" color="primary" onClick={() => calendarRef.current.getApi().today()}>
                Today
              </Button>
            </Stack>
          </Box>

          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              color="primary"
              onClick={() =>
                setNewEvent({
                  open: true,
                  firstName: '',
                  lastName: '',
                  email: '',
                  roomType: '',
                  subRoom: '',
                  ratePlan: '',
                  adult: '',
                  children: '',
                  checkin: '',
                  checkout: '',
                  totalPrice: 0
                })
              }
            >
              Add Reservasi
            </Button>

            <Button
              variant="contained"
              color={lockDrag ? 'secondary' : 'success'}
              startIcon={lockDrag ? <LockIcon /> : <LockOpenIcon />}
              onClick={() => setLockDrag(!lockDrag)}
            >
              {lockDrag ? 'Unlock Drag' : 'Lock Drag'}
            </Button>

            <Button variant="contained" startIcon={<BuildIcon />} color="warning" onClick={() => setMaintenanceModal(true)}>
              Room Maintenance
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Gantt-Style Calendar */}
      <Box sx={{ mt: 1, height: 'calc(100vh - 300px)' }}>
        {isLoading.resources || isLoading.events ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%'
            }}
          >
            <CircularProgress size={40} />
          </Box>
        ) : (
          <FullCalendar
            key={events.length}
            ref={calendarRef}
            plugins={[resourceTimelinePlugin, interactionPlugin]}
            initialView="customRange"
            initialDate={initialCalendarDate}
            views={{
              customRange: {
                type: 'resourceTimeline',
                duration: { days: 31 },
                buttonText: 'Custom Range'
              }
            }}
            schedulerLicenseKey="GPL-My-Project-Is-Open-Source"
            headerToolbar={false}
            resources={resources}
            events={events}
            resourceAreaWidth="200px"
            resourceAreaHeaderContent="Rooms"
            resourceGroupField="type"
            resourceOrder="type,roomNumber"
            eventContent={renderEventContent}
            resourceLabelContent={renderResourceLabel}
            datesSet={(arg) => {
              const newDate = new Date(arg.start);
              const year = newDate.getFullYear();
              const month = String(newDate.getMonth() + 1).padStart(2, '0');
              const day = String(newDate.getDate()).padStart(2, '0');
              const isoLocal = `${year}-${month}-${day}`;
              setFilterDate(isoLocal);
            }}
            slotLabelFormat={[
              { month: 'long', year: 'numeric' },
              { day: 'numeric', weekday: 'short' }
            ]}
            datesAboveResources={true}
            editable={!lockDrag}
            selectable={true}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            nowIndicator={true}
            stickyHeaderDates={true}
            height="100%"
          />
        )}
      </Box>

      {/* Reschedule Confirmation Modal */}
      <Dialog
        open={rescheduleInfo.open}
        onClose={() => {
          rescheduleInfo.revert?.();
          isProcessingRef.current = false;
          setRescheduleInfo({ open: false });
        }}
      >
        <DialogTitle>Konfirmasi Reschedule</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>Anda yakin ingin memindahkan booking ini?</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography>
              <strong>Tanggal Lama:</strong> {formatDate(rescheduleInfo.oldStart)}
            </Typography>
            <Typography>
              <strong>Tanggal Baru:</strong> {formatDate(rescheduleInfo.newStart)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              rescheduleInfo.revert();
              setRescheduleInfo({ ...rescheduleInfo, open: false });
            }}
          >
            Batal
          </Button>
          <Button variant="contained" onClick={confirmReschedule} color="primary">
            Konfirmasi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Reservation Modal */}
      <EditBookingModal
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        editMode={editMode}
        setEditMode={setEditMode}
        resources={resources}
        handleUpdateEvent={handleUpdateEvent}
        setDeleteConfirm={setDeleteConfirm}
        calculateSmartPrice={calculateSmartPrice}
        checkRoomAvailability={checkRoomAvailability}
        handleAddComment={handleAddComment}
        handleAddPayment={handleAddPayment}
        events={events}
        onClose={() => setSelectedEvent(null)} // ✅ TAMBAHKAN INI
        fetchReservations={fetchReservations} // <-- Tambahkan ini!
        onDownloadInvoice={handleDownloadInvoice}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm} onClose={() => setDeleteConfirm(false)}>
        <DialogTitle>Konfirmasi Hapus Event</DialogTitle>
        <DialogContent>
          <Typography>Apakah Anda yakin ingin menghapus {selectedEvent?.isMaintenance ? 'Maintenance' : 'Reservasi'} ini?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(false)}>Batal</Button>
          <Button color="error" variant="contained" onClick={handleDeleteEvent}>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
      {/* Maintenance Modal */}
      <MaintenanceModal
        open={maintenanceModal}
        onClose={() => setMaintenanceModal(false)}
        maintenanceEvent={maintenanceEvent}
        setMaintenanceEvent={setMaintenanceEvent}
        resources={resources}
        handleAddMaintenance={handleAddMaintenance}
        checkRoomAvailability={checkRoomAvailability}
        events={events}
      />

      {/* Add Booking Modal */}
      <AddBookingModal
        open={newEvent.open}
        onClose={() => setNewEvent({ ...newEvent, open: false })}
        newEvent={newEvent}
        setNewEvent={setNewEvent}
        onSave={handleAddEvent}
        formErrors={formErrors}
        setFormErrors={setFormErrors}
        resources={resources}
        checkRoomAvailability={checkRoomAvailability}
        calculateSmartPrice={calculateSmartPrice}
        events={events}
      />

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

