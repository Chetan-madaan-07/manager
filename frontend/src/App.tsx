import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import AuthGuard from './components/AuthGuard';
import AuthInit from './components/AuthInit';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AuthInit>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<AuthGuard />}>
              <Route path="/" element={<DashboardPage />} />
            </Route>
          </Routes>
        </AuthInit>
      </BrowserRouter>
    </AppProvider>
  );
}
