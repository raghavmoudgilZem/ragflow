import { AppProviders } from './app/providers';
import { AppRouter } from './app/routes';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './shared/theme/theme'
import { NotificationToast } from '@shared/components/common/NotificationToast';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppProviders>
        <AppRouter />
      </AppProviders>
      <NotificationToast />
    </ThemeProvider>
  );
}

export default App;