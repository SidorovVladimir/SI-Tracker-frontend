import React from 'react';
import { Box, Slide } from '@mui/material';
import CreateDevicePage from '../pages/admin/CreateDevicePage';
import EditDevicePage from '../pages/admin/EditDevicePage';
import DeviceCard from '../pages/DeviceCard';

interface DeviceManageSidebarProps {
  viewMode: 'info' | 'create' | 'edit' | null;
  setViewMode: React.Dispatch<
    React.SetStateAction<'info' | 'create' | 'edit' | null>
  >;
  selectedDeviceId: string | null;
  setSelectedDeviceId: React.Dispatch<React.SetStateAction<string | null>>;
  refetchTable: () => void;
}

export const DeviceManageSidebar: React.FC<DeviceManageSidebarProps> = ({
  viewMode,
  setViewMode,
  selectedDeviceId,
  setSelectedDeviceId,
  refetchTable,
}) => {
  // Функция полного закрытия панели (сброс всех стейтов)
  const closeDetails = () => {
    setViewMode(null);
    setSelectedDeviceId(null);
  };

  if (!viewMode) return null;

  return (
    <Box
      sx={{
        width: { xs: '100vw', md: '30%' },
        minWidth: { xs: '100vw', md: 350 },
        height: { xs: '100dvh', md: '100%' },
        position: { xs: 'fixed', md: 'relative' },
        top: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 'auto' },
        borderRadius: 3,
        boxShadow: 4,
        zIndex: { xs: (theme) => theme.zIndex.drawer + 2, md: 1 },
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Slide direction="left" in={!!viewMode} mountOnEnter unmountOnExit>
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 0, md: 3 },
            boxShadow: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',

            pt: { xs: '64px', md: 3 },
            pl: 3,
            pr: 3,
            pb: { xs: '32px', md: 3 },

            overflowY: 'auto',
            height: '100%',
            boxSizing: 'border-box',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {viewMode === 'create' ? (
            <CreateDevicePage
              closeDetails={closeDetails}
              refetchDevice={refetchTable}
            />
          ) : viewMode === 'edit' ? (
            <EditDevicePage
              deviceId={selectedDeviceId!}
              closeDetails={() => setViewMode('info')}
              close={closeDetails}
              refetchDevice={refetchTable}
            />
          ) : (
            <DeviceCard
              deviceId={selectedDeviceId!}
              closeDetails={closeDetails}
              onEdit={() => setViewMode('edit')}
            />
          )}
        </Box>
      </Slide>
    </Box>
  );
};
