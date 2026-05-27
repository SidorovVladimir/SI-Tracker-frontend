import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',

    allVariants: {
      fontVariantNumeric: 'tabular-nums',
    },
  },
});

export default theme;
