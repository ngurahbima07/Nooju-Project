// material-ui
import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO ICON (PLACEHOLDER) ||============================== //
// Placeholder sementara pengganti logo Mantis bawaan template. Ganti dengan
// logo asli Nooju Homestay Pererenan kapan saja -- cukup replace isi
// komponen ini (atau, kalau punya file gambar, import file-nya di sini).

export default function LogoIcon() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: 34,
        height: 34,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        fontWeight: 700,
        fontSize: '1.1rem',
        lineHeight: 1
      }}
    >
      N
    </Box>
  );
}
