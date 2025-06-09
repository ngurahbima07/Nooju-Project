import React from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, matchPath } from 'react-router-dom';

import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import IconButton from 'components/@extended/IconButton';
import { handlerDrawerOpen, useGetMenuMaster } from 'api/menu';

export default function NavItem({ item, level, isParents = false, setSelectedID }) {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const downLG = useMediaQuery((theme) => theme.breakpoints.down('lg'));
  const location = useLocation();

  const itemHandler = () => {
    if (downLG) handlerDrawerOpen(false);
    if (isParents && setSelectedID) setSelectedID(item.id);
  };

  const isSelected = matchPath({ path: item.url }, location?.pathname || '') !== null;
  const itemTarget = item.target ? '_blank' : '_self';

  let itemIcon = null;
  try {
    if (item.icon) {
      if (typeof item.icon === 'function') {
        const IconComponent = item.icon;
        itemIcon = <IconComponent style={{ fontSize: drawerOpen ? '1rem' : '1.25rem' }} />;
      } else if (React.isValidElement(item.icon)) {
        itemIcon = item.icon;
      }
    }
  } catch (e) {
    console.warn('Invalid icon for item:', item.title);
  }

  return (
    <ListItemButton
      component={Link}
      to={item.url}
      target={itemTarget}
      selected={isSelected}
      onClick={itemHandler}
      sx={{ pl: drawerOpen ? `${level * 24}px` : 1.5 }}
    >
      {itemIcon && <ListItemIcon>{itemIcon}</ListItemIcon>}
      <ListItemText primary={item.title} />
    </ListItemButton>
  );
}

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  isParents: PropTypes.bool,
  setSelectedID: PropTypes.func
};
