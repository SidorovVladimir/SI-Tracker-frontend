import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CreateProductionSiteDocument,
  GetCompaniesDocument,
  GetProductionSitesForSelectDocument,
  GetSitiesDocument,
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

type FieldErrors = {
  name?: string;
  companyId?: string;
  cityId?: string;
};

export default function CreateProductionSite() {
  const { data: citiesData } = useQuery(GetSitiesDocument);
  const { data: companiesData } = useQuery(GetCompaniesDocument);
  const navigate = useNavigate();
  const [form, setForm] = useState<{
    name: string;
    companyId: string;
    cityId: string;
  }>({
    name: '',
    companyId: '',
    cityId: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const сitiesList = citiesData?.cities || [];
  const companiesList = companiesData?.companies || [];

  const [createProductionSite, { loading: creating }] = useMutation(
    CreateProductionSiteDocument,
    {
      refetchQueries: [{ query: GetProductionSitesForSelectDocument }],
      awaitRefetchQueries: true,
      onCompleted: () => {
        enqueueSnackbar('Производственный участок успешно создан', {
          variant: 'success',
        });
        navigate(routes.admin.productionSites());
      },
      onError: (error) => {
        try {
          const parsed = JSON.parse(error.message);
          if (Array.isArray(parsed)) {
            const errors: FieldErrors = {};
            parsed.forEach((err) => {
              if (err.path.includes('name')) {
                errors.name = err.message;
              }
              if (err.path.includes('companyId')) {
                errors.companyId = err.message;
              }
              if (err.path.includes('cityId')) {
                errors.cityId = err.message;
              }
            });
            setFieldErrors(errors);
          }
        } catch {
          enqueueSnackbar(`Ошибка создания: ${error.message}`, {
            variant: 'error',
          });
        }
      },
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    await createProductionSite({
      variables: { input: form },
    });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 3, mb: 6 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Создание производственного участка
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
              required
              error={!!fieldErrors.name}
              helperText={fieldErrors.name}
            />
            <TextField
              id="outlined-select-currency"
              select
              label="Город"
              name="cityId"
              size="small"
              fullWidth
              required
              onChange={handleChange}
              value={form.cityId}
              error={!!fieldErrors.cityId}
              helperText={fieldErrors.cityId}
            >
              {сitiesList.map(({ id, name }) => (
                <MenuItem key={id} value={id}>
                  {name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              id="outlined-select-currency"
              select
              label="Компания"
              name="companyId"
              size="small"
              fullWidth
              required
              onChange={handleChange}
              value={form.companyId}
              error={!!fieldErrors.companyId}
              helperText={fieldErrors.companyId}
            >
              {companiesList.map(({ id, name }) => (
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
