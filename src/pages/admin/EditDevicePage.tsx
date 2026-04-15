import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  DeleteDeviceDocument,
  GetDevicesWithRelationsListDocument,
  GetDeviceWithRelationDocument,
  GetDeviceWithRelationQuery,
  GetEquipmentTypesListDocument,
  GetMeasurementTypesListDocument,
  GetMetrologyControlTypesListDocument,
  GetProductionSitesForSelectDocument,
  GetScopesListDocument,
  GetStatusListDocument,
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
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, ExpandMore } from '@mui/icons-material';
import ScopeAutocomplete from '../../components/ScopeAutocomplete';
import MeasurementTextField from '../../components/MeasurementTextField';
import EquipmentTextField from '../../components/EquipmentTextField';
import StatusTextField from '../../components/StatusTextField';
import ProductionSiteTextField from '../../components/ProductionSiteTextField';

export default function EditDevicePage(props: {
  deviceId: string;
  closeDetails: () => void;
}) {
  const { deviceId, closeDetails } = props;
  const {
    data: deviceData,
    loading,
    error,
  } = useQuery(GetDeviceWithRelationDocument, {
    variables: {
      id: deviceId,
    },
  });

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        Ошибка загрузки СИ: {error.message}
      </Alert>
    );
  if (!deviceData?.device) return <Alert>СИ не найдено</Alert>;

  return (
    <UserForm
      key={deviceId}
      device={deviceData.device}
      closeDetails={closeDetails}
    />
  );
}

function UserForm({
  device,
  closeDetails,
}: {
  device: NonNullable<GetDeviceWithRelationQuery['device']>;
  closeDetails: () => void;
}) {
  const { data: productionSiteData } = useQuery(
    GetProductionSitesForSelectDocument
  );
  const { data: equipmentTypesData } = useQuery(GetEquipmentTypesListDocument);
  const { data: statusesData } = useQuery(GetStatusListDocument);
  const { data: measurementTypesData } = useQuery(
    GetMeasurementTypesListDocument
  );
  const { data: scopesData } = useQuery(GetScopesListDocument);
  const { data: metrologyControlTypeData } = useQuery(
    GetMetrologyControlTypesListDocument
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
    verificationInterval: number | string;
    archived: boolean;
    nomenclature: string;
    statusId: string;
    productionSiteId: string;
    equipmentTypeId: string;
    measurementTypeId: string;
    scopes: { id: string; name: string }[];
  }>({
    name: device.name || '',
    model: device.model || '',
    serialNumber: device.serialNumber || '',
    releaseDate: device.releaseDate
      ? new Date(
          new Date(Number(device.releaseDate)).getTime() -
            new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0]
      : '',
    grsiNumber: device.grsiNumber || '',
    measurementRange: device.measurementRange || '',
    accuracy: device.accuracy || '',
    inventoryNumber: device.inventoryNumber || '',
    receiptDate: device.receiptDate
      ? new Date(
          new Date(Number(device.receiptDate)).getTime() -
            new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .split('T')[0]
      : '',
    manufacturer: device.manufacturer || '',
    verificationInterval: device.verificationInterval || '',
    archived: device.archived,
    nomenclature: device.nomenclature || '',
    statusId: device.status.id || '',
    productionSiteId: device.productionSite.id || '',
    equipmentTypeId: device.equipmentType?.id || '',
    measurementTypeId: device.measurementType?.id || '',
    scopes: device.scopes,
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
      deviceId: verification.deviceId,
      collapsed: true,
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
      collapsed: boolean;
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
        deviceId: '',
        collapsed: false,
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
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const toggleCollapse = (id: string) => {
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

  const metrologyControlTypeList =
    metrologyControlTypeData?.metrologyControlTypes || [];

  const [updateDevice, { loading: updating }] = useMutation(
    UpdateDeviceDocument,
    {
      refetchQueries: [{ query: GetDevicesWithRelationsListDocument }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Прибор успешно обновлен', {
          variant: 'success',
        });
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
      refetchQueries: [{ query: GetDevicesWithRelationsListDocument }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Прибор успешно удален', {
          variant: 'success',
        });
        closeDetails();
      },
      onError: (error) => {
        enqueueSnackbar(`Ошибка создания: ${error.message}`, {
          variant: 'error',
        });
      },
    }
  );

  const handleDelete = async (deviceId: string) => {
    await deleteDevice({ variables: { id: deviceId } });
  };

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
      verifications: verificationsInput,
      inventoryNumber: form.inventoryNumber || null,
      equipmentTypeId: form.equipmentTypeId || null,
      measurementTypeId: form.measurementTypeId || null,
    };
    await updateDevice({
      variables: { id: device.id, input: data },
    });
  };

  return (
    <Box>
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
            label="Серийный номер"
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
            label="Дата получения"
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
            label="Производитель"
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

          <MeasurementTextField
            value={form.measurementTypeId}
            onChange={handleChange}
            measurementList={measurementTypesList}
          />

          <ScopeAutocomplete
            value={form.scopes}
            onChange={(_: string, val: { id: string; name: string }[]) =>
              handleAutocompleteChange('scopes', val)
            }
            scopesList={scopesList}
          />

          <Divider sx={{ my: 2 }} />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Typography variant="h6" gutterBottom>
              Добавить данные поверок
            </Typography>
            <Tooltip title="Добавить">
              <IconButton onClick={addVerification} color="primary">
                <Add />
              </IconButton>
            </Tooltip>
          </Stack>
          {verifications.length === 0 ? (
            <Typography color="textSecondary" sx={{ mb: 2 }}>
              Поверки не добавлены
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
                      />

                      <TextField
                        label="Организация поверитель"
                        value={verification.organization}
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'organization',
                            e.target.value
                          )
                        }
                        fullWidth
                        size="small"
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
                      />

                      <TextField
                        id="outlined-select-currency"
                        select
                        label="Вид метрологического контроля"
                        name="metrologyControleTypeId"
                        size="small"
                        fullWidth
                        onChange={(e) =>
                          handleVerificationChange(
                            verification.id,
                            'metrologyControleTypeId',
                            e.target.value
                          )
                        }
                        value={verification.metrologyControleTypeId}
                      >
                        {metrologyControlTypeList.map(({ id, name }) => (
                          <MenuItem key={id} value={id}>
                            {name}
                          </MenuItem>
                        ))}
                      </TextField>

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

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              type="button"
              onClick={() => handleDelete(device.id)}
              color="error"
              variant="contained"
              size="large"
              disabled={deleting}
              startIcon={deleting && <CircularProgress size={16} />}
            >
              {deleting ? 'Удаление...' : 'Удалить СИ'}
            </Button>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={updating}
              startIcon={updating && <CircularProgress size={16} />}
            >
              {updating ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
}
