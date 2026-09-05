// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Box from '@mui/material/Box';

// project imports
import Profile from './Profile';
import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //
// Catatan: dulu ada kotak "Search" dekoratif di sini (tidak terhubung ke
// apa pun) dan tombol GitHub yang mengarah ke repo template CodedThemes --
// keduanya dihapus. Pencarian booking yang sebenarnya sudah ada di halaman
// Booking Management.

export default function HeaderContent() {
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));

  return (
    <>
      <Box sx={{ width: '100%' }} />
      <Notification />
      {!downLG && <Profile />}
      {downLG && <MobileSection />}
    </>
  );
}
