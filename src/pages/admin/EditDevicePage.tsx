import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  DeleteDeviceDocument,
  // GetDevicesWithRelationsListDocument,
  GetDeviceWithRelationDocument,
  GetDeviceWithRelationQuery,
  GetEquipmentTypesListDocument,
  GetEquipmentTypesListQuery,
  GetMeasurementTypesListDocument,
  GetMeasurementTypesListQuery,
  GetMetrologyControlTypesListDocument,
  GetMetrologyControlTypesListQuery,
  GetPrimaryStandartsListDocument,
  GetPrimaryStandartsListQuery,
  GetProductionSitesForSelectDocument,
  GetProductionSitesForSelectQuery,
  GetScopesListDocument,
  GetScopesListQuery,
  GetStatusListDocument,
  GetStatusListQuery,
  GetVerificationOrganizationsListDocument,
  GetVerificationOrganizationsListQuery,
  UpdateDeviceDocument,
} from '../../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  Close,
  DeleteOutline,
  ExpandMore,
  Save,
} from '@mui/icons-material';
import ScopeAutocomplete from '../../components/ScopeAutocomplete';
import EquipmentTextField from '../../components/EquipmentTextField';
import StatusTextField from '../../components/StatusTextField';
import ProductionSiteTextField from '../../components/ProductionSiteTextField';
import PrimaryStandartAutocomplete from '../../components/PrimaryStandartAutocomplete';
import MeasurementAutocomplete from '../../components/MeasurementAutocomplete';
import VerificationOrganizationTextField from '../../components/VerificationOrganizationTextField';
import MetrologyControlTypeTextField from '../../components/MetrologyControlTypeTextField';

export default function EditDevicePage(props: {
  deviceId: string;
  closeDetails: () => void;
  close: () => void;
  refetchDevice: () => void;
}) {
  const { deviceId, closeDetails, close, refetchDevice } = props;
  const {
    data: deviceData,
    loading: deviceLoading,
    error: deviceError,
  } = useQuery(GetDeviceWithRelationDocument, {
    variables: {
      id: deviceId,
    },
  });

  const { data: productionSiteData, loading: productionSiteLoading } = useQuery(
    GetProductionSitesForSelectDocument
  );
  const { data: equipmentData, loading: equipmentLoading } = useQuery(
    GetEquipmentTypesListDocument
  );
  const { data: statusesData, loading: statusesLoading } = useQuery(
    GetStatusListDocument
  );
  const { data: measurementData, loading: measurementLoading } = useQuery(
    GetMeasurementTypesListDocument
  );
  const { data: scopesData, loading: scopesLoading } = useQuery(
    GetScopesListDocument
  );
  const { data: standardsData, loading: standardsLoading } = useQuery(
    GetPrimaryStandartsListDocument
  );
  const { data: metrologyData, loading: metrologyLoading } = useQuery(
    GetMetrologyControlTypesListDocument
  );
  const { data: orgsData, loading: orgsLoading } = useQuery(
    GetVerificationOrganizationsListDocument
  );

  const anyLoading =
    deviceLoading ||
    productionSiteLoading ||
    equipmentLoading ||
    statusesLoading ||
    measurementLoading ||
    scopesLoading ||
    standardsLoading ||
    metrologyLoading ||
    orgsLoading;

  if (anyLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (deviceError) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Ошибка загрузки: {deviceError.message}
      </Alert>
    );
  }
  if (!deviceData?.device) return <Alert sx={{ m: 3 }}>СИ не найдено</Alert>;

  return (
    <UserForm
      key={deviceId}
      device={deviceData.device}
      productionSiteList={productionSiteData?.getProductionSitesForSelect || []}
      equipmentTypesList={equipmentData?.equipmentTypes || []}
      statusesList={statusesData?.statuses || []}
      measurementTypesList={measurementData?.measurementTypes || []}
      scopesList={scopesData?.scopes || []}
      primaryStandartsList={standardsData?.primaryStandarts || []}
      metrologyControlTypeList={metrologyData?.metrologyControlTypes || []}
      verificationOrhanizationsList={orgsData?.verificationOrganizations || []}
      closeDetails={closeDetails}
      close={close}
      refetchDevice={refetchDevice}
    />
  );
}

interface UserFormProps {
  device: NonNullable<GetDeviceWithRelationQuery['device']>;
  productionSiteList: NonNullable<
    GetProductionSitesForSelectQuery['getProductionSitesForSelect']
  >[number][];
  equipmentTypesList: NonNullable<
    GetEquipmentTypesListQuery['equipmentTypes']
  >[number][];
  statusesList: NonNullable<GetStatusListQuery['statuses']>[number][];
  measurementTypesList: NonNullable<
    GetMeasurementTypesListQuery['measurementTypes']
  >[number][];
  scopesList: NonNullable<GetScopesListQuery['scopes']>[number][];
  primaryStandartsList: NonNullable<
    GetPrimaryStandartsListQuery['primaryStandarts']
  >[number][];
  metrologyControlTypeList: NonNullable<
    GetMetrologyControlTypesListQuery['metrologyControlTypes']
  >[number][];
  verificationOrhanizationsList: NonNullable<
    GetVerificationOrganizationsListQuery['verificationOrganizations']
  >[number][];

  closeDetails: () => void;
  close: () => void;
  refetchDevice: () => void;
}

function UserForm({
  device,
  closeDetails,
  close,
  refetchDevice,
  productionSiteList,
  equipmentTypesList,
  statusesList,
  measurementTypesList,
  scopesList,
  primaryStandartsList,
  metrologyControlTypeList,
  verificationOrhanizationsList,
}: UserFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

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
    verificationInterval: number | string;
    archived: boolean;
    nomenclature: string;
    comment: string;
    statusId: string;
    productionSiteId: string;
    equipmentTypeId: string;
    measurementTypes: { id: string; name: string }[];
    scopes: { id: string; name: string }[];
    primaryStandarts: { id: string; name: string }[];
  }>({
    name: device?.name?.toUpperCase() ?? '',
    model: device?.model?.toUpperCase() ?? '',
    serialNumber: device?.serialNumber?.toUpperCase() ?? '',
    releaseDate: device.releaseDate
      ? new Date(
          new Date(Number(device.releaseDate)).getTime() -
            new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0]
      : '',
    grsiNumber: device.grsiNumber || '',
    measurementRange: device?.measurementRange?.toUpperCase() ?? '',
    accuracy: device?.accuracy?.toUpperCase() ?? '',
    inventoryNumber: device?.inventoryNumber?.toUpperCase() ?? '',
    receiptDate: device.receiptDate
      ? new Date(
          new Date(Number(device.receiptDate)).getTime() -
            new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0]
      : '',
    manufacturer: device.manufacturer?.toUpperCase() || '',
    verificationInterval: device.verificationInterval || '',
    archived: device.archived,
    nomenclature: device?.nomenclature?.toUpperCase() ?? '',
    comment: device.comment || '',
    statusId: device.status.id || '',
    productionSiteId: device.productionSite.id || '',
    equipmentTypeId: device.equipmentType?.id || '',
    measurementTypes: device.measurementTypes,
    scopes: device.scopes,
    primaryStandarts: device.primaryStandarts,
  });
  const verificationsState = device.verifications.map((verification) => {
    return {
      id: verification.id,
      date: verification.date
        ? new Date(
            new Date(Number(verification.date)).getTime() -
              new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .split('T')[0]
        : '',
      validUntil: verification.validUntil
        ? new Date(
            new Date(Number(verification.validUntil)).getTime() -
              new Date().getTimezoneOffset() * 60000
          )
            .toISOString()
            .split('T')[0]
        : '',
      result: verification.result || '',
      protocolNumber: verification.protocolNumber || '',
      organization: verification.organization || '',
      comment: verification.comment || '',
      documentUrl: verification.documentUrl || '',
      metrologyControleTypeId: verification.metrologyControleType?.id || '',
      verificationOrganizationId:
        verification.verificationOrganization?.id || '',
      deviceId: verification.deviceId,
      collapsed: true,
      cost: verification.cost || '',
    };
  });

  const [verifications, setVerifications] = useState<
    Array<{
      id: string;
      date: string;
      validUntil: string;
      result: string;
      protocolNumber: string;
      organization: string;
      comment: string;
      documentUrl: string;
      deviceId: string;
      metrologyControleTypeId: string;
      verificationOrganizationId: string;
      collapsed: boolean;
      cost: number | string;
    }>
  >(verificationsState);

  const addVerification = () => {
    setVerifications((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
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

  const removeVerification = (id: string) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVerificationChange = (
    id: string,
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

  const toggleCollapse = (id: string) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, collapsed: !v.collapsed } : v))
    );
  };

  // const productionSiteList =
  //   productionSiteData?.getProductionSitesForSelect || [];
  // const equipmentTypesList = equipmentTypesData?.equipmentTypes || [];
  // const statusesList = statusesData?.statuses || [];
  // const measurementTypesList = measurementTypesData?.measurementTypes || [];
  // const scopesList = scopesData?.scopes || [];
  // const primaryStandartsList = primaryStandartsData?.primaryStandarts || [];

  // const metrologyControlTypeList =
  //   metrologyControlTypeData?.metrologyControlTypes || [];

  // const verificationOrhanizationsList =
  //   verificationOrganizationsData?.verificationOrganizations || [];

  const [updateDevice, { loading: updating }] = useMutation(
    UpdateDeviceDocument,
    {
      // refetchQueries: [{ query: GetDevicesWithRelationsListDocument }],
      // awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Прибор успешно обновлен', {
          variant: 'success',
        });
        refetchDevice();
        closeDetails();
      },
      onError: (error) => {
        enqueueSnackbar(`Ошибка обновления: ${error.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const [deleteDevice, { loading: deleting }] = useMutation(
    DeleteDeviceDocument,
    {
      // refetchQueries: [{ query: GetDevicesWithRelationsListDocument }],
      // awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Прибор успешно удален', {
          variant: 'success',
        });
        refetchDevice();
        close();
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

    //   for (let i = 0; i < verifications.length; i++) {
    //   const v = verifications[i];
    //   const yearLabel = v.date ? new Date(v.date).getFullYear() : `№${i + 1}`;

    //   if (!v.date) {
    //     alert(`Ошибка в секции [Поверка ${yearLabel}]: Заполните обязательную дату проведения контроля!`);
    //     return;
    //   }
    //   if (!v.metrologyControleTypeId) {
    //     alert(`Ошибка в секции [Поверка ${yearLabel}]: Выберите тип метрологического контроля!`);
    //     return;
    //   }
    //   if (!v.verificationOrganizationId) {
    //     alert(`Ошибка в секции [Поверка ${yearLabel}]: Укажите организацию, проводившую контроль!`);
    //     return;
    //   }
    //   if (v.cost === undefined || v.cost === null || String(v.cost).trim() === '') {
    //     alert(`Ошибка в секции [Поверка ${yearLabel}]: Введите стоимость выполненных работ!`);
    //     return;
    //   }
    // }
    const verificationsInput = verifications.map((v) => ({
      id: v.id.startsWith('new-') ? null : v.id,
      date: v.date || null,
      validUntil: v.validUntil || null,
      result: v.result || null,
      protocolNumber: v.protocolNumber || null,
      organization: v.organization || null,
      comment: v.comment || null,
      documentUrl: v.documentUrl || null,
      metrologyControleTypeId: v.metrologyControleTypeId || null,
      verificationOrganizationId: v.verificationOrganizationId || null,
      cost: v.cost !== '' ? parseFloat(String(v.cost)) : 0,
    }));

    const data = {
      ...form,
      grsiNumber: form.grsiNumber || null,
      releaseDate: form.releaseDate || null,
      measurementRange: form.measurementRange || null,
      accuracy: form.accuracy || null,
      receiptDate: form.receiptDate || null,
      manufacturer: form.manufacturer || null,
      verificationInterval:
        form.verificationInterval !== ''
          ? Number(form.verificationInterval)
          : null,
      nomenclature: form.nomenclature || null,
      scopes: form.scopes.map((scope) => scope.id),
      primaryStandarts: form.primaryStandarts.map(
        (primaryStandart) => primaryStandart.id
      ),
      verifications: verificationsInput,
      inventoryNumber: form.inventoryNumber || null,
      equipmentTypeId: form.equipmentTypeId || null,
      measurementTypes: form.measurementTypes.map(
        (measurementType) => measurementType.id
      ),
    };
    await updateDevice({
      variables: { id: device.id, input: data },
    });
  };

  const handleDeleteClick = (id: string) => {
    setSelectedDeviceId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDeviceId('');
  };

  const handleConfirmDelete = async () => {
    handleCloseDialog();
    await deleteDevice({ variables: { id: selectedDeviceId } });
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
          Редактировать СИ
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
          />
          <TextField
            label="Модель"
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
            value={form.releaseDate.split('T')[0]}
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
            value={form.receiptDate.split('T')[0]}
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
            value={form.productionSiteId || ''}
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
          <Stack
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
          </Stack>
          {verifications.length === 0 ? (
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              Данные не добавлены
            </Typography>
          ) : (
            verifications.map((verification) => {
              const year = verification.date
                ? new Date(verification.date).getFullYear()
                : 'Новая поверка';
              return (
                <Accordion
                  key={verification.id}
                  expanded={!verification.collapsed}
                  onChange={() => toggleCollapse(verification.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>Поверка {year}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      <TextField
                        type="date"
                        label="Дата поверки"
                        value={verification.date.split('T')[0]}
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
                        value={verification.validUntil.split('T')[0]}
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

                      <TextField
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
                        disabled={true}
                      />

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

          {isMobile ? (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Tooltip title="Удалить СИ">
                <IconButton
                  onClick={() => handleDeleteClick(device.id)}
                  color="error"
                  aria-label="Удалить"
                  size="large"
                  disabled={deleting}
                >
                  <DeleteOutline />
                </IconButton>
              </Tooltip>
              <Tooltip title="Сохранить изменения">
                <IconButton
                  type="submit"
                  aria-label="Сохранить"
                  size="large"
                  color="primary"
                  disabled={updating}
                >
                  <Save />
                </IconButton>
              </Tooltip>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                type="button"
                onClick={() => handleDeleteClick(device.id)}
                color="error"
                variant="contained"
                size="large"
                disabled={deleting}
                startIcon={deleting && <CircularProgress size={16} />}
                sx={{ height: 36, borderRadius: 2 }}
              >
                {deleting ? 'Удаление...' : 'Удалить СИ'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={updating}
                startIcon={updating && <CircularProgress size={16} />}
                sx={{ height: 36, borderRadius: 2 }}
              >
                {updating ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Box>
          )}
        </Stack>
      </form>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Подтвердите удаление</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Вы действительно хотите удалить это средство измерения? Это действие
            нельзя отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
