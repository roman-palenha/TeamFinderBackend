import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import NavBar from './components/NavBar';
import DebugInfo from './components/DebugInfo';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TeamsPage from './pages/TeamsPage';
import TeamDetailPage from './pages/TeamDetailPage';
import CreateTeamPage from './pages/CreateTeamPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="App">
          <NavBar />
          <ToastContainer position="top-right" autoClose={5000} />
          <main className="container mt-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
              <Route path="/teams" element={<PrivateRoute><TeamsPage /></PrivateRoute>} />
              <Route path="/teams/:id" element={<PrivateRoute><TeamDetailPage /></PrivateRoute>} />
              <Route path="/teams/create" element={<PrivateRoute><CreateTeamPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <DebugInfo /> {/* Add this debug component */}
        </div>
      </NotificationProvider>
    </AuthProvider>
  );
}

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
}

export default App;