import PropTypes from 'prop-types';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //
// Catatan: menu ini dulunya berisi "Edit Profile", "View Profile", "Social
// Profile", "Billing" dari template -- semuanya dekoratif, tidak ada
// halaman/endpoint di baliknya. Disederhanakan jadi cuma Logout (yang
// benar-benar berfungsi) sampai ada kebutuhan nyata untuk menu profil lain.

export default function ProfileTab({ handleLogout }) {
  return (
    <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
      <ListItemButton onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
    </List>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
