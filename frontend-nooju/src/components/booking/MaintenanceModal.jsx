import React from 'react';
import { Modal, Box, Typography, IconButton, TextField, MenuItem, Stack, Grid, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import BuildIcon from '@mui/icons-material/Build';

const MaintenanceModal = ({
  open,
  onClose,
  maintenanceEvent,
  setMaintenanceEvent,
  resources,
  handleAddMaintenance,
  checkRoomAvailability,
  events
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          p: 3,
          bgcolor: 'white',
          borderRadius: 2,
          maxWidth: 600,
          mx: 'auto',
          mt: 10
        }}
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleAddMaintenance();
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Tambah Room Maintenance</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <TextField
            label="Tipe Kamar"
            select
            fullWidth
            required
            value={maintenanceEvent.roomType}
            onChange={(e) =>
              setMaintenanceEvent({
                ...maintenanceEvent,
                roomType: e.target.value,
                room: ''
              })
            }
          >
            <MenuItem value="Standard">Standard</MenuItem>
            <MenuItem value="Superior">Superior</MenuItem>
          </TextField>

          <TextField
            label="Nomor Kamar"
            select
            fullWidth
            required
            disabled={!maintenanceEvent.roomType}
            value={maintenanceEvent.room}
            onChange={(e) =>
              setMaintenanceEvent({
                ...maintenanceEvent,
                room: e.target.value
              })
            }
          >
            <MenuItem value="" disabled>
              Pilih Nomor Kamar
            </MenuItem>
            {resources
              .filter((room) => room.type === maintenanceEvent.roomType)
              .map((room) => {
                const roomNumber = room.title.split(' ')[1];
                const isUnavailable = !checkRoomAvailability(roomNumber, maintenanceEvent.start, maintenanceEvent.end, null, events);

                return (
                  <MenuItem
                    key={room.id}
                    value={roomNumber}
                    disabled={isUnavailable}
                    sx={{ color: isUnavailable ? 'error.main' : 'inherit' }}
                  >
                    {roomNumber} {isUnavailable ? '(Dipakai)' : ''}
                  </MenuItem>
                );
              })}
          </TextField>

          <TextField
            label="Alasan Maintenance"
            fullWidth
            required
            multiline
            rows={3}
            value={maintenanceEvent.reason}
            onChange={(e) =>
              setMaintenanceEvent({
                ...maintenanceEvent,
                reason: e.target.value
              })
            }
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Tanggal Mulai"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={maintenanceEvent.start}
                onChange={(e) =>
                  setMaintenanceEvent({
                    ...maintenanceEvent,
                    start: e.target.value,
                    end: e.target.value >= maintenanceEvent.end ? e.target.value : maintenanceEvent.end
                  })
                }
                inputProps={{
                  min: new Date().toISOString().split('T')[0]
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Tanggal Selesai"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={maintenanceEvent.end}
                onChange={(e) =>
                  setMaintenanceEvent({
                    ...maintenanceEvent,
                    end: e.target.value
                  })
                }
                inputProps={{
                  min: maintenanceEvent.start || new Date().toISOString().split('T')[0]
                }}
                error={new Date(maintenanceEvent.end) < new Date(maintenanceEvent.start)}
                helperText={
                  new Date(maintenanceEvent.end) < new Date(maintenanceEvent.start) ? 'Tanggal selesai harus setelah tanggal mulai' : ''
                }
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            variant="contained"
            color="warning"
            size="large"
            fullWidth
            disabled={!maintenanceEvent.roomType || !maintenanceEvent.room}
            startIcon={<BuildIcon />}
          >
            Simpan Maintenance
          </Button>
        </Stack>
      </Box>
    </Modal>
  );
};

export default MaintenanceModal;
