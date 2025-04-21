import { Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Registration from './pages/login_register/register';
import Login from './pages/login_register/login';
import UserDashboard from './pages/UserDashboard/userDahboard';
import AdminRoute from './ProtectedRoute';
import AdminPanel from './pages/Admin/AddGrill';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setIsAdmin(decoded.admin === true);
        } catch (error) {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    
    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate('/login');
  };

  return (
    <>
      <nav className="main-nav">
        <div className="nav-content">
          <Link to="/" className="logo">
            GrillMaster 🔥
          </Link>
          <div className="nav-links">
            {!isLoggedIn ? (
              <>
                <NavLink 
                  to="/login" 
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  Bejelentkezés
                </NavLink>
                <NavLink 
                  to="/register" 
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  Regisztráció
                </NavLink>
              </>
            ) : (
              <>
                <NavLink 
                  to="/user-dashboard" 
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                >
                  Dashboard
                </NavLink>
                {isAdmin && (
                  <NavLink 
                    to="/admin" 
                    className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                  >
                    Admin
                  </NavLink>
                )}
                <button 
                  onClick={handleLogout}
                  className="nav-link logout-btn"
                >
                  Kijelentkezés
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <div className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/user-dashboard" element={<UserDashboard />} />
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }/>
        </Routes>
      </div>
    </>
  );
}

export default App;