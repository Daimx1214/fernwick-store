import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

// Route guard — Spec Sec. 10: protected pages redirect to
// /login?next=<path> so login can send the shopper back.
export default function RequireAuth({ children }) {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  if (!isLoggedIn) {
    return (
      <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
    );
  }
  return children;
}
