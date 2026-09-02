// import React, { useState, useEffect } from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   List,
//   ListItem,
//   ListItemText,
//   Switch,
//   TextField,
//   MenuItem,
//   Box,
//   Typography,
// } from '@mui/material';

// interface InspectionSaveModalProps {
//   open: boolean;
//   onClose: () => void;
//   selectedDevices: any[];
//   onSave: (
//     items: { deviceId: string; isSuccess: boolean }[],
//     interval: number
//   ) => void;
//   loading: boolean;
// }

// export const InspectionSaveModal: React.FC<InspectionSaveModalProps> = ({
//   open,
//   onClose,
//   selectedDevices,
//   onSave,
//   loading,
// }) => {
//   const [interval, setInterval] = useState<number>(12);
//   const [results, setResults] = useState<Record<string, boolean>>({});

//   useEffect(() => {
//     if (open) {
//       const initialResults: Record<string, boolean> = {};
//       selectedDevices.forEach((d) => {
//         initialResults[d.id] = true;
//       });
//       setResults(initialResults);
//     }
//   }, [open, selectedDevices]);

//   const handleSubmit = () => {
//     const items = selectedDevices.map((d) => ({
//       deviceId: d.id,
//       isSuccess: results[d.id] ?? true,
//     }));
//     onSave(items, interval);
//   };

//   return (
//     <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
//       <DialogTitle sx={{ fontWeight: 'bold' }}>
//         Фиксация результатов осмотра
//       </DialogTitle>
//       <DialogContent dividers>
//         <Box sx={{ mb: 3 }}>
//           <TextField
//             select
//             fullWidth
//             size="small"
//             label="Периодичность повторного осмотра"
//             value={interval}
//             onChange={(e) => setInterval(parseInt(e.target.value, 10))}
//           >
//             <MenuItem value={1}>1 месяц</MenuItem>
//             <MenuItem value={3}>3 месяца</MenuItem>
//             <MenuItem value={6}>6 месяцев</MenuItem>
//             <MenuItem value={12}>1 год (12 мес.)</MenuItem>
//           </TextField>
//         </Box>
//         <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
//           Список оборудования:
//         </Typography>
//         <List disablePadding>
//           {selectedDevices.map((device) => (
//             <ListItem
//               key={device.id}
//               secondaryAction={
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                   <Typography
//                     variant="caption"
//                     color={results[device.id] ? 'success.main' : 'error.main'}
//                     sx={{ fontWeight: 'bold' }}
//                   >
//                     {results[device.id] ? 'ГОДЕН' : 'БРАК'}
//                   </Typography>
//                   <Switch
//                     size="small"
//                     color="success"
//                     checked={results[device.id] ?? true}
//                     onChange={(e) =>
//                       setResults((prev) => ({
//                         ...prev,
//                         [device.id]: e.target.checked,
//                       }))
//                     }
//                   />
//                 </Box>
//               }
//               sx={{ px: 0, borderBottom: '1px solid #eee' }}
//             >
//               <ListItemText
//                 primary={device.name}
//                 secondary={`Зав. № ${device.serialNumber}`}
//                 slotProps={{ primary: { variant: 'body2', fontWeight: 500 } }}
//               />
//             </ListItem>
//           ))}
//         </List>
//       </DialogContent>
//       <DialogActions sx={{ p: 2 }}>
//         <Button
//           onClick={onClose}
//           color="inherit"
//           size="small"
//           sx={{ textTransform: 'none' }}
//         >
//           Отмена
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           variant="contained"
//           color="success"
//           size="small"
//           disabled={loading}
//           sx={{ textTransform: 'none', fontWeight: 'bold' }}
//         >
//           Сохранить акт осмотра
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  Box,
  Typography,
  TextField,
  MenuItem,
  Switch,
  Divider,
} from '@mui/material';
import { cleanSpaces } from '../../utils/capitalize';

interface InspectionSaveModalProps {
  open: boolean;
  onClose: () => void;
  selectedDevices: any[];
  onSave: (
    items: { deviceId: string; isSuccess: boolean; intervalMonths: number }[]
  ) => void;
  loading: boolean;
}

export const InspectionSaveModal: React.FC<InspectionSaveModalProps> = ({
  open,
  onClose,
  selectedDevices,
  onSave,
  loading,
}) => {
  // Локальные карты состояний поштучно для каждого deviceId
  const [intervals, setIntervals] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, boolean>>({});

  // Инициализация при открытии окон
  useEffect(() => {
    if (open) {
      const initialResults: Record<string, boolean> = {};
      const initialIntervals: Record<string, number> = {};

      selectedDevices.forEach((d) => {
        initialResults[d.id] = true; // Все по дефолту годны
        initialIntervals[d.id] = 12; // Дефолтный интервал повтора — 12 мес.
      });

      setResults(initialResults);
      setIntervals(initialIntervals);
    }
  }, [open, selectedDevices]);

  const handleSubmit = () => {
    // Собираем элементы в строгом соответствии с новым InspectionItemInput
    const items = selectedDevices.map((d) => ({
      deviceId: d.id,
      isSuccess: results[d.id] ?? true,
      intervalMonths: intervals[d.id] ?? 12,
    }));

    onSave(items);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 'bold', pb: 1.5 }}>
        Фиксация технического обслуживания и осмотров
      </DialogTitle>
      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, fontWeight: 500 }}
        >
          Задайте статус исправности и плановую периодичность для каждого
          прибора. Вариант «Разовый» зафиксирует акт в архиве, но снимет прибор
          с регулярного планового учета.
        </Typography>

        <List disablePadding>
          {selectedDevices.map((device) => {
            const isSuccess = results[device.id] ?? true;
            const currentInterval = intervals[device.id] ?? 12;

            return (
              <ListItem
                key={device.id}
                sx={{
                  px: 0,
                  borderBottom: '1px solid',
                  borderColor: 'grey.100',
                  py: 1.5,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                {/* Левая сторона: Сведения об оборудовании */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {cleanSpaces(device.name)}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    Модель: {device.model} | Зав. №:{' '}
                    <Box
                      component="span"
                      sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                    >
                      {device.serialNumber}
                    </Box>
                  </Typography>
                </Box>

                {/* Правая сторона: Органы поштучного управления */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                  }}
                >
                  {/* Выпадающий список выбора индивидуального интервала */}
                  <TextField
                    select
                    size="small"
                    label="Периодичность"
                    value={currentInterval}
                    onChange={(e) =>
                      setIntervals((prev) => ({
                        ...prev,
                        [device.id]: parseInt(e.target.value, 10),
                      }))
                    }
                    slotProps={{
                      select: {
                        MenuProps: {
                          PaperProps: {
                            sx: {
                              maxHeight: 300,
                              '&::-webkit-scrollbar': { width: '4px' },
                              '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.16)',
                                borderRadius: '4px',
                              },
                            },
                          },
                        },
                      },
                    }}
                    sx={{
                      width: { xs: '100%', sm: 190 },
                      '& .MuiInputBase-input': {
                        fontSize: '0.78rem',
                        py: '7px',
                        fontWeight: 500,
                      },
                    }}
                  >
                    <MenuItem
                      value={0}
                      sx={{
                        fontWeight: 'bold',
                        color: 'warning.main',
                        fontSize: '0.8rem',
                      }}
                    >
                      ⏱️ Разовый (без повтора)
                    </MenuItem>
                    <MenuItem value={1} sx={{ fontSize: '0.8rem' }}>
                      1 месяц
                    </MenuItem>
                    <MenuItem value={3} sx={{ fontSize: '0.8rem' }}>
                      3 месяца
                    </MenuItem>
                    <MenuItem value={6} sx={{ fontSize: '0.8rem' }}>
                      6 месяцев
                    </MenuItem>
                    <MenuItem value={12} sx={{ fontSize: '0.8rem' }}>
                      12 месяцев (1 год)
                    </MenuItem>
                  </TextField>

                  {/* Тумблер Годен / Брак */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: 90,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Typography
                      variant="caption"
                      color={isSuccess ? 'success.main' : 'error.main'}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {isSuccess ? 'ГОДЕН' : 'БРАК'}
                    </Typography>
                    <Switch
                      size="small"
                      color="success"
                      checked={isSuccess}
                      onChange={(e) =>
                        setResults((prev) => ({
                          ...prev,
                          [device.id]: e.target.checked,
                        }))
                      }
                    />
                  </Box>
                </Box>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          color="inherit"
          size="small"
          sx={{ textTransform: 'none', fontWeight: 'bold' }}
        >
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="success"
          size="small"
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 'bold',
            px: 3,
            borderRadius: 2,
          }}
        >
          Сохранить акт ТО
        </Button>
      </DialogActions>
    </Dialog>
  );
};
