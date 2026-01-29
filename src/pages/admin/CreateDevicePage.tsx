import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CreateProductionSiteDocument,
  GetCompaniesDocument,
  GetEquipmentTypesListDocument,
  GetMeasurementTypesListDocument,
  GetProductionSitesForSelectDocument,
  GetSitiesDocument,
  GetStatusListDocument,
} from '../../graphql/types/__generated__/graphql';
import { enqueueSnackbar } from 'notistack';
import routes from '../../utils/routes';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
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

  // const navigate = useNavigate();
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
  });
  const productionSiteList =
    productionSiteData?.getProductionSitesForSelect || [];
  const equipmentTypesList = equipmentTypesData?.equipmentTypes || [];
  const statusesList = statusesData?.statuses || [];
  const measurementTypesList = measurementTypesData?.measurementTypes || [];

  const [createProductionSite, { loading: creating }] = useMutation(
    CreateProductionSiteDocument,
    {
      refetchQueries: [{ query: GetProductionSitesForSelectDocument }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Производственный участок успешно создан', {
          variant: 'success',
        });
        // navigate(routes.admin.productionSites());
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
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProductionSite({
      variables: { input: form },
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Создание прибора
      </Typography>

      <Paper
        variant="outlined"
        sx={{ p: 4, borderRadius: 3, bgcolor: 'background.paper' }}
      >
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
            />
            <TextField
              label="Модель"
              name="model"
              value={form.model}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
            />
            <TextField
              label="Серийный номер"
              name="serialNumber"
              value={form.serialNumber}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              size="small"
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
              type="number"
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
      </Paper>
    </Box>
  );
}
