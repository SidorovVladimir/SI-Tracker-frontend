// import { AddCircleOutline } from '@mui/icons-material';
// import {
//   Box,
//   Autocomplete,
//   TextField,
//   Tooltip,
//   IconButton,
// } from '@mui/material';
// import { useState } from 'react';
// import PrimaryStandartModal from './modals/PrimaryStandartModal';
// import { cleanSpaces } from '../utils/capitalize';

// export default function PrimaryStandartAutocomplete({
//   value,
//   onChange,
//   primaryStandartsList,
// }: any) {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   return (
//     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//       <Autocomplete
//         sx={{
//           minWidth: 0,
//           '& .MuiInputBase-input, & .MuiChip-label': {
//             textTransform: 'uppercase',
//             fontSize: '0.8rem',
//             letterSpacing: '0.6px',
//             fontWeight: 500,
//           },
//           '& .MuiChip-root': {
//             height: 24,
//           },
//         }}
//         fullWidth // Чтобы поле занимало всё доступное место в Box
//         multiple
//         options={primaryStandartsList}
//         getOptionLabel={(option) => cleanSpaces(option.name)}
//         value={value}
//         onChange={onChange}
//         isOptionEqualToValue={(option, value) => option.id === value.id}
//         slotProps={{
//           paper: {
//             sx: {
//               // 1. Ограничение для внешней обертки окна
//               maxHeight: { xs: 250, md: 500 },

//               // 2. Ограничение для внутреннего списка элементов
//               '& .MuiAutocomplete-listbox': {
//                 maxHeight: { xs: 250, md: 500 }, // 'none' убирает лимиты на ПК, 'auto' вернет дефолт MUI
//               },

//               // Опционально: делаем кастомный тонкий скроллбар на мобилке
//               '& ::-webkit-scrollbar': {
//                 width: '4px',
//               },
//               '& ::-webkit-scrollbar-thumb': {
//                 backgroundColor: 'rgba(0,0,0,0.16)',
//                 borderRadius: '4px',
//               },
//             },
//           },
//         }}
//         renderOption={(props, option) => {
//           const { key, ...optionProps } = props;
//           return (
//             <li
//               key={key}
//               {...optionProps}
//               style={{
//                 textTransform: 'uppercase',
//                 fontSize: '0.8rem',
//                 letterSpacing: '0.6px',
//                 fontWeight: 500,
//               }}
//             >
//               {cleanSpaces(option.name)}
//             </li>
//           );
//         }}
//         renderInput={(params) => (
//           <TextField
//             {...params}
//             label="Первичные эталоны"
//             placeholder="Выберите первичные эталоны"
//             size="small"
//           />
//         )}
//       />

//       <Tooltip title="Добавить первичный эталон">
//         <IconButton
//           color="primary"
//           onClick={() => setIsModalOpen(true)}
//           sx={{ p: '8px' }}
//         >
//           <AddCircleOutline />
//         </IconButton>
//       </Tooltip>

//       <PrimaryStandartModal
//         open={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onCreated={(newPrimaryStandart: string) => {
//           onChange(null, [...value, newPrimaryStandart]);
//         }}
//       />
//     </Box>
//   );
// }
import { AddCircleOutline } from '@mui/icons-material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Box,
  Autocomplete,
  TextField,
  Tooltip,
  IconButton,
} from '@mui/material';
import { useState } from 'react';
import PrimaryStandartModal from './modals/PrimaryStandartModal';
import { cleanSpaces } from '../utils/capitalize';

export default function PrimaryStandartAutocomplete({
  value,
  onChange,
  primaryStandartsList,
}: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Храним состояние открытых описаний: { [id]: true/false }
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Autocomplete
        sx={{
          minWidth: 0,
          '& .MuiInputBase-input, & .MuiChip-label': {
            textTransform: 'uppercase',
            fontSize: '0.8rem',
            letterSpacing: '0.6px',
            fontWeight: 500,
          },
          '& .MuiChip-root': {
            height: 24,
          },
        }}
        fullWidth
        multiple
        options={primaryStandartsList}
        getOptionLabel={(option) => cleanSpaces(option.name)}
        value={value}
        onChange={onChange}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        slotProps={{
          paper: {
            sx: {
              maxHeight: { xs: 300, md: 500 },
              '& .MuiAutocomplete-listbox': {
                maxHeight: { xs: 300, md: 500 },
              },
              '& ::-webkit-scrollbar': {
                width: '4px',
              },
              '& ::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.16)',
                borderRadius: '4px',
              },
            },
          },
        }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props;
          const isExpanded = !!expandedIds[option.id];

          return (
            <li
              key={key}
              {...optionProps}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                padding: '10px 16px',
                borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                backgroundColor: isExpanded
                  ? 'rgba(0, 0, 0, 0.01)'
                  : 'transparent',
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span
                  style={{
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.6px',
                    fontWeight: 600,
                    paddingRight: '8px',
                  }}
                >
                  {cleanSpaces(option.name)}
                </span>

                {option.description && (
                  <IconButton
                    size="small"
                    onClick={(e) => toggleExpand(option.id, e)}
                    sx={{
                      p: '4px',
                      color: 'action.active',

                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                  >
                    {isExpanded ? (
                      <KeyboardArrowUpIcon sx={{ fontSize: '1.2rem' }} />
                    ) : (
                      <KeyboardArrowDownIcon sx={{ fontSize: '1.2rem' }} />
                    )}
                  </IconButton>
                )}
              </Box>

              {option.description && (
                <Box
                  component="span"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    fontWeight: 400,
                    marginTop: '6px',
                    lineHeight: '1.4',
                    textTransform: 'none',
                    transition: 'all 0.2s ease-in-out',

                    // Магия CSS для обрезки длинного текста:
                    display: '-webkit-box',
                    WebkitLineClamp: isExpanded ? 'unset' : 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'normal',
                  }}
                >
                  {option.description}
                </Box>
              )}
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Первичные эталоны"
            placeholder="Выберите первичные эталоны"
            size="small"
          />
        )}
      />

      <Tooltip title="Добавить первичный эталон">
        <IconButton
          color="primary"
          onClick={() => setIsModalOpen(true)}
          sx={{ p: '8px' }}
        >
          <AddCircleOutline />
        </IconButton>
      </Tooltip>

      <PrimaryStandartModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(newPrimaryStandart: string) => {
          onChange(null, [...value, newPrimaryStandart]);
        }}
      />
    </Box>
  );
}
