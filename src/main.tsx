import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';

/**
 * 앱 전역 테마
 * - 시스템 다크모드를 따라가도록 colorSchemes 를 모두 정의
 * - 모바일에서 누르기 쉽도록 버튼/입력 모서리를 둥글게
 */
const theme = createTheme({
  colorSchemes: {
    light: { palette: { primary: { main: '#3D5AFE' }, background: { default: '#F3F5FA' } } },
    dark: { palette: { primary: { main: '#8C9EFF' }, background: { default: '#0F1115', paper: '#181B22' } } },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "'Pretendard Variable', 'Pretendard', -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif",
    button: { fontWeight: 700, textTransform: 'none' },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme} defaultMode="system">
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
);
