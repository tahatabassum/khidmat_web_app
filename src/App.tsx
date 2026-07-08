import React, { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AIMatching from './pages/AIMatching';
import ProviderList from './pages/ProviderList';
import ProviderProfile from './pages/ProviderProfile';
import ConfirmBooking from './pages/ConfirmBooking';
import Chat from './pages/Chat';
import MyBookings from './pages/MyBookings';
import Inbox from './pages/Inbox';
import Profile from './pages/Profile';
import { Safety } from './pages/Safety';
import { Categories } from './pages/Categories';
import { seedDatabase } from './utils/seedData';
import { Footer } from './components/Footer';

// Layout component to selectively wrap pages with header/footer navigation
const AppLayout: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Run database seeding on app startup
    seedDatabase();
  }, []);
  
  // Suppress navigation on Auth screen (as per "The Filter" rule for transactional/onboarding pages)
  const isAuthScreen = location.pathname.startsWith('/auth');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthScreen && <Navbar />}
      <main className="flex-grow flex flex-col">
        <div className="flex-grow">
          <Outlet />
        </div>
        {!isAuthScreen && <Footer />}
      </main>
      {!isAuthScreen && <BottomNav />}
    </div>
  );
};

// Router definition
const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { 
        path: '', 
        element: (
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'auth', 
        element: <Auth /> 
      },
      { 
        path: 'matching', 
        element: (
          <ProtectedRoute>
            <AIMatching />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'providers', 
        element: (
          <ProtectedRoute>
            <ProviderList />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'provider/:id', 
        element: (
          <ProtectedRoute>
            <ProviderProfile />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'booking', 
        element: (
          <ProtectedRoute>
            <ConfirmBooking />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'chat', 
        element: (
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'inbox', 
        element: (
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'profile', 
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'bookings', 
        element: (
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'safety', 
        element: (
          <ProtectedRoute>
            <Safety />
          </ProtectedRoute>
        ) 
      },
      { 
        path: 'categories', 
        element: (
          <ProtectedRoute>
            <Categories />
          </ProtectedRoute>
        ) 
      },
    ],
  },
]);

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
