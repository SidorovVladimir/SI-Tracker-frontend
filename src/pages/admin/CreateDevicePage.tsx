import { useMutation, useQuery } from '@apollo/client/react';
import { useRef, useState } from 'react';
import {
  CreateDeviceDocument,
  GetDevicesWithRelationsListDocument,
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
import { Add, Close, ExpandMore } from '@mui/icons-material';
import ScopeAutocomplete from '../../components/ScopeAutocomplete';
import EquipmentTextField from '../../components/EquipmentTextField';
import StatusTextField from '../../components/StatusTextField';
import ProductionSiteTextField from '../../components/ProductionSiteTextField';
import PrimaryStandartAutocomplete from '../../components/PrimaryStandartAutocomplete';
import MeasurementAutocomplete from '../../components/MeasurementAutocomplete';
import VerificationOrganizationTextField from '../../components/VerificationOrganizationTextField';
import MetrologyControlTypeTextField from '../../components/MetrologyControlTypeTextField';

export default function CreateDevicePage(props: { closeDetails: () => void }) {
  const { closeDetails } = props;
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
      },
    ]);
  };

  const removeVerification = (id: number) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
  };

  const handleVerificationChange = (
    id: number,
    field: string,
    value: string
  ) => {
    setVerifications((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
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
      refetchQueries: [{ query: GetDevicesWithRelationsListDocument }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Прибор успешно создан', {
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

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={creating}
              startIcon={creating && <CircularProgress size={16} />}
            >
              {creating ? 'Создание...' : 'Создать'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Box>
  );
}
