import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { useRef, useState } from 'react';
import {
  CreateDeviceDocument,
  FetchArshinVerificationsDocument,
  FindArshinDocumentUrlDocument,
  // GetDevicesWithRelationsListDocument,
  GetEquipmentTypesListDocument,
  GetMeasurementTypesListDocument,
  GetMetrologyControlTypesListDocument,
  GetPrimaryStandartsListDocument,
  GetProductionSitesForSelectDocument,
  GetScopesListDocument,
  GetStatusListDocument,
  GetVerificationOrganizationsListDocument,
} from '../../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  Close,
  CloudDownload,
  ExpandMore,
  FindInPage,
  OpenInNew,
} from '@mui/icons-material';
import ScopeAutocomplete from '../../components/ScopeAutocomplete';
import EquipmentTextField from '../../components/EquipmentTextField';
import StatusTextField from '../../components/StatusTextField';
import ProductionSiteTextField from '../../components/ProductionSiteTextField';
import PrimaryStandartAutocomplete from '../../components/PrimaryStandartAutocomplete';
import MeasurementAutocomplete from '../../components/MeasurementAutocomplete';
import VerificationOrganizationTextField from '../../components/VerificationOrganizationTextField';
import MetrologyControlTypeTextField from '../../components/MetrologyControlTypeTextField';
import { toCapital } from '../../utils/capitalize';

export default function CreateDevicePage(props: {
  closeDetails: () => void;
  refetchDevice: () => void;
}) {
  const { closeDetails, refetchDevice } = props;

  const [arshinCount, setArshinCount] = useState<number>(3);

  const [searchingDocId, setSearchingDocId] = useState<number | null>(null);

  const [fetchArshinVerifications, { loading: loadingArshinList }] =
    useLazyQuery(FetchArshinVerificationsDocument, {
      fetchPolicy: 'network-only',
    });

  const [findArshinDocumentUrl] = useLazyQuery(FindArshinDocumentUrlDocument, {
    fetchPolicy: 'network-only',
  });

  const { data: productionSiteData } = useQuery(
    GetProductionSitesForSelectDocument
  );
  const { data: equipmentTypesData } = useQuery(GetEquipmentTypesListDocument);
  const { data: statusesData } = useQuery(GetStatusListDocument);
  const { data: measurementTypesData } = useQuery(
    GetMeasurementTypesListDocument
  );
  const { data: scopesData } = useQuery(GetScopesListDocument);
  const { data: primaryStandartsData } = useQuery(
    GetPrimaryStandartsListDocument
  );
  const { data: metrologyControlTypeData } = useQuery(
    GetMetrologyControlTypesListDocument
  );
  const { data: verificationOrganizationsData } = useQuery(
    GetVerificationOrganizationsListDocument
  );

  const [form, setForm] = useState<{
    name: string;
    model: string;
    serialNumber: string;
    releaseDate: string;
    grsiNumber: string;
    measurementRange: string;
    accuracy: string;
    inventoryNumber: string;
    receiptDate: string;
    manufacturer: string;
    csmCode: string;
    verificationInterval: number | string;
    archived: boolean;
    nomenclature: string;
    comment: string;
    statusId: string;
    productionSiteId: string;
    equipmentTypeId: string;
    scopes: { id: string; name: string }[];
    primaryStandarts: { id: string; name: string }[];
    measurementTypes: { id: string; name: string }[];
  }>({
    name: '',
    model: '',
    serialNumber: '',
    releaseDate: '',
    grsiNumber: '',
    measurementRange: '',
    accuracy: '',
    csmCode: '',
    inventoryNumber: '',
    receiptDate: '',
    manufacturer: '',
    verificationInterval: '',
    archived: false,
    nomenclature: '',
    comment: '',
    statusId: '',
    productionSiteId: '',
    equipmentTypeId: '',
    measurementTypes: [],
    scopes: [],
    primaryStandarts: [],
  });

  const [verifications, setVerifications] = useState<
    Array<{
      id: number;
      date: string;
      validUntil: string;
      result: string;
      protocolNumber: string;
      organization: string;
      comment: string;
      documentUrl: string;
      metrologyControleTypeId: string;
      collapsed: boolean;
      verificationOrganizationId: string;
      cost: string;
    }>
  >([]);

  const nextId = useRef<number>(0);

  const addVerification = () => {
    setVerifications((prev) => [
      ...prev,
      {
        id: nextId.current++,
        date: '',
        validUntil: '',
        result: '',
        protocolNumber: '',
        organization: '',
        comment: '',
        documentUrl: '',
        metrologyControleTypeId: '',
        verificationOrganizationId: '',
        deviceId: '',
        collapsed: false,
        cost: '',
      },
    ]);
  };

  const handleFindSingleUrl = async (id: number, protocolNumber: string) => {
    if (!protocolNumber.trim()) {
      enqueueSnackbar('Поле "Номер свидетельства" должно быть заполнено', {
        variant: 'warning',
      });
      return;
    }

    setSearchingDocId(id);

    try {
      const { data } = await findArshinDocumentUrl({
        variables: { protocolNumber: protocolNumber.trim() },
      });

      const url = data?.findArshinDocumentUrl;

      if (url) {
        setVerifications((prev) =>
          prev.map((v) => (v.id === id ? { ...v, documentUrl: url } : v))
        );
        enqueueSnackbar('Ссылка на документ успешно получена!', {
          variant: 'success',
        });
      } else {
        enqueueSnackbar('Документ с таким номером во ФГИС Аршин не обнаружен', {
          variant: 'info',
        });
      }
    } catch (err: any) {
      enqueueSnackbar(`Не удалось найти документ: ${err.message}`, {
        variant: 'error',
      });
    } finally {
      setSearchingDocId(null);
    }
  };

  const removeVerification = (id: number) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
  };

  const handleLoadFromArshin = async () => {
    if (!form.serialNumber.trim() || !form.grsiNumber.trim()) {
      enqueueSnackbar(
        'Сначала заполните заводской номер и номер ГРСИ прибора вверху формы',
        { variant: 'warning' }
      );
      return;
    }

    try {
      // Передаем параметры и ждем результат напрямую из промиса
      const { data } = await fetchArshinVerifications({
        variables: {
          input: {
            serialNumber: form.serialNumber.trim(),
            grsiNumber: form.grsiNumber.trim(),
            count: arshinCount,
          },
        },
      });

      const items = data?.fetchArshinVerifications || [];

      if (items.length === 0) {
        enqueueSnackbar('Поверок в архиве ФГИС Аршин не найдено', {
          variant: 'info',
        });
        return;
      }

      const formatDateToInput = (
        dateStr: string | null | undefined
      ): string => {
        if (!dateStr) return '';

        const cleanDate = dateStr.includes('T')
          ? dateStr.split('T')[0]
          : dateStr;

        if (cleanDate && cleanDate.includes('.')) {
          const parts = cleanDate.split('.');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month}-${day}`;
          }
        }

        return cleanDate || '';
      };

      // Автоматически мапим данные под структуру локального массива verifications
      const imported = items.map((item: any) => {
        const matchedOrgId =
          verificationOrhanizationsList.find(
            (org) =>
              org.name.toLowerCase().trim() ===
              item.organizationName?.toLowerCase().trim()
          )?.id || '';

        const defaultControlType =
          metrologyControlTypeList.find(
            (t) => t.name.toLowerCase().trim() === 'поверка'
          )?.id || '';

        return {
          id: nextId.current++,
          date: formatDateToInput(item.date),
          validUntil: formatDateToInput(item.validUntil),
          result: item.isApplicable ? 'Годен' : 'Не годен',
          protocolNumber: item.protocolNumber,
          organization: item.organizationName || '',
          comment: `Автоматический импорт из ФГИС Аршин. Запись № ${item.arshinId}`,
          documentUrl: item.documentUrl,
          metrologyControleTypeId: defaultControlType,
          verificationOrganizationId: matchedOrgId,
          collapsed: false,
          cost: '',
        };
      });

      setVerifications((prev) => [...imported, ...prev]);
      enqueueSnackbar(`Успешно импортировано поверок: ${imported.length}`, {
        variant: 'success',
      });
    } catch (err: any) {
      enqueueSnackbar(`Ошибка интеграции с Аршин: ${err.message}`, {
        variant: 'error',
      });
    }
  };

  const handleVerificationChange = (
    id: number,
    field: string,
    value: string
  ) => {
    if (field === 'cost') {
      let val = value;
      val = val.replace(',', '.');
      if (/^\d*\.?\d{0,2}$/.test(val)) {
        setVerifications((prev) =>
          prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
        );
      }
    } else {
      setVerifications((prev) =>
        prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
      );
    }
  };

  const toggleCollapse = (id: number) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, collapsed: !v.collapsed } : v))
    );
  };

  const productionSiteList =
    productionSiteData?.getProductionSitesForSelect || [];
  const equipmentTypesList = equipmentTypesData?.equipmentTypes || [];
  const statusesList = statusesData?.statuses || [];
  const measurementTypesList = measurementTypesData?.measurementTypes || [];
  const scopesList = scopesData?.scopes || [];

  const primaryStandartsList = primaryStandartsData?.primaryStandarts || [];

  const metrologyControlTypeList =
    metrologyControlTypeData?.metrologyControlTypes || [];

  const verificationOrhanizationsList =
    verificationOrganizationsData?.verificationOrganizations || [];

  const [createDevice, { loading: creating }] = useMutation(
    CreateDeviceDocument,
    {
      // refetchQueries: [{ query: GetDevicesWithRelationsListDocument }],
      // awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Прибор успешно создан', {
          variant: 'success',
        });
        refetchDevice();
        closeDetails();
      },
      onError: (error) => {
        enqueueSnackbar(`Ошибка создания: ${error.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === 'verificationInterval') {
      if (/^\d*$/.test(value)) {
        setForm((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAutocompleteChange = (
    name: string,
    value: { id: string; name: string }[]
  ) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationsInput = verifications.map((v) => ({
      date: v.date || null,
      validUntil: v.validUntil || null,
      result: v.result || null,
      protocolNumber: v.protocolNumber || null,
      organization: v.organization || null,
      comment: v.comment || null,
      documentUrl: v.documentUrl || null,
      metrologyControleTypeId: v.metrologyControleTypeId || null,
      verificationOrganizationId: v.verificationOrganizationId || null,
      cost: v.cost ? parseFloat(v.cost) : 0,
    }));

    const data = {
      ...form,
      grsiNumber: form.grsiNumber || null,
      releaseDate: form.releaseDate || null,
      csmCode: form.csmCode || null,
      measurementRange: form.measurementRange || null,
      accuracy: form.accuracy || null,
      receiptDate: form.receiptDate || null,
      manufacturer: form.manufacturer || null,
      verificationInterval:
        form.verificationInterval !== ''
          ? Number(form.verificationInterval)
          : null,
      nomenclature: form.nomenclature || null,
      inventoryNumber: form.inventoryNumber || null,
      equipmentTypeId: form.equipmentTypeId || null,

      scopes: form.scopes.map((scope) => scope.id),
      primaryStandarts: form.primaryStandarts.map(
        (primaryStandart) => primaryStandart.id
      ),
      measurementTypes: form.measurementTypes.map(
        (measurementType) => measurementType.id
      ),
      verifications: verificationsInput,
    };

    await createDevice({
      variables: { input: data },
    });
  };

  const isValidGostUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;
    const regex =
      /^https:\/\/fgis\.gost\.ru\/fundmetrology\/cm\/results\/\d+-\d+$/;
    return regex.test(url.trim());
  };

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography
          variant="h6"
          gutterBottom
          color="primary"
          sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 700 }}
        >
          Добавить новое СИ
        </Typography>
        <Tooltip title="Закрыть">
          <IconButton onClick={closeDetails}>
            <Close />
          </IconButton>
        </Tooltip>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            label="Название"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            required
            autoFocus={true}
          />
          <TextField
            label="Тип"
            name="model"
            value={form.model}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            required
          />
          <TextField
            label="Заводской номер"
            name="serialNumber"
            value={form.serialNumber}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            required
          />
          <TextField
            label="Номер ГРСИ"
            name="grsiNumber"
            value={form.grsiNumber}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Код СИ из прайса ЦСМ (договорной)"
            name="csmCode"
            value={form.csmCode}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            label="Диапазон измерений"
            name="measurementRange"
            value={form.measurementRange}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />

          <TextField
            label="Точность"
            name="accuracy"
            value={form.accuracy}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />

          <TextField
            label="Инвентарный номер"
            name="inventoryNumber"
            value={form.inventoryNumber}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />

          <TextField
            type="date"
            label="Дата выпуска"
            name="releaseDate"
            value={form.releaseDate}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            type="date"
            label="Дата ввода"
            name="receiptDate"
            value={form.receiptDate}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            label="Изготовитель"
            name="manufacturer"
            value={form.manufacturer}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />

          <TextField
            type="text"
            label="МПИ (межповерочный интервал)"
            name="verificationInterval"
            value={form.verificationInterval}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />

          <TextField
            label="Номенклатура"
            name="nomenclature"
            value={form.nomenclature}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            size="small"
          />

          <TextField
            label="Комментарий"
            name="comment"
            value={form.comment}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            minRows={2}
            maxRows={5}
            variant="outlined"
            sx={{
              '& .MuiInputBase-root': {
                fontSize: '0.875rem',
              },
              mt: 1,
            }}
          />

          <StatusTextField
            value={form.statusId}
            onChange={handleChange}
            statusesList={statusesList}
          />

          <ProductionSiteTextField
            value={form.productionSiteId}
            onChange={handleChange}
            productionSiteList={productionSiteList}
          />

          <EquipmentTextField
            value={form.equipmentTypeId}
            onChange={handleChange}
            equipmentTypesList={equipmentTypesList}
          />

          <MeasurementAutocomplete
            value={form.measurementTypes}
            onChange={(_: string, val: { id: string; name: string }[]) =>
              handleAutocompleteChange('measurementTypes', val)
            }
            measurementTypesList={measurementTypesList}
          />

          <ScopeAutocomplete
            value={form.scopes}
            onChange={(_: string, val: { id: string; name: string }[]) =>
              handleAutocompleteChange('scopes', val)
            }
            scopesList={scopesList}
          />

          <PrimaryStandartAutocomplete
            value={form.primaryStandarts}
            onChange={(_: string, val: { id: string; name: string }[]) =>
              handleAutocompleteChange('primaryStandarts', val)
            }
            primaryStandartsList={primaryStandartsList}
          />

          <Divider sx={{ my: 2 }} />
          {/* <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" gutterBottom>
              Добавить данные метрологического контроля
            </Typography>
            <Tooltip title="Добавить">
              <IconButton onClick={addVerification} color="primary">
                <Add />
              </IconButton>
            </Tooltip>
          </Stack> */}

          <Box mb={3}>
            {/* Заголовок блока */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                mb: 1.5,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Данные метрологического контроля
            </Typography>

            {/* Пульт управления: выстраивается компактным флекс-рядом */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              {/* Селект выбора количества */}
              <TextField
                select
                label="Поверок из Аршина"
                value={arshinCount}
                onChange={(e) => setArshinCount(Number(e.target.value))}
                size="small"
                sx={{
                  flexGrow: 1,
                  minWidth: '100px',
                  '& .MuiInputBase-root': { height: 40 },
                }}
              >
                {[1, 2, 3, 5].map((num) => (
                  <MenuItem key={num} value={num}>
                    {num}{' '}
                    {num === 1
                      ? 'последняя'
                      : num < 5
                      ? 'последние'
                      : 'последних'}
                  </MenuItem>
                ))}
              </TextField>

              {/* Кнопка запуска импорта */}
              <Button
                variant="outlined"
                color="secondary"
                disabled={loadingArshinList}
                onClick={handleLoadFromArshin}
                startIcon={
                  loadingArshinList ? (
                    <CircularProgress size={14} color="inherit" />
                  ) : (
                    <CloudDownload />
                  )
                }
                sx={{
                  height: 40,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  borderRadius: 1.5,
                  px: 2,
                }}
              >
                {loadingArshinList ? 'Загрузка...' : 'Заполнить'}
              </Button>

              <Divider
                orientation="vertical"
                flexItem
                sx={{ height: 28, alignSelf: 'center' }}
              />

              {/* Кнопка ручного добавления */}
              <Tooltip title="Добавить вручную">
                <IconButton
                  onClick={addVerification}
                  disabled={loadingArshinList}
                  color="primary"
                  sx={{
                    border: '1px solid',
                    borderColor: 'primary.main',
                    borderRadius: 1.5,
                    height: 40,
                    width: 40,
                    p: 0,
                    flexShrink: 0,
                  }}
                >
                  <Add />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
          {verifications.length === 0 ? (
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              Данные не добавлены
            </Typography>
          ) : (
            verifications.map((verification) => {
              const year = verification.date
                ? new Date(verification.date).getFullYear()
                : null;

              const currentControl = metrologyControlTypeList.find(
                ({ id }) => id === verification.metrologyControleTypeId
              );
              const controlName = currentControl?.name
                ? toCapital(currentControl.name)
                : null;

              let summaryTitle = 'Новая запись контроля';

              if (controlName && year) {
                summaryTitle = `${controlName} — ${year} г.`;
              } else if (controlName) {
                summaryTitle = controlName;
              } else if (year) {
                summaryTitle = `Контроль за ${year} год`;
              }

              return (
                <Accordion
                  key={verification.id}
                  expanded={!verification.collapsed}
                  onChange={() => toggleCollapse(verification.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography
                      sx={{
                        fontWeight: 400,

                        color:
                          controlName || year
                            ? 'text.primary'
                            : 'text.secondary',
                        fontStyle: controlName || year ? 'normal' : 'italic',
                      }}
                    >
                      {summaryTitle}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        type="date"
                        required
                        label="Дата контроля"
                        value={verification.date}
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'date',
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />
                      <TextField
                        type="date"
                        label="Действует до"
                        value={verification.validUntil}
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'validUntil',
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
                        slotProps={{
                          inputLabel: { shrink: true },
                        }}
                      />
                      <TextField
                        label="Номер свидетельства"
                        value={verification.protocolNumber}
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'protocolNumber',
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
                      />

                      <TextField
                        label="Результат"
                        select
                        name="result"
                        required
                        value={verification.result}
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'result',
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
                      >
                        <MenuItem value="">
                          <em>Не выбрано</em>
                        </MenuItem>
                        {['Годен', 'Не годен'].map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        label="Стоимость (руб., без НДС)"
                        type="text"
                        size="small"
                        value={verification.cost}
                        onChange={(e) => {
                          handleVerificationChange(
                            verification.id,
                            'cost',
                            e.target.value
                          );
                        }}
                        slotProps={{
                          htmlInput: { min: 0, step: '0.01' },
                        }}
                        fullWidth
                      />

                      {/* <TextField
                        label="Ссылка на документ"
                        value={verification.documentUrl}
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'documentUrl',
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
                      /> */}

                      <Stack spacing={1} width="100%">
                        <TextField
                          label="Ссылка на документ"
                          value={verification.documentUrl || ''}
                          onChange={(e) =>
                            handleVerificationChange(
                              verification.id,
                              'documentUrl',
                              e.target.value
                            )
                          }
                          fullWidth
                          size="small"
                          sx={{
                            '& .MuiInputBase-root': {
                              paddingTop: '2.5px',
                              paddingBottom: '2.5px',
                            },
                            '& .MuiInputBase-input': {
                              fontSize: '0.8rem',
                              letterSpacing: '0.6px',
                              fontWeight: 500,
                            },
                          }}
                        />

                        <Stack direction="row" spacing={1} width="100%">
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            disabled={
                              searchingDocId === verification.id ||
                              !verification.protocolNumber?.trim()
                            }
                            onClick={() =>
                              handleFindSingleUrl(
                                verification.id,
                                verification.protocolNumber
                              )
                            }
                            startIcon={
                              searchingDocId === verification.id ? (
                                <CircularProgress size={14} color="inherit" />
                              ) : (
                                <FindInPage fontSize="small" />
                              )
                            }
                            sx={{
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              height: 32,
                              borderRadius: 1,
                              flexGrow: 1,
                            }}
                          >
                            {searchingDocId === verification.id
                              ? 'Поиск...'
                              : 'Найти в Аршине'}
                          </Button>

                          {/* 2. Кнопка "Открыть" — появляется только при наличии ссылки и занимает вторую половину */}
                          {verification.documentUrl &&
                            isValidGostUrl(verification.documentUrl) && (
                              <Button
                                variant="contained"
                                size="small"
                                color="secondary"
                                component="a"
                                href={verification.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                startIcon={<OpenInNew fontSize="small" />}
                                sx={{
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  height: 32,
                                  borderRadius: 1,
                                  flexGrow: 1,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                Открыть сайт
                              </Button>
                            )}
                        </Stack>
                      </Stack>

                      <TextField
                        label="Комментарий"
                        value={verification.comment}
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'comment',
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        maxRows={5}
                        variant="outlined"
                        sx={{
                          '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                          },
                          mt: 1,
                        }}
                      />

                      <VerificationOrganizationTextField
                        value={verification.verificationOrganizationId}
                        onChange={(
                          e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) =>
                          handleVerificationChange(
                            verification.id,
                            'verificationOrganizationId',
                            e.target.value
                          )
                        }
                        verificationOrganizationsList={
                          verificationOrhanizationsList
                        }
                      />

                      <MetrologyControlTypeTextField
                        value={verification.metrologyControleTypeId}
                        onChange={(
                          e: React.ChangeEvent<
                            HTMLInputElement | HTMLTextAreaElement
                          >
                        ) =>
                          handleVerificationChange(
                            verification.id,
                            'metrologyControleTypeId',
                            e.target.value
                          )
                        }
                        metrologyControlTypeList={metrologyControlTypeList}
                      />

                      <Button
                        size="small"
                        color="error"
                        onClick={() => removeVerification(verification.id)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Удалить
                      </Button>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={creating || loadingArshinList}
              startIcon={creating && <CircularProgress size={16} />}
              sx={{ height: 36, borderRadius: 2 }}
            >
              {creating ? 'Создание...' : 'Создать'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
}
