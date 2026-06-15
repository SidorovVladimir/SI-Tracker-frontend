import React from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Paper, Container } from '@mui/material';
import DeviceCard from './DeviceCard';

export const MobileDevicePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return <Box p={3}>Идентификатор СИ не указан</Box>;

  return (
    <Container
      maxWidth="sm"
      disableGutters
      sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}
    >
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: { xs: 0, sm: 2 },
          minHeight: '100vh',
        }}
      >
        <DeviceCard
          deviceId={id}
          // Заглушки для пропсов, так как на мобильной странице нет кнопок закрытия/редактирования
          closeDetails={() => navigate(-1)}
          onEdit={() =>
            console.log('Редактирование на мобильных устройствах отключено')
          }
        />
      </Paper>
    </Container>
  );
};
