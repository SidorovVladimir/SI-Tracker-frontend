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
  refetchTable: () => void; // 🎯 Функция обновления данных в главной таблице
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
      // sx={{
      //   width: { xs: '100%', md: '30%' }, // На мобилках во весь экран, на ПК — 30%
      //   minWidth: { xs: '100%', md: 350 },
      //   position: 'relative',
      //   height: '100%',
      // }}
      sx={{
        width: { xs: '100vw', md: '30%' },
        minWidth: { xs: '100vw', md: 350 },
        height: { xs: '100dvh', md: '100%' },
        position: { xs: 'fixed', md: 'relative' },
        top: { xs: 0, md: 'auto' },
        left: { xs: 0, md: 'auto' },
        zIndex: { xs: (theme) => theme.zIndex.drawer + 2, md: 1 },
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Slide direction="left" in={!!viewMode} mountOnEnter unmountOnExit>
        <Box
          // sx={{
          //   position: 'absolute',
          //   top: 0,
          //   left: 0,
          //   right: 0,
          //   bottom: 0,
          //   display: 'flex',
          //   flexDirection: 'column',
          //   borderRadius: { xs: 0, md: 3 },
          //   boxShadow: 4,
          //   bgcolor: 'background.paper',
          //   border: '1px solid',
          //   borderColor: 'divider',
          //   p: 3,
          //   overflowY: 'auto',
          // }}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: { xs: 0, md: 3 }, // Круглые углы только на десктопе
            boxShadow: 4,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',

            // 🎯 ИСПРАВЛЕНИЕ: На мобилках (xs) делаем верхний внутренний отступ 64px (высота NavBar),
            // чтобы шапка карточки не уезжала под край экрана. На ПК (md) оставляем стандартные 24px (p: 3).
            pt: { xs: '64px', md: 3 },
            pl: 3,
            pr: 3,
            pb: { xs: '32px', md: 3 },

            overflowY: 'auto',
            height: '100%',
            boxSizing: 'border-box',
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
