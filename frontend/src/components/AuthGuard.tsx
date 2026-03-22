import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../store/AppContext';

export default function AuthGuard() {
  const { state } = useAppContext();

  if (!state.auth.accessToken) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
}
