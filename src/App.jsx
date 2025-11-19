import { Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import ClientPayment from './pages/ClientPayment';
import DeveloperPayment from './pages/DeveloperPayment';
import MessagingPage from './pages/MessagingPage';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import LoginModal from './components/Login';
import SignupModal from './components/Signup';
import ForgotPasswordModal from './components/ForgotPassword';
import ResetPasswordModal from './components/ResetPassword';
import MyProjects from './pages/MyProjectClient';
import MyProjectsDeveloper from './pages/MyProjectsDeveloper';
import FindDevelopers from './pages/FindDevelopers';
import RoleSelectionPage from './pages/RoleSelectionPage';
import FindClients from './pages/FindClients';
import DashboardClient from './pages/DashboardClient';
import DashboardDeveloper from './pages/DashboardDeveloper';
import Marketplace from './pages/Marketplace';
import ProjectDetails from './pages/ProjectDetails';
import Analytics from './pages/Analytics';
import ClientReports from './pages/ClientReports';
import WebSocketService from './services/WebSocketService'; 
import './App.css';

// Layout wrapper to conditionally show Navbar/Footer
function Layout({ children, onSigninClick, onSignupClick, currentUser, onLogout, userRole }) {
  const location = useLocation();
  
  // Only show navbar and footer on the home page
  const showNavAndFooter = location.pathname === '/';

  // Show global sidebar on dashboard-like routes
  const sidebarRoutes = new Set([
    '/dashboard',
    '/dashboard-client',
    '/dashboard-developer',
    '/profile',
    '/projects',
    '/myProjects',
    '/myProjectsDeveloper',
    '/marketplace',
    '/findDevelopers',
    '/findClients',
    '/messages',
    '/settings',
    '/payments',
    '/payment',
    '/client-payments',
    '/analytics',
    '/client-reports',
  ]);
  const showSidebar = sidebarRoutes.has(location.pathname);
  const appClassName = showNavAndFooter ? 'app with-navbar' : 'app no-navbar';

  return (
    <div className={appClassName}>
      {showNavAndFooter && (
        <Navbar 
          onSigninClick={onSigninClick} 
          onSignupClick={onSignupClick}
          currentUser={currentUser}
          onLogout={onLogout}
        />
      )}
      <div className={`app-body${showSidebar ? ' with-sidebar' : ''}`}>
        {showSidebar && <Sidebar role={userRole} />}
        <main className="main-content">
          {children}
        </main>
      </div>
      {showNavAndFooter && <Footer />}
    </div>
  );
}

function App() {
  const [activeAuthModal, setActiveAuthModal] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // TEST USERS - for easy switching between client and developer
  const TEST_USERS = {
    client: {
      id: 1,
      username: 'john_client',
      email: 'john@example.com',
      role: 'client'
    },
    developer: {
      id: 2,
      username: 'alex_dev',
      email: 'alex@example.com',
      role: 'developer'
    }
  };

  // Check if user is logged in from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('devconnect_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setIsAuthenticated(true);
      if (user.id) {
        WebSocketService.connect(user.id);
      }
    }

    // Cleanup: Disconnect when app unmounts
    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  // Function to handle successful login (called after role selection)
  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('devconnect_user', JSON.stringify(user));
    if (user.id) {
      WebSocketService.connect(user.id);
    }
  };

  // Function to handle logout
  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('devconnect_user');
    localStorage.removeItem('devconnect_token');
    localStorage.removeItem('token');
    localStorage.removeItem('devconnect_refresh_token');
    
    // Clear state
    setCurrentUser(null);
    setIsAuthenticated(false);
    
    // Disconnect WebSocket
    WebSocketService.disconnect();
  };

  // Function to switch between test users
  const switchTestUser = () => {
    const newUser = currentUser?.id === 1 ? TEST_USERS.developer : TEST_USERS.client;
    WebSocketService.disconnect();
    setCurrentUser(newUser);
    localStorage.setItem('devconnect_user', JSON.stringify(newUser));
    WebSocketService.connect(newUser.id);
  };

  const handleSigninClick = () => {
    setActiveAuthModal('login');
  };

  const handleSignupClick = () => {
    setActiveAuthModal('signup');
  };

  const closeAllAuthModals = () => {
    setActiveAuthModal(null);
  };

  const switchToSignup = () => {
    setActiveAuthModal('signup');
  };

  const switchToSignin = () => {
    setActiveAuthModal('login');
  };

  const switchToForgotPassword = () => {
    setActiveAuthModal('forgot');
  };

  const switchToResetPassword = () => {
    setActiveAuthModal('reset');
  };

  const userRole = currentUser?.role || currentUser?.userRole?.toLowerCase() || 'client';
  
  console.log('App.jsx - Current User:', currentUser);
  console.log('App.jsx - User Role:', userRole);
  
  const paymentElement = userRole === 'client' ? <ClientPayment /> : <DeveloperPayment />;

  return (
    <>
      <Layout 
        onSigninClick={handleSigninClick} 
        onSignupClick={handleSignupClick} 
        currentUser={currentUser}
        onLogout={handleLogout}
        userRole={userRole}
      >
        <Routes>
          {/* Main Pages */}
          <Route
            path="/"
            element={(
              <HomePage
                onSigninClick={handleSigninClick}
                onSignupClick={handleSignupClick}
                onForgotPasswordClick={switchToForgotPassword}
              />
            )}
          />
          <Route path="/role-selection" element={<RoleSelectionPage onRoleSelect={handleLogin} />} />

          {/* Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={userRole === 'client' ? <DashboardClient /> : <DashboardDeveloper />} 
          />
          <Route path="/dashboard-client" element={<DashboardClient />} />
          <Route path="/dashboard-developer" element={<DashboardDeveloper />} />
          
          <Route path="/profile" element={<ProfilePage currentUser={currentUser} />} />
          <Route path="/projects" element={<MyProjects />} />
          <Route path="/myProjects" element={<MyProjects />} />
          <Route path="/myProjectsDeveloper" element={<MyProjectsDeveloper />} />
          <Route path="/projects/:projectId" element={<ProjectDetails />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/findDevelopers" element={<FindDevelopers />} />
          <Route path="/findClients" element={<FindClients />} />
          
          <Route 
            path="/messages" 
            element={<MessagingPage />} 
          />
          
          <Route path="/client-payments" element={<ClientPayment />} />
          <Route path="/payments" element={paymentElement} />
          <Route path="/payment" element={paymentElement} />
          <Route path="/payments/client" element={<ClientPayment />} />
          <Route path="/payments/developer" element={<DeveloperPayment />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/client-reports" element={<ClientReports />} />
          <Route path="/settings" element={<div className="placeholder">Settings Page</div>} />
          <Route
            path="*"
            element={<div className="placeholder">Page not found</div>}
          />
        </Routes>
      </Layout>

      {/* Modal Components */}
      <LoginModal
        isOpen={activeAuthModal === 'login'}
        onClose={closeAllAuthModals}
        onSwitchToSignup={switchToSignup}
        onSwitchToForgotPassword={switchToForgotPassword}
        onSwitchToResetPassword={switchToResetPassword}
      />
      <SignupModal
        isOpen={activeAuthModal === 'signup'}
        onClose={closeAllAuthModals}
        onSwitchToSignin={switchToSignin}
      />
      <ForgotPasswordModal
        isOpen={activeAuthModal === 'forgot'}
        onClose={closeAllAuthModals}
        onSwitchToSignin={switchToSignin}
      />
      <ResetPasswordModal
        isOpen={activeAuthModal === 'reset'}
        onClose={closeAllAuthModals}
        onSwitchToSignin={switchToSignin}
      />
    </>
  );
}

export default App;
