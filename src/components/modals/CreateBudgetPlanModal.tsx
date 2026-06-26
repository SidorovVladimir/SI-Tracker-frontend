// // src/modules/budget/components/CreateBudgetPlanModal.tsx
// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   FormGroup,
//   FormControlLabel,
//   Checkbox,
//   Typography,
//   Box,
//   CircularProgress,
//   Alert,
//   Divider,
// } from '@mui/material';
// import { useMutation, useQuery } from '@apollo/client/react';
// import {
//   CreateBudgetPlanDocument,
//   GetPricelistsDocument,
// } from '../../graphql/types/__generated__/graphql';
// import { formatStrictUpper } from '../../utils/capitalize';

// interface CreateBudgetPlanModalProps {
//   open: boolean;
//   onClose: () => void;
// }

// export const CreateBudgetPlanModal: React.FC<CreateBudgetPlanModalProps> = ({
//   open,
//   onClose,
// }) => {
//   // Текущий год по умолчанию для планирования (следующий от текущего)
//   const currentYear = new Date().getFullYear();
//   const [year, setYear] = useState<number>(currentYear + 1);
//   const [comment, setComment] = useState<string>('');
//   const [selectedPricelistIds, setSelectedPricelistIds] = useState<string[]>(
//     []
//   );
//   const [submitting, setSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);

//   // 1. Загружаем доступные в базе прейскуранты ЦСМ
//   const { data, loading, error } = useQuery(GetPricelistsDocument, {
//     skip: !open,
//     fetchPolicy: 'network-only',
//   });

//   // 2. Мутация создания бюджета
//   const [createBudgetPlan] = useMutation(CreateBudgetPlanDocument, {
//     // После создания обновляем основной список бюджетов на главной странице
//     refetchQueries: [{ query: GetPricelistsDocument }],
//   });

//   const pricelists = data?.pricelists || [];

//   // Хэндлер выбора/отмены чекбокса прайса
//   const handleTogglePricelist = (id: string) => {
//     setSelectedPricelistIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   };

//   // Хэндлер отправки формы на бэкенд (Запуск каскадного расчета)
//   const handleSubmit = async () => {
//     if (selectedPricelistIds.length === 0) {
//       setSubmitError(
//         'Необходимо выбрать хотя бы один прейскурант ЦСМ для расчета цен.'
//       );
//       return;
//     }

//     setSubmitting(true);
//     setSubmitError(null);

//     try {
//       await createBudgetPlan({
//         variables: {
//           input: {
//             year,
//             comment: comment || undefined, // Корректно передаем undefined в соответствии с exactOptionalPropertyTypes
//             pricelistIds: selectedPricelistIds,
//           },
//         },
//       });
//       // Сбрасываем форму и закрываем окно при успехе
//       setComment('');
//       setSelectedPricelistIds([]);
//       onClose();
//     } catch (err: any) {
//       setSubmitError(err.message || 'Произошла ошибка при генерации бюджета.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
//       <DialogTitle sx={{ fontWeight: 'bold' }}>
//         Создание годового бюджета
//       </DialogTitle>

//       <DialogContent dividers>
//         {submitError && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {submitError}
//           </Alert>
//         )}

//         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
//           {/* Поле выбора года */}
//           <TextField
//             label="Год планирования"
//             type="number"
//             size="small"
//             value={year}
//             onChange={(e) =>
//               setYear(parseInt(e.target.value, 10) || currentYear)
//             }
//             disabled={submitting}
//             fullWidth
//           />

//           {/* Поле комментария */}
//           <TextField
//             label="Примечание / Комментарий"
//             multiline
//             rows={2}
//             size="small"
//             value={comment}
//             onChange={(e) => setComment(e.target.value)}
//             disabled={submitting}
//             fullWidth
//           />

//           <Divider />

//           {/* Секция выбора прайсов */}
//           <Box>
//             <Typography
//               variant="subtitle2"
//               color="textSecondary"
//               sx={{ mb: 1, fontWeight: 'bold' }}
//             >
//               Выберите прейскуранты ЦСМ для каскадного расчета:
//             </Typography>

//             {loading ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
//                 <CircularProgress size={24} />
//               </Box>
//             ) : error ? (
//               <Alert severity="warning">
//                 Не удалось загрузить прейскуранты: {error.message}
//               </Alert>
//             ) : pricelists.length === 0 ? (
//               <Typography variant="body2" color="error" sx={{ my: 1 }}>
//                 В базе данных нет загруженных прейскурантов. Сначала загрузите
//                 Excel-файлы прайсов.
//               </Typography>
//             ) : (
//               <FormGroup sx={{ maxHeight: 200, overflowY: 'auto', pl: 1 }}>
//                 {pricelists.map((list) => (
//                   <FormControlLabel
//                     key={list.id}
//                     control={
//                       <Checkbox
//                         checked={selectedPricelistIds.includes(list.id)}
//                         onChange={() => handleTogglePricelist(list.id)}
//                         disabled={submitting}
//                         size="small"
//                       />
//                     }
//                     label={
//                       <Box>
//                         <Typography
//                           variant="body2"
//                           sx={{ fontWeight: 'medium' }}
//                         >
//                           {list.title} ({list.year} г.)
//                         </Typography>
//                         <Typography
//                           variant="caption"
//                           color="textSecondary"
//                           display="block"
//                         >
//                           Организация:{' '}
//                           {formatStrictUpper(
//                             list.verificationOrganization.name
//                           )}{' '}
//                           | {list.isRegulated ? 'Регулируемый' : 'Договорной'}
//                         </Typography>
//                       </Box>
//                     }
//                     sx={{ mb: 1, alignItems: 'flex-start' }}
//                   />
//                 ))}
//               </FormGroup>
//             )}
//           </Box>
//         </Box>
//       </DialogContent>

//       <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
//         <Button onClick={onClose} disabled={submitting} color="inherit">
//           Отмена
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           variant="contained"
//           color="primary"
//           disabled={submitting || pricelists.length === 0}
//         >
//           {submitting ? (
//             <CircularProgress size={24} color="inherit" />
//           ) : (
//             'Запустить расчет бюджета'
//           )}
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
// import React, { useState, useMemo } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   TextField,
//   MenuItem,
//   Stack,
//   Autocomplete,
//   Checkbox,
//   Box,
//   Typography,
// } from '@mui/material';
// import { useQuery } from '@apollo/client/react';
// import {
//   GetCompaniesDocument,
//   GetProductionSitesDocument,
//   GetSitiesDocument,
// } from '../../graphql/types/__generated__/graphql';

// // Описываем структуру локаций для рамок создаваемого бюджета
// interface ModalFilterState {
//   cityId: string;
//   companyId: string;
//   siteId: string;
// }

// const initialModalFilters: ModalFilterState = {
//   cityId: '',
//   companyId: '',
//   siteId: '',
// };

// // Предположим, компонент называется CreateBudgetPlanModal
// export const CreateBudgetPlanModal: React.FC<{
//   open: boolean;
//   onClose: () => void;
//   onSubmit: (variables: any) => void;
//   loading: boolean;
//   pricelists: any[]; // Список загруженных прайс-листов ЦСМ из вашей системы
// }> = ({ open, onClose, onSubmit, loading, pricelists }) => {
//   // Основные метаданные бюджета
//   const [year, setYear] = useState<number>(new Date().getFullYear() + 1); // По умолчанию следующий год
//   const [comment, setComment] = useState<string>('');
//   const [selectedPricelistIds, setSelectedPricelistIds] = useState<string[]>(
//     []
//   );

//   // 🎯 СТЕЙТ КАСКАДНЫХ ФИЛЬТРОВ ЛОКАЦИИ БЮДЖЕТА
//   const [locationFilters, setLocationFilters] =
//     useState<ModalFilterState>(initialModalFilters);

//   // Загружаем справочники для построения каскада в модалке
//   const { data: citiesData } = useQuery(GetSitiesDocument);
//   const { data: companiesData } = useQuery(GetCompaniesDocument);
//   const { data: productionSiteData } = useQuery(GetProductionSitesDocument);
//   // 1. Сортировка базовых справочников
//   const cities = useMemo(() => {
//     const raw = citiesData?.cities || [];
//     return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//   }, [citiesData]);

//   const companies = useMemo(() => {
//     const raw = companiesData?.companies || [];
//     return [...raw].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
//   }, [companiesData]);

//   // 2. СТРОГИЙ КАСКАД ПО ID ДЛЯ МОДАЛКИ
//   const filteredProductionSites = useMemo(() => {
//     const rawSites = productionSiteData?.productionSites || [];

//     let filtered = rawSites;
//     if (locationFilters.cityId) {
//       filtered = filtered.filter(
//         (site) => site.cityId === locationFilters.cityId
//       );
//     }
//     if (locationFilters.companyId) {
//       filtered = filtered.filter(
//         (site) => site.companyId === locationFilters.companyId
//       );
//     }

//     return [...filtered].sort((a, b) =>
//       (a.name || '').localeCompare(b.name || '')
//     );
//   }, [productionSiteData, locationFilters.cityId, locationFilters.companyId]);

//   // 3. Обработчик каскадных изменений в модалке
//   const handleLocationChange = (
//     field: keyof ModalFilterState,
//     value: string
//   ) => {
//     setLocationFilters((prev) => {
//       const updated = { ...prev, [field]: value };
//       if (field === 'cityId' || field === 'companyId') {
//         updated.siteId = ''; // Сбрасываем участок при смене родителя
//       }
//       return updated;
//     });
//   };

//   // 4. Сборка данных при подтверждении отправки формы
//   const handleFormSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (selectedPricelistIds.length === 0) {
//       alert('Выберите хотя бы один прейскурант ЦСМ для расчета цен!');
//       return;
//     }

//     // Отправляем структурированные UUID на бэкенд
//     onSubmit({
//       variables: {
//         input: {
//           year: Number(year),
//           comment: comment.trim() || undefined,
//           pricelistIds: selectedPricelistIds,
//           // Передаем жесткие границы Scope, если они выбраны (пустые строки превращаем в undefined)
//           cityId: locationFilters.cityId || undefined,
//           companyId: locationFilters.companyId || undefined,
//           siteId: locationFilters.siteId || undefined,
//         },
//       },
//     });
//   };
//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle
//         sx={{ fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}
//       >
//         ➕ Создание годового плана бюджета
//       </DialogTitle>

//       <form onSubmit={handleFormSubmit}>
//         <DialogContent dividers>
//           <Stack spacing={2.5}>
//             {/* Год и комментарий */}
//             <Stack direction="row" spacing={2}>
//               <TextField
//                 label="Год планирования"
//                 type="number"
//                 size="small"
//                 fullWidth
//                 required
//                 value={year}
//                 onChange={(e) => setYear(parseInt(e.target.value, 10) || year)}
//               />
//               <TextField
//                 label="Комментарий / Описание"
//                 size="small"
//                 fullWidth
//                 value={comment}
//                 onChange={(e) => setComment(e.target.value)}
//                 placeholder="Например: Бюджет Сибирь"
//               />
//             </Stack>

//             {/* Множественный выбор прайс-листов ЦСМ через Autocomplete */}
//             <Autocomplete
//               multiple
//               size="small"
//               // Если из родителя прилетел undefined, используем пустой массив, чтобы страница не падала
//               options={pricelists || []}
//               disableCloseOnSelect
//               getOptionLabel={(option: any) =>
//                 option
//                   ? `${option.title} (${option.year} г.) — ${
//                       option.verificationOrganization?.name || '—'
//                     }`
//                   : ''
//               }
//               // Защищаем метод .filter() с помощью опциональной цепочки ?. и фолбека
//               value={(pricelists || []).filter((p) =>
//                 selectedPricelistIds.includes(p?.id)
//               )}
//               onChange={(_, newValue) =>
//                 setSelectedPricelistIds((newValue || []).map((p: any) => p.id))
//               }
//               renderOption={(props, option, { selected }) => (
//                 <li {...props} key={option.id}>
//                   <Checkbox
//                     size="small"
//                     style={{ marginRight: 8 }}
//                     checked={selected}
//                   />
//                   {option.title} ({option.year} г.)
//                 </li>
//               )}
//               renderInput={(params) => (
//                 <TextField
//                   {...params}
//                   label="Прейскуранты ЦСМ для расчета цен"
//                   required
//                   placeholder="Выберите прайсы..."
//                 />
//               )}
//             />

//             <Box sx={{ borderTop: '1px dashed #e0e0e0', pt: 2, mt: 1 }}>
//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 display="block"
//                 sx={{
//                   fontWeight: 'bold',
//                   mb: 1.5,
//                   textTransform: 'uppercase',
//                   letterSpacing: '0.5px',
//                 }}
//               >
//                 🎯 Границы расчета бюджета (Опционально):
//               </Typography>

//               <Stack spacing={2}>
//                 {/* 🏙️ СЕЛЕКТОР ГОРОДА */}
//                 <TextField
//                   label="Ограничить по городу"
//                   size="small"
//                   select
//                   fullWidth
//                   value={locationFilters.cityId}
//                   onChange={(e) =>
//                     handleLocationChange('cityId', e.target.value)
//                   }
//                 >
//                   <MenuItem value="">
//                     <em>Все регионы / Без ограничений</em>
//                   </MenuItem>
//                   {cities.map((city: any) => (
//                     <MenuItem key={city.id} value={city.id}>
//                       {city.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>

//                 {/* 🏢 СЕЛЕКТОР ОРГАНИЗАЦИИ */}
//                 <TextField
//                   label="Ограничить по организации"
//                   size="small"
//                   select
//                   fullWidth
//                   value={locationFilters.companyId}
//                   onChange={(e) =>
//                     handleLocationChange('companyId', e.target.value)
//                   }
//                 >
//                   <MenuItem value="">
//                     <em>Все юрлица / Без ограничений</em>
//                   </MenuItem>
//                   {companies.map((co: any) => (
//                     <MenuItem key={co.id} value={co.id}>
//                       {co.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>

//                 {/* 🏭 КАСКАДНЫЙ СЕЛЕКТОР УЧАСТКА */}
//                 <TextField
//                   label="Ограничить по участку / цеху"
//                   size="small"
//                   select
//                   fullWidth
//                   value={locationFilters.siteId}
//                   onChange={(e) =>
//                     handleLocationChange('siteId', e.target.value)
//                   }
//                   disabled={filteredProductionSites.length === 0}
//                 >
//                   <MenuItem value="">
//                     <em>Все подразделения / Без ограничений</em>
//                   </MenuItem>
//                   {filteredProductionSites.map((site: any) => (
//                     <MenuItem key={site.id} value={site.id}>
//                       {site.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Stack>

//               <Typography
//                 variant="caption"
//                 color="text.secondary"
//                 display="block"
//                 sx={{ mt: 1.5, fontStyle: 'italic' }}
//               >
//                 💡 Если локации не выбраны, бюджет сформируется автоматически по
//                 всем активным приборам компании.
//               </Typography>
//             </Box>
//           </Stack>
//         </DialogContent>

//         <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
//           <Button
//             onClick={onClose}
//             color="inherit"
//             disabled={loading}
//             sx={{ textTransform: 'none', fontWeight: 'bold' }}
//           >
//             Отмена
//           </Button>
//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             disabled={loading}
//             sx={{ textTransform: 'none', fontWeight: 'bold' }}
//           >
//             {loading
//               ? '🚀 Расчет каскада цен...'
//               : '📊 Сформировать годовой бюджет'}
//           </Button>
//         </DialogActions>
//       </form>
//     </Dialog>
//   );
// };
// src/modules/budget/components/CreateBudgetPlanModal.tsx
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
  Divider,
  MenuItem,
  Stack,
} from '@mui/material';
import { useMutation, useQuery } from '@apollo/client';
import {
  CreateBudgetPlanDocument,
  GetPricelistsDocument,
  GetCompaniesDocument,
  GetSitiesDocument,
  GetProductionSitesDocument,
} from '../../graphql/types/__generated__/graphql';
import { formatStrictUpper } from '../../utils/capitalize';

// Структура стейта локации для рамок расчета
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
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear + 1);
  const [comment, setComment] = useState<string>('');
  const [selectedPricelistIds, setSelectedPricelistIds] = useState<string[]>(
    []
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 🎯 СТЕЙТ КАСКАДНЫХ ФИЛЬТРОВ ГРАНИЦЫ БЮДЖЕТА
  const [locationFilters, setLocationFilters] =
    useState<ModalFilterState>(initialModalFilters);
  // 1. Загружаем доступные в базе прейскуранты ЦСМ (Ваш родной рабочий хук)
  const { data, loading, error } = useQuery(GetPricelistsDocument, {
    skip: !open,
    fetchPolicy: 'network-only',
  });

  // Загружаем глобальные UUID справочники для каскада
  const { data: citiesData } = useQuery(GetSitiesDocument, { skip: !open });
  const { data: companiesData } = useQuery(GetCompaniesDocument, {
    skip: !open,
  });
  const { data: productionSiteData } = useQuery(GetProductionSitesDocument, {
    skip: !open,
  });

  // 2. Мутация создания бюджета
  const [createBudgetPlan] = useMutation(CreateBudgetPlanDocument, {
    refetchQueries: [{ query: GetPricelistsDocument }],
  });

  const pricelists = data?.pricelists || [];

  // Мемоизация и каскадный отбор справочников локаций строго по ID
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
      if (field === 'cityId' || field === 'companyId') {
        updated.siteId = ''; // Сбрасываем участок при изменении родителя
      }
      return updated;
    });
  };

  const handleTogglePricelist = (id: string) => {
    setSelectedPricelistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Хэндлер отправки формы с передачей UUID на бэкенд
  const handleSubmit = async () => {
    if (selectedPricelistIds.length === 0) {
      setSubmitError(
        'Необходимо выбрать хотя бы один прейскурант ЦСМ для расчета цен.'
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
            comment: comment || undefined,
            pricelistIds: selectedPricelistIds,
            // 🎯 СТРОГИЕ UUID ГРАНИЦ СРЕЗА УХОДЯТ В МУТАЦИЮ
            cityId: locationFilters.cityId || undefined,
            companyId: locationFilters.companyId || undefined,
            siteId: locationFilters.siteId || undefined,
          },
        },
      });
      setComment('');
      setSelectedPricelistIds([]);
      setLocationFilters(initialModalFilters); // Очищаем каскад
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || 'Произошла ошибка при генерации бюджета.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 'bold', fontFamily: '"Inter", sans-serif' }}
      >
        Создание годового бюджета
      </DialogTitle>

      <DialogContent dividers>
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
          {/* Поле выбора года */}
          <TextField
            label="Год планирования"
            type="number"
            size="small"
            value={year}
            onChange={(e) =>
              setYear(parseInt(e.target.value, 10) || currentYear)
            }
            disabled={submitting}
            fullWidth
          />

          {/* Поле комментария */}
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
              {/* 🏙️ СЕЛЕКТОР ГОРОДА */}
              <TextField
                label="Ограничить по городу"
                size="small"
                select
                fullWidth
                value={locationFilters.cityId}
                disabled={submitting}
                onChange={(e) => handleLocationChange('cityId', e.target.value)}
              >
                <MenuItem value="">
                  <em>Все регионы / Без ограничений</em>
                </MenuItem>
                {cities.map((city: any) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* 🏢 СЕЛЕКТОР ОРГАНИЗАЦИИ */}
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
              >
                <MenuItem value="">
                  <em>Все юрлица / Без ограничений</em>
                </MenuItem>
                {companies.map((co: any) => (
                  <MenuItem key={co.id} value={co.id}>
                    {co.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* 🏭 КАСКАДНЫЙ СЕЛЕКТОР УЧАСТКА */}
              <TextField
                label="Ограничить по участку / цеху"
                size="small"
                select
                fullWidth
                value={locationFilters.siteId}
                disabled={submitting || filteredProductionSites.length === 0}
                onChange={(e) => handleLocationChange('siteId', e.target.value)}
              >
                <MenuItem value="">
                  <em>Все подразделения / Без ограничений</em>
                </MenuItem>
                {filteredProductionSites.map((site: any) => (
                  <MenuItem key={site.id} value={site.id}>
                    {site.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Box>

          <Divider />
          {/* Секция выбора прайсов (Ваша родная рабочая верстка) */}
          <Box>
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
              <Typography variant="body2" color="error" sx={{ my: 1 }}>
                В базе данных нет загруженных прейскурантов. Сначала загрузите
                Excel-файлы прайсов.
              </Typography>
            ) : (
              <FormGroup sx={{ maxHeight: 180, overflowY: 'auto', pl: 1 }}>
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
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 'medium' }}
                        >
                          {list.title} ({list.year} г.)
                        </Typography>
                        <Typography
                          variant="caption"
                          color="textSecondary"
                          display="block"
                        >
                          Организация:{' '}
                          {formatStrictUpper(
                            list.verificationOrganization.name
                          )}{' '}
                          | {list.isRegulated ? 'Регулируемый' : 'Договорной'}
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: 1, alignItems: 'flex-start' }}
                  />
                ))}
              </FormGroup>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} disabled={submitting} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={submitting || pricelists.length === 0}
        >
          {submitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Запустить расчет бюджета'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
