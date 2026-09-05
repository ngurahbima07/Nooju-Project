import PropTypes from 'prop-types';

// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import LogoIcon from './LogoIcon';

// ==============================|| LOGO MAIN (PLACEHOLDER) ||============================== //
// Placeholder sementara pengganti logo Mantis bawaan template. Ganti dengan
// logo asli Nooju Homestay Pererenan kapan saja -- cukup replace isi
// komponen ini (atau, kalau punya file gambar, import file-nya di sini).

export default function LogoMain({ reverse }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <LogoIcon />
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          letterSpacing: 0.5,
          color: reverse ? 'common.white' : 'text.primary'
        }}
      >
        NOOJU
      </Typography>
    </Stack>
  );
}

LogoMain.propTypes = { reverse: PropTypes.bool };
