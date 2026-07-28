import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { ChatProvider } from './hooks/useChat';
import { ToastProvider } from './components/Toast';
import { HomePage } from './pages/Home';
import { ViewerPage } from './pages/Viewer';
import { StatisticsPage } from './pages/Statistics';

export default function App() {
  return (
    <ThemeProvider>
      <ChatProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/viewer" element={<ViewerPage />} />
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </ChatProvider>
    </ThemeProvider>
  );
}
