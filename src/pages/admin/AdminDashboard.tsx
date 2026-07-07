import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogContent,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';

import { GetAdminDashboardStatsDocument } from '../../graphql/types/__generated__/graphql';
import EditDevicePage from './EditDevicePage';

export const AdminDashboard: React.FC = () => {
  const [editingDeviceId, setEditingDeviceId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery(
    GetAdminDashboardStatsDocument,
    {
      fetchPolicy: 'network-only',
    }
  );

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Ошибка загрузки панели: {error.message}
      </Alert>
    );

  const response = data?.getAdminDashboardStats || ({} as any);
  const stats = response?.stats;
  const rawAnomalies = response?.anomalies || {};

  const anomalies = {
    missingMpi: Array.from(
      new Map(
        (rawAnomalies.missingMpi || []).map((d: any) => [d.id, d])
      ).values()
    ),
    missingControlType: Array.from(
      new Map(
        (rawAnomalies.missingControlType || []).map((d: any) => [d.id, d])
      ).values()
    ),
    missingHistory: Array.from(
      new Map(
        (rawAnomalies.missingHistory || []).map((d: any) => [d.id, d])
      ).values()
    ),
    statusMismatch: Array.from(
      new Map(
        (rawAnomalies.statusMismatch || []).map((d: any) => [d.id, d])
      ).values()
    ),
  };

  const handleDeviceClick = (e: React.MouseEvent<HTMLElement>, id: string) => {
    if (e.currentTarget) {
      e.currentTarget.blur(); // Убираем фокус с элемента бэкграунда
    }
    setEditingDeviceId(id);
  };
  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2, md: 3 },
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ================= ПАНЕЛЬ ЗАГОЛОВКА ЭКРАНА ================= */}
      <Box sx={{ mb: 4, px: 0.5 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            mb: 0.5,
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            color: 'text.primary',
          }}
        >
          ⚙️ Панель системного администрирования НСИ
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: '0.875rem' }}
        >
          Инженерный центр контроля базы данных. Отслеживайте объемы
          справочников и оперативно исправляйте метрологические аномалии учета
          СИ.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* ================= РАЗДЕЛ 1: АДАПТИВНЫЕ КАРТОЧКИ ОБЪЕМОВ НСИ ================= */}
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.02)',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  letterSpacing: '0.5px',
                }}
              >
                <StorageIcon fontSize="small" color="primary" /> НАПОЛНЕННОСТЬ
                НОРМАТИВНО-СПРАВОЧНОЙ ИНФОРМАЦИИ (НСИ)
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    label: 'Парк оборудования (СИ / ИО)',
                    count: stats?.devices,
                    color: 'primary.main',
                  },
                  {
                    label: 'Учетные записи сотрудников',
                    count: stats?.users,
                    color: 'info.main',
                  },
                  {
                    label: 'Юридические лица (Компании)',
                    count: stats?.companies,
                    color: 'secondary.main',
                  },
                  {
                    label: 'Производственные участки (Цеха)',
                    count: stats?.sites,
                    color: 'success.main',
                  },
                  {
                    label: 'Государственные эталоны (ГЭТ)',
                    count: stats?.standards,
                    color: 'warning.main',
                  },
                  {
                    label: 'Загруженные тарифы прейскурантов',
                    count: stats?.tariffs,
                    color: 'text.primary',
                  },
                ].map((stat, idx) => (
                  <Grid key={idx} size={{ xs: 6, sm: 4, md: 2 }}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'grey.50',
                        borderRadius: 2.5,
                        border: '1px solid',
                        borderColor: 'grey.200',
                        height: '100%',
                        minHeight: 90,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 900,
                          color: stat.color,
                          mb: 0.5,
                          fontSize: { xs: '1.3rem', sm: '1.5rem' },
                        }}
                      >
                        {stat?.count?.toLocaleString('ru-RU') || 0}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 600,
                          display: 'block',
                          lineHeight: 1.2,
                          wordBreak: 'break-word',
                          fontSize: '0.72rem',
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        {/* ================= РАЗДЕЛ 2: ОПЕРАТИВНЫЙ КОНТРОЛЬ НА ВСЮ ШИРИНУ ЭКРАНА ================= */}
        <Grid size={{ xs: 12 }}>
          <Card
            variant="outlined"
            sx={{
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0,0,0,0.02)',
              bgcolor: 'background.paper',
            }}
          >
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  mb: 2.5,
                  color: 'text.secondary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  letterSpacing: '0.5px',
                }}
              >
                <ErrorOutlineIcon fontSize="small" color="warning" />{' '}
                ОПЕРАТИВНЫЙ КОНТРОЛЬ КОРРЕКТНОСТИ И ЛОГИКИ УЧЕТА СИ
              </Typography>

              <Stack spacing={1.5}>
                {/* 1. АНОМАЛИЯ: Нет МПИ */}
                <Accordion
                  disableGutters
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    p: 0.5,
                    borderColor:
                      (anomalies?.missingMpi?.length || 0) > 0
                        ? 'warning.light'
                        : 'divider',
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        pr: { xs: 1, sm: 3 },
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: { xs: '0.825rem', sm: '0.875rem' },
                        }}
                      >
                        ⚠️ Пропуск межповерочного интервала (МПИ)
                      </Typography>
                      <Chip
                        label={`${anomalies?.missingMpi?.length || 0} СИ`}
                        size="small"
                        color={
                          (anomalies?.missingMpi?.length || 0) > 0
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      p: 0,
                      bgcolor: 'grey.50',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <List dense disablePadding>
                      {anomalies?.missingMpi?.map((dev: any) => (
                        <ListItemButton
                          key={dev.id}
                          onClick={(e) => handleDeviceClick(e, dev.id)}
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: 'grey.200',
                            py: 1.2,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BuildIcon fontSize="small" color="disabled" />
                          </ListItemIcon>
                          <ListItemText
                            primary={dev.name}
                            secondary={`Модель: ${dev.model} | Зав. №: ${dev.serialNumber}`}
                            slotProps={{
                              primary: { fontWeight: 600, variant: 'body2' },
                              secondary: { variant: 'caption' },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* 2. АНОМАЛИЯ: Нет типа контроля */}
                <Accordion
                  disableGutters
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    p: 0.5,
                    borderColor:
                      (anomalies?.missingControlType?.length || 0) > 0
                        ? 'warning.light'
                        : 'divider',
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        pr: { xs: 1, sm: 3 },
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: { xs: '0.825rem', sm: '0.875rem' },
                        }}
                      >
                        ⚠️ Актуальная поверка внесена, но тип контроля пуст
                        (NULL)
                      </Typography>
                      <Chip
                        label={`${
                          anomalies?.missingControlType?.length || 0
                        } СИ`}
                        size="small"
                        color={
                          (anomalies?.missingControlType?.length || 0) > 0
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      p: 0,
                      bgcolor: 'grey.50',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <List dense disablePadding>
                      {anomalies?.missingControlType?.map((dev: any) => (
                        <ListItemButton
                          key={dev.id}
                          onClick={(e) => handleDeviceClick(e, dev.id)}
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: 'grey.200',
                            py: 1.2,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BuildIcon fontSize="small" color="disabled" />
                          </ListItemIcon>
                          <ListItemText
                            primary={dev.name}
                            secondary={`Модель: ${dev.model} | Зав. №: ${dev.serialNumber}`}
                            slotProps={{
                              primary: { fontWeight: 600, variant: 'body2' },
                              secondary: { variant: 'caption' },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* 3. АНОМАЛИЯ: Исправен, но без документов */}
                <Accordion
                  disableGutters
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    p: 0.5,
                    borderColor:
                      (anomalies?.missingHistory?.length || 0) > 0
                        ? 'warning.light'
                        : 'divider',
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        pr: { xs: 1, sm: 3 },
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: { xs: '0.825rem', sm: '0.875rem' },
                        }}
                      >
                        ⚠️ Статус "Исправен" на линии, но истории контроля нет
                      </Typography>
                      <Chip
                        label={`${anomalies?.missingHistory?.length || 0} СИ`}
                        size="small"
                        color={
                          (anomalies?.missingHistory?.length || 0) > 0
                            ? 'warning'
                            : 'default'
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      p: 0,
                      bgcolor: 'grey.50',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <List dense disablePadding>
                      {anomalies?.missingHistory?.map((dev: any) => (
                        <ListItemButton
                          key={dev.id}
                          onClick={(e) => handleDeviceClick(e, dev.id)}
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: 'grey.200',
                            py: 1.2,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BuildIcon fontSize="small" color="disabled" />
                          </ListItemIcon>
                          <ListItemText
                            primary={dev.name}
                            secondary={`Модель: ${dev.model} | Зав. №: ${dev.serialNumber}`}
                            slotProps={{
                              primary: { fontWeight: 600, variant: 'body2' },
                              secondary: { variant: 'caption' },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                {/* 4. АНОМАЛИЯ: Рассинхрон статуса */}
                <Accordion
                  disableGutters
                  variant="outlined"
                  sx={{
                    borderRadius: 2.5,
                    p: 0.5,
                    borderColor:
                      (anomalies?.statusMismatch?.length || 0) > 0
                        ? 'error.light'
                        : 'divider',
                    boxShadow: 'none',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        pr: { xs: 1, sm: 3 },
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: { xs: '0.825rem', sm: '0.875rem' },
                        }}
                      >
                        🛑 Рассинхронизация: Последний контроль "Не годен", но
                        СИ активно на линии
                      </Typography>
                      <Chip
                        label={`${anomalies?.statusMismatch?.length || 0} СИ`}
                        size="small"
                        color={
                          (anomalies?.statusMismatch?.length || 0) > 0
                            ? 'error'
                            : 'default'
                        }
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      p: 0,
                      bgcolor: 'grey.50',
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <List dense disablePadding>
                      {anomalies?.statusMismatch?.map((dev: any) => (
                        <ListItemButton
                          key={dev.id}
                          onClick={(e) => handleDeviceClick(e, dev.id)}
                          sx={{
                            borderBottom: '1px solid',
                            borderColor: 'grey.200',
                            py: 1.2,
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <BuildIcon fontSize="small" color="disabled" />
                          </ListItemIcon>
                          <ListItemText
                            primary={dev.name}
                            secondary={`Модель: ${dev.model} | Зав. №: ${dev.serialNumber}`}
                            slotProps={{
                              primary: { fontWeight: 600, variant: 'body2' },
                              secondary: { variant: 'caption' },
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ================= ВСПЛЫВАЮЩЕЕ ОКНО ДЕТАЛЬНОЙ КАРТОЧКИ ПРИБОРА ================= */}
      <Dialog
        open={Boolean(editingDeviceId)}
        onClose={() => setEditingDeviceId(null)}
        disableEnforceFocus
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 4, p: { xs: 1.5, sm: 2.5 } } },
        }}
      >
        <DialogContent sx={{ p: 1 }}>
          {editingDeviceId && (
            <EditDevicePage
              deviceId={editingDeviceId}
              closeDetails={() => setEditingDeviceId(null)}
              close={() => setEditingDeviceId(null)}
              refetchDevice={() => {
                refetch();
                setEditingDeviceId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
