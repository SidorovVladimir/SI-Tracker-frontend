// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Typography,
//   Card,
//   CardActionArea,
//   Chip,
//   Stack,
//   IconButton,
//   Tooltip,
// } from '@mui/material';
// import { Star, OpenInNew } from '@mui/icons-material';
// import { formatDate } from '../utils/date';

// interface ArshinBufferItem {
//   id: string;
//   vriId: string;
//   orgTitle: string;
//   docNum: string;
//   verificationDate: string;
//   validDate?: string | null;
//   applicability: boolean;
//   isRecommended: boolean;
// }

// interface ArshinSelectDialogProps {
//   open: boolean;
//   onClose: () => void;
//   loading: boolean;
//   records: ArshinBufferItem[];
//   onSelect: (bufferId: string) => void;
// }

// export const ArshinSelectDialog: React.FC<ArshinSelectDialogProps> = ({
//   open,
//   onClose,
//   loading,
//   records,
//   onSelect,
// }) => {
//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="sm"
//       slotProps={{
//         paper: {
//           sx: {
//             borderRadius: 3,
//             boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
//           }
//         }
//       }}
//     >
//       <DialogTitle sx={{ fontWeight: 800, fontSize: '1.25rem', pt: 2.5, pb: 1.5 }}>
//         🔎 Найдено несколько поверок в АРШИН
//       </DialogTitle>

//       <DialogContent dividers sx={{ bgcolor: 'grey.50', p: 1.5 }}>
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{ mb: 2, px: 0.5 }}
//         >
//           По данному серийному номеру найдено несколько совпадений. Выберите
//           запись, принадлежащую вашему прибору:
//         </Typography>

//         <Stack spacing={1.5}>
//           {records.map((record) => (
//             <Card
//               key={record.id}
//               sx={{
//                 border: '2px solid',
//                 borderColor: record.isRecommended ? 'success.light' : 'divider',
//                 boxShadow: record.isRecommended ? 2 : 0,
//                 position: 'relative',
//                 overflow: 'visible',
//               }}
//             >
//               {record.isRecommended && (
//                 <Chip
//                   icon={
//                     <Star
//                       sx={{
//                         fontSize: '0.8rem !important',
//                         color: '#fff !important',
//                       }}
//                     />
//                   }
//                   label="Рекомендуем"
//                   color="success"
//                   size="small"
//                   sx={{
//                     position: 'absolute',
//                     top: -10,
//                     right: 16,
//                     height: 20,
//                     fontSize: '0.7rem',
//                     fontWeight: 'bold',
//                     textTransform: 'uppercase',
//                     zIndex: 2,
//                   }}
//                 />
//               )}

//               {/* 🎯 ОСНОВНАЯ ЗОНА: Клик здесь ТОЛЬКО выбирает запись */}
//               <CardActionArea
//                 disabled={loading}
//                 onClick={() => onSelect(record.id)}
//                 // Оставляем справа отступ под кнопку Аршина, чтобы они визуально не пересекались
//                 sx={{ p: 2, pr: 7 }}
//               >
//                 <Stack
//                   direction="row"
//                   justifyContent="space-between"
//                   alignItems="flex-start"
//                   spacing={1}
//                 >
//                   <Box>
//                     <Typography
//                       variant="subtitle2"
//                       sx={{
//                         committees: 'bold',
//                         color: 'primary.main',
//                         fontWeight: 700,
//                       }}
//                     >
//                       Документ: {record.docNum}
//                     </Typography>

//                     <Typography
//                       variant="body2"
//                       sx={{
//                         mt: 0.5,
//                         fontWeight: 500,
//                         color: 'text.primary',
//                         fontSize: '0.8rem',
//                       }}
//                     >
//                       🏢 {record.orgTitle}
//                     </Typography>

//                     <Stack
//                       direction="row"
//                       spacing={2}
//                       sx={{ mt: 1.5, color: 'text.secondary' }}
//                     >
//                       <Typography variant="caption">
//                         📅 Поверка: {formatDate(record.verificationDate)}
//                       </Typography>
//                       {record.validDate && (
//                         <Typography variant="caption">
//                           ⏳ До: {formatDate(record.validDate)}
//                         </Typography>
//                       )}
//                     </Stack>
//                   </Box>

//                   <Chip
//                     label={record.applicability ? 'Годен' : 'Брак'}
//                     color={record.applicability ? 'success' : 'error'}
//                     size="small"
//                     variant="filled"
//                   />
//                 </Stack>
//               </CardActionArea>

//               {/* 🎯 МОБИЛЬНАЯ ИЗОЛИРОВАННАЯ ЗОНА: Кнопка перехода во ФГИС Аршин */}
//               <Tooltip
//                 title="Открыть карточку во ФГИС Аршин"
//                 arrow
//                 placement="top"
//               >
//                 <IconButton
//                   component="a"
//                   href={`https://fgis.gost.ru/fundmetrology/cm/results/${record.vriId}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   onClick={(e) => {
//                     // Намертво блокируем выбор карточки при нажатии на кнопку ссылки
//                     e.stopPropagation();
//                   }}
//                   size="small"
//                   sx={{
//                     position: 'absolute',
//                     bottom: 8,
//                     right: 8,
//                     color: 'action.active',
//                     bgcolor: 'grey.100',
//                     borderRadius: 1.5,
//                     border: '1px solid',
//                     borderColor: 'divider',
//                     p: 1, // Крупный отступ, чтобы легко попадать пальцем
//                     zIndex: 3,
//                     '&:hover': {
//                       bgcolor: 'primary.light',
//                       color: 'primary.contrastText',
//                       borderColor: 'primary.main',
//                     },
//                   }}
//                 >
//                   <OpenInNew sx={{ fontSize: '1.1rem' }} />
//                 </IconButton>
//               </Tooltip>
//             </Card>
//           ))}
//         </Stack>
//       </DialogContent>

//       <DialogActions>
//         <Button
//           onClick={onClose}
//           size="small"
//           color="inherit"
//           disabled={loading}
//           sx={{ textTransform: 'none' }}
//         >
//           Отмена
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Card,
  CardActionArea,
  Chip,
  Stack,
  IconButton,
  Tooltip,
  Box,
} from '@mui/material';
import { Star, OpenInNew, Troubleshoot } from '@mui/icons-material';
import { cleanSpaces } from '../utils/capitalize';
import { formatDate } from '../utils/date';

interface ArshinBufferItem {
  id: string;
  vriId: string;
  orgTitle: string;
  docNum: string;
  verificationDate: string;
  validDate?: string | null;
  applicability: boolean;
  isRecommended: boolean;
}

interface ArshinSelectDialogProps {
  open: boolean;
  onClose: () => void;
  loading: boolean;
  records: ArshinBufferItem[];
  onSelect: (bufferId: string) => void;
}

export const ArshinSelectDialog: React.FC<ArshinSelectDialogProps> = ({
  open,
  onClose,
  loading,
  records,
  onSelect,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            boxShadow:
              '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
          },
        },
      }}
    >
      {/* 🎯 НОВЫЙ СТИЛЬНЫЙ ЗАГЛОВОК С ДВУХЦВЕТНЫМ АКЦЕНТОМ */}
      <DialogTitle sx={{ pt: 3, pb: 1.5, px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          {/* Иконка в круглом стильном бэкграунде */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.lighter', // Мягкий фоновый цвет вашей темы
              color: 'primary.main',
              width: 38,
              height: 38,
              borderRadius: 2,
              flexShrink: 0,
            }}
          >
            <Troubleshoot sx={{ fontSize: '1.35rem' }} />
          </Box>

          <Stack spacing={0.2}>
            {/* Основной двухцветный текст */}
            <Typography
              component="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.05rem', sm: '1.2rem' },
                color: 'text.primary',
                lineHeight: 1.2,
                letterSpacing: '-0.2px',
              }}
            >
              Выбор поверки из{' '}
              <Box
                component="span"
                sx={{ color: 'primary.main', fontWeight: 900 }}
              >
                ФГИС АРШИН
              </Box>
            </Typography>

            {/* Подзаголовок, сообщающий контекст (опционально, если хотите выводить данные прибора) */}
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.65rem',
              }}
            >
              Метрологический разбор коллизий
            </Typography>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ bgcolor: 'grey.50', p: { xs: 1.25, sm: 2 } }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2.5,
            px: 0.5,
            lineHeight: 1.4,
            fontSize: { xs: '0.8rem', sm: '0.875rem' },
          }}
        >
          По данному серийному номеру обнаружены записи. Пожалуйста, выберите
          нужную для привязки к паспорту оборудования:
        </Typography>

        <Stack spacing={2} sx={{ pt: 1 }}>
          {records.map((record) => (
            <Card
              key={record.id}
              sx={{
                border: '1px solid',
                borderColor: record.isRecommended ? 'success.light' : 'divider',
                borderRadius: 2.5,
                boxShadow: record.isRecommended
                  ? '0 4px 6px -1px rgb(76 175 80 / 0.08), 0 2px 4px -2px rgb(76 175 80 / 0.08)'
                  : '0 1px 3px 0 rgb(0 0 0 / 0.05)',
                position: 'relative',
                overflow: 'visible',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: record.isRecommended
                    ? 'success.main'
                    : 'primary.main',
                  boxShadow:
                    '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  width: '5px',
                  backgroundColor: record.isRecommended
                    ? 'success.main'
                    : 'transparent',
                  borderRadius: '10px 0 0 10px',
                  zIndex: 2,
                },
              }}
            >
              {record.isRecommended && (
                <Chip
                  icon={
                    <Star
                      sx={{
                        fontSize: '0.8rem !important',
                        color: '#fff !important',
                      }}
                    />
                  }
                  label="Рекомендуем"
                  color="success"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: -10,
                    right: 12,
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    zIndex: 2,
                  }}
                />
              )}

              <CardActionArea
                disabled={loading}
                onClick={() => onSelect(record.id)}
                sx={{
                  p: { xs: 1.5, sm: 2.5 },
                  pr: { xs: 6.5, sm: 8 }, // Защитный отступ справа от кнопки-ссылки Аршина
                  pl: { xs: 2, sm: 3 },
                  borderRadius: 2.5,
                }}
              >
                <Stack spacing={1}>
                  {/* ВЕРХНЯЯ СТРОКА: Номер протокола + Статус годности */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                    sx={{ width: '100%', minWidth: 0 }}
                  >
                    {/* АДАПТИВНЫЙ НОМЕР ПРОТОКОЛА: уменьшается на мобилке, не ломает слова */}
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '0.8rem', sm: '0.95rem' }, // Уменьшили на xs до 0.8rem
                        lineHeight: 1.2,
                        minWidth: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis', // Если номер гигантский, он плавно уйдет в три точки
                      }}
                    >
                      {record.docNum}
                    </Typography>

                    {/* КУПИРОВАНИЕ СЖАТИЯ: Жесткий бэйдж, всегда ровный */}
                    <Chip
                      label={record.applicability ? 'Годен' : 'Брак'}
                      color={record.applicability ? 'success' : 'error'}
                      size="small"
                      variant="filled"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        height: { xs: 18, sm: 20 },
                        flexShrink: 0,
                        minWidth: { xs: '50px', sm: '55px' },
                      }}
                    />
                  </Stack>

                  {/* СРЕДНЯЯ СТРОКА: Организация (ЦСМ) */}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      color: 'text.secondary',
                      fontSize: { xs: '0.75rem', sm: '0.8rem' }, // Уменьшили на мобильном для баланса
                      lineHeight: 1.25,
                      display: '-webkit-box',
                      WebkitLineClamp: 2, // Ограничение в 2 строки на любом экране
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    🏢 {cleanSpaces(record.orgTitle)}
                  </Typography>

                  {/* НИЖНЯЯ СТРОКА: Даты поверки */}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ color: 'text.disabled', pt: 0.25 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        fontWeight: 500,
                      }}
                    >
                      📅 От: {formatDate(record.verificationDate)}
                    </Typography>
                    {record.validDate && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: '0.65rem', sm: '0.7rem' },
                          fontWeight: 500,
                        }}
                      >
                        ⏳ До: {formatDate(record.validDate)}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </CardActionArea>

              {/* ЦЕНТРИРОВАННАЯ КНОПКА ФГИС АРШИН */}
              <Tooltip
                title="Открыть запись в системе АРШИН"
                arrow
                placement="top"
              >
                <IconButton
                  component="a"
                  href={`https://fgis.gost.ru/fundmetrology/cm/results/${record.vriId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    right: { xs: 8, sm: 12 }, // Чуть ближе к краю на мобильных, чтобы экономить место
                    transform: 'translateY(-50%)',
                    color: 'action.active',
                    bgcolor: 'grey.100',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    width: { xs: 36, sm: 40 }, // Чуть компактнее кнопка на мобилке
                    height: { xs: 36, sm: 40 },
                    zIndex: 3,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      borderColor: 'primary.main',
                      boxShadow: '0 4px 6px -1px rgb(25 118 210 / 0.2)',
                    },
                  }}
                >
                  <OpenInNew
                    sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' } }}
                  />
                </IconButton>
              </Tooltip>
            </Card>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 2.5, py: 1.5 }}>
        <Button
          onClick={onClose}
          size="small"
          color="inherit"
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          Закрыть окно
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// import React from 'react';
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Typography,
//   Card,
//   CardActionArea,
//   Chip,
//   Stack,
//   IconButton,
//   Tooltip,
// } from '@mui/material';
// import { Star, OpenInNew } from '@mui/icons-material';
// import { cleanSpaces } from '../utils/capitalize';

// interface ArshinBufferItem {
//   id: string;
//   vriId: string;
//   orgTitle: string;
//   docNum: string;
//   verificationDate: string;
//   validDate?: string | null;
//   applicability: boolean;
//   isRecommended: boolean;
// }

// interface ArshinSelectDialogProps {
//   open: boolean;
//   onClose: () => void;
//   loading: boolean;
//   records: ArshinBufferItem[];
//   onSelect: (bufferId: string) => void;
// }

// export const ArshinSelectDialog: React.FC<ArshinSelectDialogProps> = ({
//   open,
//   onClose,
//   loading,
//   records,
//   onSelect,
// }) => {
//   return (
//     <Dialog
//       open={open}
//       onClose={onClose}
//       fullWidth
//       maxWidth="sm"
//       slotProps={{
//         paper: {
//           sx: {
//             borderRadius: 3,
//             boxShadow:
//               '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
//           },
//         },
//       }}
//     >
//       <DialogTitle
//         sx={{ fontWeight: 800, fontSize: '1.25rem', pt: 2.5, pb: 1.5 }}
//       >
//         🔎 Выбор поверки из ФГИС АРШИН
//       </DialogTitle>

//       <DialogContent
//         dividers
//         sx={{ bgcolor: 'grey.50', p: { xs: 1.5, sm: 2 } }}
//       >
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{ mb: 2.5, px: 0.5, lineHeight: 1.4 }}
//         >
//           По данному серийному номеру обнаружено несколько записей. Пожалуйста,
//           выберите нужную для привязки к паспорту оборудования:
//         </Typography>

//         {/* Контейнер карточек с отступом сверху под чипсы рекомендации */}
//         <Stack spacing={2} sx={{ pt: 1 }}>
//           {records.map((record) => (
//             <Card
//               key={record.id}
//               sx={{
//                 border: '1px solid',
//                 borderColor: record.isRecommended ? 'success.light' : 'divider',
//                 borderRadius: 2.5,
//                 boxShadow: record.isRecommended
//                   ? '0 4px 6px -1px rgb(76 175 80 / 0.08), 0 2px 4px -2px rgb(76 175 80 / 0.08)'
//                   : '0 1px 3px 0 rgb(0 0 0 / 0.05)',
//                 position: 'relative',
//                 overflow: 'visible', // Меняем на visible, чтобы чипс сверху не обрезался края карточки
//                 transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
//                 '&:hover': {
//                   borderColor: record.isRecommended
//                     ? 'success.main'
//                     : 'primary.main',
//                   boxShadow:
//                     '0 10px 15px -3px rgb(0 0 0 / 0.05), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
//                 },
//                 // Изящный маркер слева
//                 '&::before': {
//                   content: '""',
//                   position: 'absolute',
//                   top: 0,
//                   left: 0,
//                   bottom: 0,
//                   width: '5px',
//                   backgroundColor: record.isRecommended
//                     ? 'success.main'
//                     : 'transparent',
//                   borderRadius: '10px 0 0 10px',
//                   zIndex: 2,
//                 },
//               }}
//             >
//               {/* ВЕРНУЛИ КАК БЫЛО: Яркий верхний чипс рекомендации */}
//               {record.isRecommended && (
//                 <Chip
//                   icon={
//                     <Star
//                       sx={{
//                         fontSize: '0.8rem !important',
//                         color: '#fff !important',
//                       }}
//                     />
//                   }
//                   label="Рекомендуем"
//                   color="success"
//                   size="small"
//                   sx={{
//                     position: 'absolute',
//                     top: -10,
//                     right: 16,
//                     height: 20,
//                     fontSize: '0.7rem',
//                     fontWeight: 'bold',
//                     textTransform: 'uppercase',
//                     zIndex: 2,
//                   }}
//                 />
//               )}

//               {/* ЗОНА КЛИКА ВЫБОРА КАРТОЧКИ */}
//               <CardActionArea
//                 disabled={loading}
//                 onClick={() => onSelect(record.id)}
//                 sx={{
//                   p: { xs: 2, sm: 2.5 },
//                   pr: { xs: 7, sm: 8 }, // Буферная зона справа от наездов на иконку ссылки
//                   pl: { xs: 2.5, sm: 3 },
//                   borderRadius: 2.5,
//                 }}
//               >
//                 <Stack spacing={1.2}>
//                   {/* ИСПРАВЛЕНО: Безопасная верхняя строка, где Годен больше не вылазит */}
//                   <Stack
//                     direction="row"
//                     justifyContent="space-between"
//                     alignItems="flex-start"
//                     spacing={1.5}
//                     sx={{ width: '100%', minWidth: 0 }}
//                   >
//                     {/* Номер документа автоматически сжимается или переносится при нехватке места */}
//                     <Typography
//                       variant="subtitle2"
//                       sx={{
//                         fontWeight: 700,
//                         color: 'text.primary',
//                         fontSize: { xs: '0.875rem', sm: '0.95rem' },
//                         lineHeight: 1.3,
//                         minWidth: 0,
//                         wordBreak: 'break-word', // Мягкий перенос длинных кодов документов
//                       }}
//                     >
//                       {record.docNum}
//                     </Typography>

//                     {/* Жестко фиксируем бэйдж годности, чтобы он никогда не деформировался */}
//                     <Chip
//                       label={record.applicability ? 'Годен' : 'Брак'}
//                       color={record.applicability ? 'success' : 'error'}
//                       size="small"
//                       variant="filled"
//                       sx={{
//                         fontWeight: 'bold',
//                         fontSize: '0.7rem',
//                         height: 20,
//                         flexShrink: 0, // Запрещаем MUI сжимать этот чипс
//                         minWidth: '55px',
//                       }}
//                     />
//                   </Stack>

//                   {/* СРЕДНЯЯ СТРОКА: Организация (ЦСМ) */}
//                   <Typography
//                     variant="body2"
//                     sx={{
//                       fontWeight: 500,
//                       color: 'text.secondary',
//                       fontSize: '0.8rem',
//                       lineHeight: 1.3,
//                       display: '-webkit-box',
//                       WebkitLineClamp: 2,
//                       WebkitBoxOrient: 'vertical',
//                       overflow: 'hidden',
//                     }}
//                   >
//                     🏢 {cleanSpaces(record.orgTitle)}
//                   </Typography>

//                   {/* НИЖНЯЯ СТРОКА: Даты поверки */}
//                   <Stack
//                     direction="row"
//                     spacing={2}
//                     sx={{ color: 'text.disabled', pt: 0.5 }}
//                   >
//                     <Typography
//                       variant="caption"
//                       sx={{ fontSize: '0.7rem', fontWeight: 500 }}
//                     >
//                       📅 От:{' '}
//                       {new Date(record.verificationDate).toLocaleDateString(
//                         'ru-RU'
//                       )}
//                     </Typography>
//                     {record.validDate && (
//                       <Typography
//                         variant="caption"
//                         sx={{ fontSize: '0.7rem', fontWeight: 500 }}
//                       >
//                         ⏳ До:{' '}
//                         {new Date(record.validDate).toLocaleDateString('ru-RU')}
//                       </Typography>
//                     )}
//                   </Stack>
//                 </Stack>
//               </CardActionArea>

//               {/* ИЗОЛИРОВАННАЯ КНОПКА ПЕРЕХОДА НА САЙТ АРШИНА */}
//               <Tooltip
//                 title="Открыть запись в системе АРШИН"
//                 arrow
//                 placement="top"
//               >
//                 <IconButton
//                   component="a"
//                   href={`https://gost.ru{record.vriId}`}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   onClick={(e) => {
//                     e.stopPropagation(); // Блокируем триггер выбора всей карточки
//                   }}
//                   size="small"
//                   sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     right: 12,
//                     transform: 'translateY(-50%)', // Центрирование
//                     color: 'action.active',
//                     bgcolor: 'grey.100',
//                     borderRadius: 2,
//                     border: '1px solid',
//                     borderColor: 'divider',
//                     width: 40,
//                     height: 40,
//                     zIndex: 3,
//                     transition: 'all 0.2s ease',
//                     '&:hover': {
//                       bgcolor: 'primary.main',
//                       color: 'primary.contrastText',
//                       borderColor: 'primary.main',
//                       boxShadow: '0 4px 6px -1px rgb(25 118 210 / 0.2)',
//                     },
//                   }}
//                 >
//                   <OpenInNew sx={{ fontSize: '1.1rem' }} />
//                 </IconButton>
//               </Tooltip>
//             </Card>
//           ))}
//         </Stack>
//       </DialogContent>

//       <DialogActions sx={{ px: 2.5, py: 1.5 }}>
//         <Button
//           onClick={onClose}
//           size="small"
//           color="inherit"
//           disabled={loading}
//           sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5 }}
//         >
//           Закрыть окно
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// };
