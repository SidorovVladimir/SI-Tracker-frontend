import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Stack,
  Collapse,
  Divider,
  CircularProgress,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const STATUS_COLORS = {
  green: {
    main: '#2e7d32',
    light: '#e8f5e9',
    text: '#1b5e20',
    label: 'В НОРМЕ',
  },
  warning: {
    main: '#ed6c02',
    light: '#fff3e0',
    text: '#e65100',
    label: 'СРОКИ ПОДХОДЯТ',
  },
  error: {
    main: '#d32f2f',
    light: '#ffebee',
    text: '#c62828',
    label: 'ЕСТЬ ПРОСРОЧКА',
  },
};

interface RiskHeatMapProps {
  data: any; // Принимаем только data, как у вас в вызове
}

export const RiskHeatMap: React.FC<RiskHeatMapProps> = ({ data }) => {
  const citiesList = data?.getVerificationRisks?.cities || [];

  const [expandedCityId, setExpandedCityId] = useState<string | null>(null);
  const [expandedCoId, setExpandedCoId] = useState<string | null>(null);

  // 🎯 ВСТРОЕННЫЙ ИНДИКАТОР ЗАГРУЗКИ: Если данные с сервера еще не пришли, красиво крутим спиннер
  if (!data) {
    return (
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          mb: 3,
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <CircularProgress size={28} sx={{ mr: 2 }} />
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 'medium' }}
        >
          Анализ и построение карты рисков холдинга...
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, mb: 3, bgcolor: 'background.paper' }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
          🗺️ Тепловая карта метрологических рисков холдинга
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          sx={{ mb: 2.5 }}
        >
          Кликните на интересующий город для каскадного просмотра компаний и
          производственных участков
        </Typography>

        {/* УРОВЕНЬ 1: СЕТКА ГОРОДОВ */}
        <Grid container spacing={2}>
          {citiesList.map((city: any) => {
            const config =
              STATUS_COLORS[city.status as keyof typeof STATUS_COLORS] ||
              STATUS_COLORS.green;
            const isCityExpanded = expandedCityId === city.id;

            return (
              <Grid key={city.id} size={{ xs: 12, sm: 4 }}>
                <Card
                  onClick={() => {
                    setExpandedCityId(isCityExpanded ? null : city.id);
                    setExpandedCoId(null);
                  }}
                  sx={{
                    cursor: 'pointer',
                    boxShadow: isCityExpanded ? 3 : 1,
                    border: '1px solid',
                    borderColor: isCityExpanded ? config.main : 'grey.200',
                    bgcolor: isCityExpanded ? config.light : 'background.paper',
                    '&:hover': { boxShadow: 2, borderColor: config.main },
                  }}
                >
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 'black' }}
                      >
                        📍 {city.name.toUpperCase()}
                      </Typography>
                      {city.status === 'error' && (
                        <ErrorOutlineIcon color="error" />
                      )}
                      {city.status === 'warning' && (
                        <WarningAmberIcon color="warning" />
                      )}
                      {city.status === 'green' && (
                        <CheckCircleOutlineIcon color="success" />
                      )}
                    </Box>

                    <Stack spacing={0.3}>
                      <Typography variant="caption" color="text.secondary">
                        Всего приборов: <strong>{city.totalCount} шт.</strong>
                      </Typography>
                      {city.expiredCount > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'error.main', fontWeight: 'bold' }}
                        >
                          🚨 Просрочено: {city.expiredCount} шт.
                        </Typography>
                      )}
                      {city.warningCount > 0 && (
                        <Typography
                          variant="caption"
                          sx={{ color: 'warning.main', fontWeight: 'bold' }}
                        >
                          ⏳ В течение 30 дн: {city.warningCount} шт.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* УРОВЕНЬ 2: КОМПАНИИ (РАСКРЫВАЮТСЯ ПО КЛИКУ НА ГОРОД) */}
        {citiesList.map((city: any) => (
          <Collapse
            key={`city-${city.id}`}
            in={expandedCityId === city.id}
            timeout="auto"
            unmountOnExit
          >
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1.5,
                }}
              >
                🏢 ПРЕДПРИЯТИЯ В РЕГИОНЕ: {city.name.toUpperCase()}
              </Typography>

              <Stack spacing={1.5}>
                {city.companies.map((co: any) => {
                  const coConfig =
                    STATUS_COLORS[co.status as keyof typeof STATUS_COLORS] ||
                    STATUS_COLORS.green;
                  const isCoExpanded = expandedCoId === co.id;

                  return (
                    <Box
                      key={co.id}
                      sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        p: 1.5,
                        border: '1px solid',
                        borderColor: 'grey.200',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          width: '100%',
                          flexWrap: 'wrap', // Спасает верстку на узких экранах смартфонов
                          gap: 1.5,
                        }}
                      >
                        <Button
                          variant="text"
                          color="inherit"
                          size="small"
                          onClick={() =>
                            setExpandedCoId(isCoExpanded ? null : co.id)
                          }
                          endIcon={
                            isCoExpanded ? (
                              <KeyboardArrowUpIcon />
                            ) : (
                              <KeyboardArrowDownIcon />
                            )
                          }
                          sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            p: 0,
                            color: 'text.primary',
                            textAlign: 'left',
                            justifyContent: 'flex-start',
                            flexGrow: 1,
                            maxWidth: { xs: '100%', sm: 'calc(100% - 160px)' }, // Не дает длинному имени наехать на тег
                          }}
                        >
                          {co.name.toUpperCase()}
                        </Button>

                        {/* 🎯 НАДЕЖНОЕ ИСПРАВЛЕНИЕ КРИВИЗНЫ: Заменяем Badge на контролируемый тег-бокс */}
                        <Box
                          sx={{
                            bgcolor: coConfig.light,
                            color: coConfig.text,
                            border: '1px solid',
                            borderColor: coConfig.main,
                            borderRadius: 1.5,
                            px: 1.5,
                            py: 0.4,
                            fontSize: '0.68rem',
                            fontWeight: 'bold',
                            letterSpacing: '0.5px',
                            whiteSpace: 'nowrap', // Запрещает кривой перенос слов статуса
                            display: 'inline-flex',
                            alignItems: 'center',
                            height: 22,
                          }}
                        >
                          {coConfig.label}
                        </Box>
                      </Box>

                      {/* УРОВЕНЬ 3: ПРОИЗВОДСТВЕННЫЕ ПЛОЩАДКИ / УЧАСТКИ */}
                      <Collapse
                        in={expandedCoId === co.id}
                        timeout="auto"
                        unmountOnExit
                      >
                        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                        <Grid container spacing={1.5}>
                          {co.sites.map((site: any) => {
                            const siteConfig =
                              STATUS_COLORS[
                                site.status as keyof typeof STATUS_COLORS
                              ] || STATUS_COLORS.green;
                            return (
                              <Grid key={site.id} size={{ xs: 12, sm: 4 }}>
                                <Box
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: siteConfig.light,
                                    border: '1px solid',
                                    borderColor: siteConfig.main,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: siteConfig.text,
                                      display: 'block',
                                      mb: 0.5,
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    🏭 {site.name}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.primary"
                                    display="block"
                                  >
                                    Всего СИ: {site.totalCount} шт.
                                  </Typography>
                                  {site.expiredCount > 0 && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      sx={{
                                        color: 'error.main',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      🚫 Просрочено: {site.expiredCount} шт.
                                    </Typography>
                                  )}
                                  {site.warningCount > 0 && (
                                    <Typography
                                      variant="caption"
                                      display="block"
                                      sx={{
                                        color: 'warning.main',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      ⚠️ Сроки подходят: {site.warningCount} шт.
                                    </Typography>
                                  )}
                                </Box>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Collapse>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Collapse>
        ))}
      </CardContent>
    </Card>
  );
};
