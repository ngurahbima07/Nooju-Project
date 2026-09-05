import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import api from 'api/axios';

// assets
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import LoginOutlined from '@ant-design/icons/LoginOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import ToolOutlined from '@ant-design/icons/ToolOutlined';

// sx styles
const avatarSX = {
  width: 36,
  height: 36,
  fontSize: '1rem'
};

// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //
// Catatan: dulu isinya notifikasi palsu (ulang tahun, komentar, undangan
// meeting) dari template. Sekarang menampilkan hal yang sungguh relevan
// untuk homestay ini: check-in, check-out, dan kamar maintenance hari ini.

export default function Notification() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    let isMounted = true;

    api
      .get('/dashboard/summary')
      .then((response) => {
        if (!isMounted) return;
        const data = response.data;
        const list = [
          ...(data.checkins_today || []).map((item) => ({
            type: 'checkin',
            text: `Tamu ${item.guest} check-in hari ini – ${item.room}`
          })),
          ...(data.checkouts_today || []).map((item) => ({
            type: 'checkout',
            text: `Tamu ${item.guest} check-out hari ini – ${item.room}`
          })),
          ...(data.maintenance_today || []).map((item) => ({
            type: 'maintenance',
            text: `${item.room} sedang maintenance${item.reason ? ` (${item.reason})` : ''}`
          }))
        ];
        setItems(list);
      })
      .catch((err) => {
        console.error('Gagal memuat notifikasi:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const unreadCount = read ? 0 : items.length;

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconFor = (type) => {
    if (type === 'checkin') return { icon: <LoginOutlined />, color: 'success' };
    if (type === 'checkout') return { icon: <LogoutOutlined />, color: 'primary' };
    return { icon: <ToolOutlined />, color: 'warning' };
  };

  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={(theme) => ({
          color: 'text.primary',
          bgcolor: open ? 'grey.100' : 'transparent',
          ...theme.applyStyles('dark', { bgcolor: open ? 'background.default' : 'transparent' })
        })}
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notification-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={unreadCount} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>
      <Popper
        placement={downMD ? 'bottom' : 'bottom-end'}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [downMD ? -5 : 0, 9] } }] }}
      >
        {({ TransitionProps }) => (
          <Transitions type="grow" position={downMD ? 'top' : 'top-right'} in={open} {...TransitionProps}>
            <Paper sx={(theme) => ({ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } })}>
              <ClickAwayListener onClickAway={handleClose}>
                <MainCard
                  title="Notifikasi Hari Ini"
                  elevation={0}
                  border={false}
                  content={false}
                  secondary={
                    <>
                      {unreadCount > 0 && (
                        <Tooltip title="Tandai semua sudah dibaca">
                          <IconButton color="success" size="small" onClick={() => setRead(true)}>
                            <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </>
                  }
                >
                  <List
                    component="nav"
                    sx={{
                      p: 0,
                      '& .MuiListItemButton-root': {
                        py: 1,
                        px: 2,
                        '& .MuiAvatar-root': avatarSX
                      }
                    }}
                  >
                    {items.length === 0 && (
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="body2" color="text.secondary">
                              Tidak ada notifikasi hari ini.
                            </Typography>
                          }
                        />
                      </ListItem>
                    )}
                    {items.map((item, idx) => {
                      const { icon, color } = iconFor(item.type);
                      return (
                        <ListItem key={idx} component={ListItemButton} divider>
                          <ListItemAvatar>
                            <Avatar sx={{ color: `${color}.main`, bgcolor: `${color}.lighter` }}>{icon}</Avatar>
                          </ListItemAvatar>
                          <ListItemText primary={<Typography variant="body2">{item.text}</Typography>} />
                        </ListItem>
                      );
                    })}
                    <ListItemButton
                      sx={{ textAlign: 'center', py: `${12}px !important` }}
                      onClick={() => {
                        setOpen(false);
                        navigate('/booking-chart');
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="primary">
                            Lihat Booking Chart
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </List>
                </MainCard>
              </ClickAwayListener>
            </Paper>
          </Transitions>
        )}
      </Popper>
    </Box>
  );
}
