export const calculateTotalPrice = (roomType, checkin, checkout) => {
  const roomPrices = {
    Standard: 500000,
    Superior: 750000
  };

  if (!roomType || !checkin || !checkout) return 0;

  const checkinDate = new Date(checkin);
  const checkoutDate = new Date(checkout);
  const nightCount = Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24));

  return nightCount > 0 ? nightCount * (roomPrices[roomType] || 0) : 0;
};

export const checkRoomAvailability = (roomType, subRoom, checkin, checkout, excludeId, events) => {
  if (!events || !Array.isArray(events)) return true;
  if (!subRoom || subRoom === 'UNASSIGNED') return true;

  const newStart = new Date(checkin);
  const newEnd = new Date(checkout);

  return !events.some((event) => {
    const ev = event.extendedProps || {};
    const isSameRoom = String(ev.sub_room) === String(subRoom) && String(ev.room_type) === String(roomType);
    console.log('🔍 ROOM MATCH?', { isSameRoom, subRoom, evSubRoom: ev.sub_room, roomType, evRoomType: ev.room_type });
    const isExcluded = excludeId && String(event.id) === String(excludeId);

    if (!isSameRoom || isExcluded) return false;

    const eventStart = new Date(ev.check_in_date || ev.start_date);
    const eventEnd = new Date(ev.check_out_date || ev.end_date);

    // Periksa tumpang tindih tanggal (termasuk kasus edge)

    console.log({ roomType, subRoom, checkin, checkout, excludeId });
    console.log('EVENTS:', events);
    return (
      (newStart >= eventStart && newStart < eventEnd) || // Mulai di tengah booking lain
      (newEnd > eventStart && newEnd <= eventEnd) || // Berakhir di tengah booking lain
      (newStart <= eventStart && newEnd >= eventEnd) // Meliputi seluruh booking lain
    );
  });
};

/// format date

export const formatDateIndo = (tanggal) => {
  if (!tanggal) return '-';
  return new Date(tanggal).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
