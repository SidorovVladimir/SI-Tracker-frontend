import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  CreateDeviceDocument,
  GetDevicesWithRelationsListDocument,
  GetEquipmentTypesListDocument,
  GetMeasurementTypesListDocument,
  GetProductionSitesForSelectDocument,
  GetScopesListDocument,
  GetStatusListDocument,
} from '../../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

export default function CreateDevicePage() {
  const { data: productionSiteData } = useQuery(
    GetProductionSitesForSelectDocument
  );
  const { data: equipmentTypesData } = useQuery(GetEquipmentTypesListDocument);
  const { data: statusesData } = useQuery(GetStatusListDocument);
  const { data: measurementTypesData } = useQuery(
    GetMeasurementTypesListDocument
  );
  const { data: scopesData } = useQuery(GetScopesListDocument);

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
    statusId: '',
    productionSiteId: '',
    equipmentTypeId: '',
    measurementTypeId: '',
    scopes: [],
  });
  const productionSiteList =
    productionSiteData?.getProductionSitesForSelect || [];
  const equipmentTypesList = equipmentTypesData?.equipmentTypes || [];
  const statusesList = statusesData?.statuses || [];
  const measurementTypesList = measurementTypesData?.measurementTypes || [];
  const scopesList = scopesData?.scopes || [];

  const [createDevice, { loading: creating }] = useMutation(
    CreateDeviceDocument,
    {
      refetchQueries: [{ query: GetDevicesWithRelationsListDocument }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Прибор успешно создан', {
          variant: 'success',
        });
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
    };
    await createDevice({
      variables: { input: data },
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
            required
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
            label="Дата получения"
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

          <TextField
            id="outlined-select-currency"
            select
            label="Состояние"
            name="statusId"
            size="small"
            fullWidth
            onChange={handleChange}
            value={form.statusId}
            required
          >
            {statusesList.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="outlined-select-currency"
            select
            label="Производственный участок"
            name="productionSiteId"
            size="small"
            fullWidth
            onChange={handleChange}
            value={form.productionSiteId}
            required
          >
            {productionSiteList.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="outlined-select-currency"
            select
            label="Тип оборудования"
            name="equipmentTypeId"
            size="small"
            fullWidth
            required
            onChange={handleChange}
            value={form.equipmentTypeId}
          >
            {equipmentTypesList.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            id="outlined-select-currency"
            select
            label="Вид измерения"
            name="measurementTypeId"
            size="small"
            fullWidth
            required
            onChange={handleChange}
            value={form.measurementTypeId}
          >
            {measurementTypesList.map(({ id, name }) => (
              <MenuItem key={id} value={id}>
                {name}
              </MenuItem>
            ))}
          </TextField>

          <Autocomplete
            multiple
            options={scopesList}
            getOptionLabel={(option) => option.name}
            value={form.scopes}
            onChange={(_, newValue) => {
              handleAutocompleteChange('scopes', newValue);
            }}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Сферы применения"
                placeholder="Выберите сферы"
                size="small"
              />
            )}
          />

          <Divider sx={{ my: 2 }} />

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
