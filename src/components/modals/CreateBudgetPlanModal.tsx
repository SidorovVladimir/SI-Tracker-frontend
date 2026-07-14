import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Alert,
  MenuItem,
  Stack,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client/react';
import HistoryIcon from '@mui/icons-material/History';
import PriceChangeIcon from '@mui/icons-material/PriceChange';

import {
  CreateBudgetPlanDocument,
  GetPricelistsDocument,
  GetCompaniesDocument,
  GetSitiesDocument,
  GetProductionSitesDocument,
  GetBudgetPlansDocument,
} from '../../graphql/types/__generated__/graphql';
import { cleanSpaces, formatStrictUpper } from '../../utils/capitalize';

interface ModalFilterState {
  cityId: string;
  companyId: string;
  siteId: string;
}

const initialModalFilters: ModalFilterState = {
  cityId: '',
  companyId: '',
  siteId: '',
};

interface CreateBudgetPlanModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateBudgetPlanModal: React.FC<CreateBudgetPlanModalProps> = ({
  open,
  onClose,
}) => {
  const theme = useTheme();
  // 📱 АВТО-ПЕРЕКЛЮЧЕНИЕ НА ПОЛНЫЙ ЭКРАН: На смартфонах модалка откроется во весь экран
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear + 1);
  const [comment, setComment] = useState<string>('');

  const [vatRateInput, setVatRateInput] = useState<string>('22');

  const [calculationMethod, setCalculationMethod] = useState<
    'pricelist' | 'history'
  >('pricelist');
  const [selectedPricelistIds, setSelectedPricelistIds] = useState<string[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locationFilters, setLocationFilters] =
    useState<ModalFilterState>(initialModalFilters);

  const { data, loading, error } = useQuery(GetPricelistsDocument, {
    skip: !open || calculationMethod !== 'pricelist',
    fetchPolicy: 'network-only',
  });

  const { data: citiesData } = useQuery(GetSitiesDocument, { skip: !open });
  const { data: companiesData } = useQuery(GetCompaniesDocument, {
    skip: !open,
  });
  const { data: productionSiteData } = useQuery(GetProductionSitesDocument, {
    skip: !open,
  });

  const [createBudgetPlan] = useMutation(CreateBudgetPlanDocument, {
    refetchQueries: [{ query: GetBudgetPlansDocument }],
  });

  const pricelists = useMemo(() => data?.pricelists || [], [data]);

  const cities = useMemo(() => {
    const raw = citiesData?.cities || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [citiesData]);

  const companies = useMemo(() => {
    const raw = companiesData?.companies || [];
    return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [companiesData]);

  const filteredProductionSites = useMemo(() => {
    const rawSites = productionSiteData?.productionSites || [];
    let filtered = rawSites;
    if (locationFilters.cityId)
      filtered = filtered.filter(
        (site) => site.cityId === locationFilters.cityId
      );
    if (locationFilters.companyId)
      filtered = filtered.filter(
        (site) => site.companyId === locationFilters.companyId
      );
    return [...filtered].sort((a, b) =>
      (a.name || '').localeCompare(b.name || '')
    );
  }, [productionSiteData, locationFilters.cityId, locationFilters.companyId]);

  const handleLocationChange = (
    field: keyof ModalFilterState,
    value: string
  ) => {
    setLocationFilters((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'cityId' || field === 'companyId') updated.siteId = '';
      return updated;
    });
  };

  const handleTogglePricelist = (id: string) => {
    setSelectedPricelistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (
      calculationMethod === 'pricelist' &&
      selectedPricelistIds.length === 0
    ) {
      setSubmitError(
        'Необходимо выбрать хотя бы один прейскурант ЦСМ для расчета цен.'
      );
      return;
    }

    const parsedVat = parseFloat(vatRateInput.replace(',', '.'));
    if (isNaN(parsedVat) || parsedVat < 0) {
      setSubmitError(
        'Пожалуйста, введите корректную ставку НДС (число от 0 и выше).'
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await createBudgetPlan({
        variables: {
          input: {
            year,
            vatRate: parsedVat / 100,
            comment: comment || undefined,
            calculationMethod: calculationMethod,
            pricelistIds:
              calculationMethod === 'pricelist'
                ? selectedPricelistIds
                : undefined,
            cityId: locationFilters.cityId || undefined,
            companyId: locationFilters.companyId || undefined,
            productionSiteId: locationFilters.siteId || undefined,
          },
        },
      });

      setComment('');
      setVatRateInput('22');
      setSelectedPricelistIds([]);
      setCalculationMethod('pricelist');
      setLocationFilters(initialModalFilters);
      onClose();
    } catch (err: any) {
      setSubmitError(
        err.message || 'Произошла ошибка при генерации годового бюджета.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = useMemo(() => {
    if (submitting) return true;
    if (calculationMethod === 'pricelist') {
      return pricelists.length === 0 || selectedPricelistIds.length === 0;
    }
    return false;
  }, [submitting, calculationMethod, pricelists, selectedPricelistIds]);
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      // 📱 НА СМАРТФОНАХ: Включаем полноэкранный режим, чтобы формы заполнения были удобными
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: 'bold', px: { xs: 2, sm: 3 }, py: 2 }}>
        Создание годового бюджета
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          p: { xs: 2, sm: 2.5 },
          // Защита от переполнения: контент скроллится независимо от кнопок футера
          overflowY: 'auto',
        }}
      >
        {submitError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: 'block',
                mb: 1,
                fontWeight: 'bold',
                letterSpacing: '0.5px',
              }}
            >
              ГОД ПЛАНИРОВАНИЯ БЮДЖЕТА
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'background.paper',
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                p: 0.5,
                height: 40,
              }}
            >
              <Button
                size="small"
                disabled={submitting}
                onClick={() => setYear((prev) => prev - 1)}
                sx={{
                  minWidth: 40,
                  p: 0,
                  height: '100%',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                }}
              >
                −
              </Button>
              <Typography
                sx={{
                  flexGrow: 1,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                }}
              >
                {year} год
              </Typography>
              <Button
                size="small"
                disabled={submitting}
                onClick={() => setYear((prev) => prev + 1)}
                sx={{
                  minWidth: 40,
                  p: 0,
                  height: '100%',
                  borderRadius: 1.5,
                  color: 'text.secondary',
                  fontSize: '1.2rem',
                }}
              >
                +
              </Button>
            </Box>
          </Box>

          <TextField
            label="Ставка НДС для расчета, %"
            size="small"
            placeholder="Например: 20 или 10"
            value={vatRateInput}
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9.,]/g, '');
              setVatRateInput(val);
            }}
            disabled={submitting}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 'bold', ml: 1 }}
                  >
                    %
                  </Typography>
                ),
              },
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: '0.875rem',
                fontWeight: 'bold',
              },
            }}
          />

          <TextField
            label="Примечание / Комментарий"
            multiline
            rows={2}
            size="small"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            fullWidth
          />

          {/* 💵 ПАНЕЛЬ ВЫБОРА МЕТОДА КАЛЬКУЛЯЦИИ ЦЕН */}
          <Box
            sx={{
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'background.paper',
            }}
          >
            <Box
              sx={{
                bgcolor: 'grey.100',
                px: 2,
                py: 1,
                borderBottom: '1px solid #e0e0e0',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 'bold',
                  color: 'text.secondary',
                  letterSpacing: '0.5px',
                }}
              >
                💵 ИСТОЧНИК ПОДБОРА СТОИМОСТИ УСЛУГ
              </Typography>
            </Box>
            <Tabs
              value={calculationMethod === 'pricelist' ? 0 : 1}
              onChange={(_, value) => {
                setCalculationMethod(value === 0 ? 'pricelist' : 'history');
                setSubmitError(null);
              }}
              variant="fullWidth"
            >
              <Tab
                icon={<PriceChangeIcon fontSize="small" />}
                iconPosition="start"
                label="По прайс-листам"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  minHeight: 44,
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                }}
              />
              <Tab
                icon={<HistoryIcon fontSize="small" />}
                iconPosition="start"
                label="По прошлым ценам"
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                  minHeight: 44,
                  fontSize: { xs: '0.85rem', sm: '0.875rem' },
                }}
              />
            </Tabs>
          </Box>

          {/* 🎯 СЕКЦИЯ: Выбор границ расчета бюджета (ЦФО) */}
          <Box
            sx={{
              border: '1px dashed #e0e0e0',
              p: 2,
              borderRadius: 2,
              bgcolor: 'grey.50',
            }}
          >
            <Typography
              variant="caption"
              color="textSecondary"
              display="block"
              sx={{
                fontWeight: 'bold',
                mb: 1.5,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              🎯 Область расчета бюджета (Опционально):
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Ограничить по городу"
                size="small"
                select
                fullWidth
                value={locationFilters.cityId}
                disabled={submitting}
                sx={{
                  '& .MuiInputBase-input': {
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.6px',
                    fontWeight: 500,
                  },
                }}
                onChange={(e) => handleLocationChange('cityId', e.target.value)}
              >
                <MenuItem value="">
                  <em>Все регионы / Без ограничений</em>
                </MenuItem>
                {cities.map((city: any) => (
                  <MenuItem
                    key={city.id}
                    value={city.id}
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: '0.77rem',
                      letterSpacing: '0.55px',
                      fontWeight: 500,
                    }}
                  >
                    {cleanSpaces(city.name)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ограничить по организации"
                size="small"
                select
                fullWidth
                value={locationFilters.companyId}
                disabled={submitting}
                onChange={(e) =>
                  handleLocationChange('companyId', e.target.value)
                }
                sx={{
                  '& .MuiInputBase-input': {
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.6px',
                    fontWeight: 500,
                  },
                }}
              >
                <MenuItem value="">
                  <em>Все юрлица / Без ограничений</em>
                </MenuItem>
                {companies.map((co: any) => (
                  <MenuItem
                    key={co.id}
                    value={co.id}
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: '0.77rem',
                      letterSpacing: '0.55px',
                      fontWeight: 500,
                    }}
                  >
                    {cleanSpaces(co.name)}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Ограничить по участку / цеху"
                size="small"
                select
                fullWidth
                value={locationFilters.siteId}
                sx={{
                  '& .MuiInputBase-input': {
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.6px',
                    fontWeight: 500,
                  },
                }}
                disabled={submitting || filteredProductionSites.length === 0}
                onChange={(e) => handleLocationChange('siteId', e.target.value)}
              >
                <MenuItem value="">
                  <em>Все подразделения / Без ограничений</em>
                </MenuItem>
                {filteredProductionSites.map((site: any) => (
                  <MenuItem
                    key={site.id}
                    value={site.id}
                    sx={{
                      textTransform: 'uppercase',
                      fontSize: '0.77rem',
                      letterSpacing: '0.55px',
                      fontWeight: 500,
                    }}
                  >
                    {cleanSpaces(site.name)}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>

          {/* ДИНАМИЧЕСКИЙ БЛОК: Списки прайсов (Только для метода "pricelist") */}
          {calculationMethod === 'pricelist' && (
            <Box sx={{ mt: 0.5 }}>
              <Typography
                variant="subtitle2"
                color="textSecondary"
                sx={{ mb: 1, fontWeight: 'bold' }}
              >
                Выберите прейскуранты ЦСМ для каскадного расчета:
              </Typography>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : error ? (
                <Alert severity="warning">
                  Не удалось загрузить прейскуранты: {error.message}
                </Alert>
              ) : pricelists.length === 0 ? (
                <Typography
                  variant="body2"
                  color="error"
                  sx={{ my: 1, fontStyle: 'italic' }}
                >
                  В базе данных нет загруженных прейскурантов. Сначала загрузите
                  Excel-файлы прайсов.
                </Typography>
              ) : (
                <FormGroup
                  sx={{
                    maxHeight: { xs: 140, sm: 180 },
                    overflowY: 'auto',
                    border: '1px solid #e0e0e0',
                    p: 1,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                  }}
                >
                  {pricelists.map((list) => (
                    <FormControlLabel
                      key={list.id}
                      control={
                        <Checkbox
                          checked={selectedPricelistIds.includes(list.id)}
                          onChange={() => handleTogglePricelist(list.id)}
                          disabled={submitting}
                          size="small"
                        />
                      }
                      label={
                        <Box sx={{ pr: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'medium', lineHeight: 1.3 }}
                          >
                            {formatStrictUpper(list.title)} ({list.year} г.)
                          </Typography>
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            display="block"
                            sx={{ mt: 0.2 }}
                          >
                            Организация:{' '}
                            {formatStrictUpper(
                              list.verificationOrganization?.name || ''
                            )}{' '}
                            | {list.isRegulated ? 'Рег.' : 'Дог.'}
                          </Typography>
                        </Box>
                      }
                      sx={{ mb: 1, alignItems: 'flex-start', mx: 0 }}
                    />
                  ))}
                </FormGroup>
              )}
            </Box>
          )}

          {/* ИНФОРМАЦИОННЫЙ БЛОК: Подсказка (Только для метода "history") */}
          {calculationMethod === 'history' && (
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
              }}
            >
              Расчет сформируется на основе цен прошлых фактических поверок для
              каждого активного прибора холдинга. Если прибор новый и истории
              цен нет, позиция запишется со стоимостью 0.00 ₽ (ее можно будет
              скорректировать вручную в таблице).
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          px: { xs: 2, sm: 3 },
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
          // Закрепляем футер на мобилках снизу жестко, чтобы кнопки всегда были под рукой
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          onClick={onClose}
          disabled={submitting}
          color="inherit"
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitDisabled}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            minWidth: { xs: 130, sm: 150 },
            fontSize: { xs: '0.85rem', sm: '0.875rem' },
          }}
        >
          {submitting ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            'Запустить расчет'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
