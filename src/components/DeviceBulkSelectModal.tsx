// import React, { useState } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
//   Button,
//   TableContainer,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Checkbox,
//   CircularProgress,
//   Typography,
//   Box,
//   Divider,
//   TablePagination,
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import InputAdornment from '@mui/material/InputAdornment';
// import { useQuery } from '@apollo/client/react';
// import { GetDevicesWithRelationsListDocument } from '../graphql/types/__generated__/graphql';
// import { cleanSpaces } from '../utils/capitalize';

// interface DeviceBulkSelectModalProps {
//   open: boolean;
//   onClose: () => void;
//   onAddDevices: (selectedDevices: any[]) => void;
//   alreadyAddedIds: string[];
// }

// export const DeviceBulkSelectModal: React.FC<DeviceBulkSelectModalProps> = ({
//   open,
//   onClose,
//   onAddDevices,
//   alreadyAddedIds,
// }) => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);

//   // Локальная корзина (хранит выбранные объекты приборов целиком)
//   const [basket, setBasket] = useState<any[]>([]);

//   // Тянем любые приборы холдинга (используем ваш быстрый GraphQL-запрос с главной)
//   const { data, loading } = useQuery(GetDevicesWithRelationsListDocument, {
//     variables: {
//       limit: rowsPerPage,
//       offset: page * rowsPerPage,
//       filter: {
//         serialNumber: searchQuery.trim() || undefined,
//         includeArchived: false,
//       },
//     },
//     skip: !open,
//     fetchPolicy: 'network-only',
//   });

//   const devices = data?.devicesWithRelations?.items ?? [];
//   const totalCount = data?.devicesWithRelations?.totalCount ?? 0;

//   const handleToggleDevice = (device: any) => {
//     setBasket((prev) =>
//       prev.some((d) => d.id === device.id)
//         ? prev.filter((d) => d.id !== device.id)
//         : [...prev, device]
//     );
//   };

//   const handleSubmit = () => {
//     // Адаптируем объекты под плоский контракт таблицы пула осмотров текущего месяца
//     const adaptedDevices = basket.map((found) => ({
//       id: found.id,
//       name: found.name,
//       model: found.model,
//       serialNumber: found.serialNumber,
//       lastInspectionDate: found.latestInspection?.date ?? null,
//       validUntil: new Date().toISOString(),
//       isOverdue: false,
//       isManualExtra: true, // Флаг для синего чипса "Вне плана"
//     }));

//     onAddDevices(adaptedDevices);
//     setBasket([]); // Очищаем буфер
//     onClose();
//   };

//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="md"
//       PaperProps={{ sx: { borderRadius: 3 } }}
//     >
//       <DialogTitle sx={{ fontWeight: 'bold', pb: 1.5 }}>
//         Массовый подбор оборудования вне плана обхода
//       </DialogTitle>
//       <Divider />

//       <DialogContent
//         sx={{
//           minHeight: 400,
//           pt: 2,
//           display: 'flex',
//           flexDirection: 'column',
//           gap: 2,
//         }}
//       >
//         <TextField
//           fullWidth
//           size="small"
//           label="Поиск прибора в СУБД"
//           placeholder="Введите заводской номер или модель для быстрой фильтрации..."
//           value={searchQuery}
//           onChange={(e) => {
//             setSearchQuery(e.target.value);
//             setPage(0);
//           }}
//           slotProps={{
//             input: {
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon color="action" />
//                 </InputAdornment>
//               ),
//             },
//           }}
//         />

//         <Typography
//           variant="body2"
//           sx={{ fontWeight: 'bold', color: 'primary.main', pl: 0.5 }}
//         >
//           🛒 Набрано оборудования в корзину: {basket.length} ед.
//         </Typography>

//         <TableContainer
//           sx={{
//             border: '1px solid',
//             borderColor: 'divider',
//             borderRadius: 2,
//             flex: 1,
//             maxHeight: 300,
//           }}
//         >
//           {loading ? (
//             <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
//               <CircularProgress />
//             </Box>
//           ) : (
//             <Table stickyHeader size="small">
//               <TableHead>
//                 <TableRow>
//                   <TableCell padding="checkbox">Выбор</TableCell>
//                   <TableCell>Наименование / Тип</TableCell>
//                   <TableCell>Заводской №</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {devices.map((device: any) => {
//                   const isAlreadyOnScreen = alreadyAddedIds.includes(device.id);
//                   const isChecked =
//                     basket.some((d) => d.id === device.id) || isAlreadyOnScreen;

//                   return (
//                     <TableRow key={device.id} hover>
//                       <TableCell padding="checkbox">
//                         <Checkbox
//                           size="small"
//                           checked={isChecked}
//                           disabled={isAlreadyOnScreen}
//                           onChange={() => handleToggleDevice(device)}
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Typography variant="body2" sx={{ fontWeight: 500 }}>
//                           {cleanSpaces(device.name)}
//                         </Typography>
//                         <Typography variant="caption" color="text.secondary">
//                           Модель: {device.model}
//                         </Typography>
//                       </TableCell>
//                       <TableCell
//                         sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
//                       >
//                         {device.serialNumber}
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })}
//               </TableBody>
//             </Table>
//           )}
//         </TableContainer>

//         <TablePagination
//           component="div"
//           count={totalCount}
//           page={page}
//           onPageChange={(_e, p) => setPage(p)}
//           rowsPerPage={rowsPerPage}
//           onRowsPerPageChange={(e) => {
//             setRowsPerPage(parseInt(e.target.value, 10));
//             setPage(0);
//           }}
//           rowsPerPageOptions={[]} // Фиксируем 10 строк ради компактности модалки
//           labelRowsPerPage=""
//         />
//       </DialogContent>

//       <Divider />
//       <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
//         <Button
//           onClick={() => {
//             setBasket([]);
//             onClose();
//           }}
//           color="inherit"
//           sx={{ textTransform: 'none', fontWeight: 'bold' }}
//         >
//           Отмена
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           variant="contained"
//           color="primary"
//           disabled={basket.length === 0}
//           sx={{
//             textTransform: 'none',
//             fontWeight: 'bold',
//             px: 4,
//             borderRadius: 2,
//           }}
//         >
//           Включить в обход ({basket.length} ед.)
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  CircularProgress,
  Typography,
  Box,
  Divider,
  TablePagination,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { useQuery } from '@apollo/client/react';
import { cleanSpaces } from '../utils/capitalize';
import { GetDevicesWithRelationsListDocument } from '../graphql/types/__generated__/graphql';

interface DeviceBulkSelectModalProps {
  open: boolean;
  onClose: () => void;
  onAddDevices: (selectedDevices: any[]) => void;
  alreadyAddedIds: string[];
}

export const DeviceBulkSelectModal: React.FC<DeviceBulkSelectModalProps> = ({
  open,
  onClose,
  onAddDevices,
  alreadyAddedIds,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Находим мобилки на лету

  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [basket, setBasket] = useState<any[]>([]);

  const { data, loading } = useQuery(GetDevicesWithRelationsListDocument, {
    variables: {
      limit: rowsPerPage,
      offset: page * rowsPerPage,
      filter: {
        serialNumber: searchQuery.trim() || undefined,
        includeArchived: false,
      },
    },
    skip: !open,
    fetchPolicy: 'network-only',
  });

  const devices = data?.devicesWithRelations?.items ?? [];
  const totalCount = data?.devicesWithRelations?.totalCount ?? 0;

  const handleToggleDevice = (device: any) => {
    setBasket((prev) =>
      prev.some((d) => d.id === device.id)
        ? prev.filter((d) => d.id !== device.id)
        : [...prev, device]
    );
  };

  const handleSubmit = () => {
    const adaptedDevices = basket.map((found) => ({
      id: found.id,
      name: found.name,
      model: found.model,
      serialNumber: found.serialNumber,
      lastInspectionDate: found.latestInspection?.date ?? null,
      validUntil: new Date().toISOString(),
      isOverdue: false,
      isManualExtra: true,
    }));

    onAddDevices(adaptedDevices);
    setBasket([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      fullScreen={isMobile}
      slotProps={{
        paper: {
          sx: { borderRadius: isMobile ? 0 : 3 },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', pb: 1.5, px: { xs: 2, md: 3 } }}>
        Массовый подбор оборудования вне плана
      </DialogTitle>
      <Divider />

      <DialogContent
        sx={{
          p: { xs: 2, md: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="Поиск прибора в СУБД"
          placeholder="Введите заводской номер или модель..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(0);
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Typography
          variant="body2"
          sx={{ fontWeight: 'bold', color: 'primary.main', pl: 0.5 }}
        >
          🛒 В корзине подбора: {basket.length} ед.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
            }}
          >
            {/* 🖥️ ДЕСКТОПНАЯ ВЕРСИЯ ТАБЛИЦЫ (Скрыта на мобилках) */}
            <TableContainer
              sx={{
                display: { xs: 'none', md: 'block' },
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                maxHeight: 300,
                overflowY: 'auto',
              }}
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">Выбор</TableCell>
                    <TableCell>Наименование / Тип</TableCell>
                    <TableCell>Заводской №</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {devices.map((device: any) => {
                    const isAlreadyOnScreen = alreadyAddedIds.includes(
                      device.id
                    );
                    const isChecked =
                      basket.some((d) => d.id === device.id) ||
                      isAlreadyOnScreen;

                    return (
                      <TableRow
                        key={device.id}
                        hover
                        sx={{
                          cursor: isAlreadyOnScreen ? 'default' : 'pointer',
                        }}
                        onClick={() =>
                          !isAlreadyOnScreen && handleToggleDevice(device)
                        }
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            size="small"
                            checked={isChecked}
                            disabled={isAlreadyOnScreen}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggleDevice(device)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 'bold' }}
                          >
                            {cleanSpaces(device.name)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Модель: {device.model}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                        >
                          {device.serialNumber}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 📱 МОБИЛЬНАЯ ВЕРСИЯ КАРТОЧЕК (Отображается только на телефонах) */}
            <Box
              sx={{
                display: { xs: 'flex', md: 'none' },
                flexDirection: 'column',
                gap: 1.5,
                overflowY: 'auto',
                flex: 1,
                pb: 1,
              }}
            >
              {devices.map((device: any) => {
                const isAlreadyOnScreen = alreadyAddedIds.includes(device.id);
                const isChecked =
                  basket.some((d) => d.id === device.id) || isAlreadyOnScreen;

                return (
                  <Paper
                    key={device.id}
                    variant="outlined"
                    onClick={() =>
                      !isAlreadyOnScreen && handleToggleDevice(device)
                    }
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isAlreadyOnScreen
                        ? 'grey.50'
                        : isChecked
                        ? 'blue.50'
                        : 'background.paper',
                      borderLeft: 4,
                      borderLeftColor: isAlreadyOnScreen
                        ? 'grey.400'
                        : isChecked
                        ? 'primary.main'
                        : 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Checkbox
                      size="medium"
                      checked={isChecked}
                      disabled={isAlreadyOnScreen}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggleDevice(device)}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {cleanSpaces(device.name)}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block' }}
                      >
                        Модель: {device.model}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          color: 'text.secondary',
                        }}
                      >
                        Зав. №: {device.serialNumber}
                      </Typography>
                    </Box>
                    {isAlreadyOnScreen && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.65rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        В списке
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[]}
          labelRowsPerPage=""
          sx={{
            mt: 'auto',
            borderTop: '1px solid',
            borderColor: 'divider',
            '& .MuiTablePagination-toolbar': { minHeight: 48, px: 0 },
            '& .MuiTablePagination-actions': { mr: isMobile ? '56px' : 0 }, // Защита от плавающей кнопки поддержки
          }}
        />
      </DialogContent>

      <Divider />
      <DialogActions
        sx={{
          p: 2,
          px: { xs: 2, md: 3 },
          justifyContent: 'space-between',
          bgcolor: 'grey.50',
        }}
      >
        <Button
          onClick={() => {
            setBasket([]);
            onClose();
          }}
          color="inherit"
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Закрыть
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={basket.length === 0}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            px: { xs: 3, sm: 4 },
            borderRadius: 2,
          }}
        >
          Добавить в обход ({basket.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
};
