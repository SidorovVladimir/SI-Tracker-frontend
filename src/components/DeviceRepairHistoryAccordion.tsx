// import React, { useState } from 'react';
// import {
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Typography,
//   Box,
//   Stack,
//   Chip,
// } from '@mui/material';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import BuildIcon from '@mui/icons-material/Build';
// import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import PersonIcon from '@mui/icons-material/Person';
// import CommentIcon from '@mui/icons-material/Comment';

// interface RepairHistoryRow {
//   batchId: string;
//   batchNumber: string;
//   dateIn: string;
//   dateOut: string;
//   master: string;
//   result: string;
//   closingDocType: string;
//   comment: string;
// }

// interface DeviceRepairHistoryAccordionProps {
//   history: RepairHistoryRow[];
// }

// export const DeviceRepairHistoryAccordion: React.FC<
//   DeviceRepairHistoryAccordionProps
// > = ({ history }) => {
//   const [mainExpanded, setExpanded] = useState<boolean>(false);
//   // Стейт для отслеживания развернутых внутренних ведомостей
//   const [subExpanded, setSubExpanded] = useState<string | false>(false);

//   if (!history || history.length === 0) {
//     return (
//       <Box
//         sx={{
//           p: 2,
//           bgcolor: '#f9f9f9',
//           borderRadius: '8px',
//           border: '1px dashed #e0e0e0',
//           textAlign: 'center',
//         }}
//       >
//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{ fontStyle: 'italic' }}
//         >
//           Записи о ремонтах отсутствуют
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Accordion
//       expanded={mainExpanded}
//       onChange={(_e, isExpanded) => setExpanded(isExpanded)}
//       variant="outlined"
//       sx={{
//         borderRadius: '8px !important',
//         borderColor: '#e0e0e0',
//         bgcolor: '#fbfbfb',
//         boxShadow: 'none',
//         '&:before': { display: 'none' },
//       }}
//     >
//       <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <BuildIcon fontSize="small" color="warning" />
//           {/* <Typography
//             variant="body2"
//             sx={{
//               fontWeight: 600,
//               letterSpacing: '0.3px',
//               color: 'text.primary',
//               textTransform: 'uppercase',
//             }}

//           > */}
//           <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
//             Журнал ремонтов ({history.length})
//           </Typography>
//         </Box>
//       </AccordionSummary>

//       <AccordionDetails
//         sx={{ p: 1.5, bgcolor: '#fff', borderTop: '1px solid #e0e0e0' }}
//       >
//         <Stack spacing={1}>
//           {history.map((row) => {
//             const isSuccess =
//               row.result.includes('🟢') ||
//               row.result.toLowerCase().includes('исправен');
//             const isFailed =
//               row.result.includes('🔴') ||
//               row.result.toLowerCase().includes('брак');

//             const isScrapped =
//               row.result.includes('❌') ||
//               row.result.toLowerCase().includes('списан');

//             const statusColor = isSuccess
//               ? 'success'
//               : isFailed || isScrapped
//               ? 'error'
//               : 'warning';
//             const leftIndicatorColor = isSuccess
//               ? '#2e7d32'
//               : isFailed || isScrapped
//               ? '#d32f2f'
//               : '#ed6c02';

//             return (
//               <Accordion
//                 key={row.batchId}
//                 expanded={subExpanded === row.batchId}
//                 onChange={(_e, isExp) =>
//                   setSubExpanded(isExp ? row.batchId : false)
//                 }
//                 variant="outlined"
//                 sx={{
//                   borderRadius: '6px !important',
//                   borderColor: '#e2e8f0',
//                   boxShadow: 'none',
//                   bgcolor: subExpanded === row.batchId ? '#fdfdfd' : '#fafafa',
//                   borderLeft: `4px solid ${leftIndicatorColor}`, // Индикатор статуса прямо на рамке ведомости!
//                   '&:before': { display: 'none' },
//                 }}
//               >
//                 {/* 🌟 ПОНЯТНЫЙ ЗАГОЛОВОК: Номер ведомости, дата дефекта и бейдж статуса */}
//                 <AccordionSummary
//                   expandIcon={<ExpandMoreIcon sx={{ fontSize: '1.1rem' }} />}
//                 >
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       alignItems: { xs: 'flex-start', sm: 'center' },
//                       justifyContent: 'space-between',
//                       width: '100%',
//                       gap: 1.5,
//                       flexDirection: { xs: 'column', sm: 'row' },
//                     }}
//                   >
//                     <Stack direction="row" alignItems="center" spacing={1.5}>
//                       <Typography
//                         variant="body2"
//                         sx={{ fontWeight: 'bold', color: 'text.primary' }}
//                       >
//                         🛠️ {row.batchNumber}
//                       </Typography>
//                       <Typography variant="caption" color="text.secondary">
//                         Сломан: <strong>{row.dateIn}</strong>
//                       </Typography>
//                     </Stack>

//                     <Chip
//                       label={row.result}
//                       size="small"
//                       variant="outlined"
//                       color={statusColor}
//                       sx={{
//                         height: 20,
//                         fontSize: '0.68rem',
//                         fontWeight: 'bold',
//                         borderRadius: '4px',
//                         px: 0.5,
//                       }}
//                     />
//                   </Box>
//                 </AccordionSummary>

//                 {/* 🌟 ПОДРОБНОСТИ ДЕТАЛИЗАЦИИ РЕМОНТА (Скрыты по умолчанию) */}
//                 <AccordionDetails
//                   sx={{
//                     borderTop: '1px dashed #e2e8f0',
//                     pt: 1.5,
//                     pb: 1.5,
//                     px: 2,
//                     bgcolor: '#ffffff',
//                   }}
//                 >
//                   <Stack
//                     direction={{ xs: 'column', sm: 'row' }}
//                     spacing={{ xs: 0.5, sm: 2 }}
//                     divider={
//                       <Box
//                         sx={{
//                           display: { xs: 'none', sm: 'block' },
//                           color: 'grey.300',
//                         }}
//                       >
//                         •
//                       </Box>
//                     }
//                     sx={{ mb: 1.5, color: 'text.secondary' }}
//                   >
//                     <Stack direction="row" alignItems="center" spacing={0.5}>
//                       <CalendarMonthIcon sx={{ fontSize: 13 }} />
//                       <Typography variant="caption">
//                         Период в КИПиА: {row.dateIn} — {row.dateOut}
//                       </Typography>
//                     </Stack>
//                     <Stack direction="row" alignItems="center" spacing={0.5}>
//                       <PersonIcon sx={{ fontSize: 13 }} />
//                       <Typography variant="caption">
//                         Исполнитель: {row.master}
//                       </Typography>
//                     </Stack>
//                     {row.closingDocType !== '—' && (
//                       <Typography
//                         variant="caption"
//                         sx={{ textTransform: 'capitalize' }}
//                       >
//                         Тип контроля: {row.closingDocType}
//                       </Typography>
//                     )}
//                   </Stack>

//                   {/* Текстовый комментарий мастера о проделанной работе */}
//                   <Box
//                     sx={{
//                       display: 'flex',
//                       gap: 0.5,
//                       alignItems: 'flex-start',
//                       bgcolor: '#f8fafc',
//                       p: 1,
//                       borderRadius: '4px',
//                       border: '1px solid #e2e8f0',
//                     }}
//                   >
//                     <CommentIcon
//                       sx={{
//                         fontSize: 13,
//                         color: 'grey.400',
//                         mt: 0.3,
//                         flexShrink: 0,
//                       }}
//                     />
//                     <Typography
//                       variant="caption"
//                       color="text.primary"
//                       sx={{
//                         fontStyle: 'italic',
//                         wordBreak: 'break-word',
//                         lineHeight: 1.4,
//                       }}
//                     >
//                       {row.comment}
//                     </Typography>
//                   </Box>
//                 </AccordionDetails>
//               </Accordion>
//             );
//           })}
//         </Stack>
//       </AccordionDetails>
//     </Accordion>
//   );
// };
import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Stack,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BuildIcon from '@mui/icons-material/Build';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import CommentIcon from '@mui/icons-material/Comment';

interface RepairHistoryRow {
  batchId: string;
  batchNumber: string;
  dateIn: string; // Дата дефекта (проведения "плохого" контроля)
  dateOut: string; // Дата выполнения ремонта (или дата списания)
  master: string;
  result: string;
  closingDocType: string;
  comment: string;
}

interface DeviceRepairHistoryAccordionProps {
  history: RepairHistoryRow[];
}

export const DeviceRepairHistoryAccordion: React.FC<
  DeviceRepairHistoryAccordionProps
> = ({ history }) => {
  const [mainExpanded, setExpanded] = useState<boolean>(false);
  const [subExpanded, setSubExpanded] = useState<string | false>(false);

  if (!history || history.length === 0) {
    return (
      <Box
        sx={{
          p: 2,
          bgcolor: '#f9f9f9',
          borderRadius: '8px',
          border: '1px dashed #e0e0e0',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}
        >
          Записи о ремонтах отсутствуют
        </Typography>
      </Box>
    );
  }

  return (
    <Accordion
      expanded={mainExpanded}
      onChange={(_e, isExpanded) => setExpanded(isExpanded)}
      variant="outlined"
      sx={{
        borderRadius: '8px !important',
        borderColor: '#e2e8f0',
        bgcolor: '#f8fafc',
        boxShadow: 'none',
        '&:before': { display: 'none' },
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon fontSize="small" />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BuildIcon fontSize="small" color="warning" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Журнал ремонтов ({history.length})
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails
        sx={{ p: 1, bgcolor: '#fff', borderTop: '1px solid #e2e8f0' }}
      >
        <Stack spacing={0.8}>
          {history.map((row) => {
            const isSuccess =
              row.result.includes('🟢') ||
              row.result.toLowerCase().includes('исправен');
            const isFailed =
              row.result.includes('🔴') ||
              row.result.toLowerCase().includes('брак');
            const isScrapped =
              row.result.includes('❌') ||
              row.result.toLowerCase().includes('списан');

            const statusColor = isSuccess
              ? 'success'
              : isFailed || isScrapped
              ? 'error'
              : 'warning';
            const leftIndicatorColor = isSuccess
              ? '#2e7d32'
              : isFailed || isScrapped
              ? '#d32f2f'
              : '#ed6c02';

            return (
              <Accordion
                key={row.batchId}
                expanded={subExpanded === row.batchId}
                onChange={(_e, isExp) =>
                  setSubExpanded(isExp ? row.batchId : false)
                }
                variant="outlined"
                sx={{
                  borderRadius: '6px !important',
                  borderColor: '#e2e8f0',
                  boxShadow: 'none',
                  bgcolor: subExpanded === row.batchId ? '#fff' : '#fafafa',
                  borderLeft: `4px solid ${leftIndicatorColor}`,
                  '&:before': { display: 'none' },
                }}
              >
                {/* 🌟 ЗАГОЛОВОК: Компактный и понятный (Ведомость, Дата дефекта, Итог) */}
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
                  sx={{
                    minHeight: 40,
                    '& .MuiAccordionSummary-content': { my: '6px !important' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      gap: 1,
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', fontSize: '0.85rem' }}
                      >
                        🛠️ {row.batchNumber}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: '0.75rem' }}
                      >
                        Дата дефекта: <strong>{row.dateIn}</strong>
                      </Typography>
                    </Stack>

                    <Chip
                      label={row.result}
                      size="small"
                      variant="outlined"
                      color={statusColor}
                      sx={{
                        height: 18,
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        px: 0.5,
                      }}
                    />
                  </Box>
                </AccordionSummary>

                {/* 🌟 ПОДРОБНОСТИ: Только дата ремонта, исполнитель и комментарий */}
                <AccordionDetails
                  sx={{
                    borderTop: '1px dashed #e2e8f0',
                    pt: 1.2,
                    pb: 1.2,
                    px: 2,
                    bgcolor: '#ffffff',
                  }}
                >
                  <Stack spacing={1}>
                    {/* Верхняя строка спецификации */}
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={{ xs: 0.5, sm: 2 }}
                      divider={
                        <Box
                          sx={{
                            display: { xs: 'none', sm: 'block' },
                            color: 'grey.300',
                            fontSize: '0.8rem',
                          }}
                        >
                          •
                        </Box>
                      }
                      sx={{ color: 'text.secondary' }}
                    >
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarMonthIcon
                          sx={{ fontSize: 13, color: 'action.active' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Дата ремонта: <strong>{row.dateOut}</strong>
                        </Typography>
                      </Stack>

                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <PersonIcon
                          sx={{ fontSize: 13, color: 'action.active' }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '0.75rem' }}
                        >
                          Исполнитель: <strong>{row.master}</strong>
                        </Typography>
                      </Stack>
                    </Stack>

                    {/* Поле комментария мастера */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        alignItems: 'flex-start',
                        bgcolor: '#f8fafc',
                        p: 1,
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        mt: 0.5,
                      }}
                    >
                      <CommentIcon
                        sx={{
                          fontSize: 13,
                          color: 'grey.400',
                          mt: 0.2,
                          flexShrink: 0,
                        }}
                      />
                      <Typography
                        variant="caption"
                        color="text.primary"
                        sx={{
                          fontStyle: 'italic',
                          wordBreak: 'break-word',
                          lineHeight: 1.4,
                          fontSize: '0.75rem',
                        }}
                      >
                        {row.comment}
                      </Typography>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
