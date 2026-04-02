import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import Header from './components/Header';
import Gallery from './pages/Gallery';
import './App.css';

function AppRoutes({ user, setUser }) {
  const location = useLocation();
  const shouldShowHeader = location.pathname !== '/';

  return (
    <>
      {shouldShowHeader && <Header user={user} setUser={setUser} />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/home" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/reserve" element={<Navigate to="/home" replace />} />
        <Route
          path="/admin"
          element={
            user?.role === 'ADMIN' ? (
              <Admin user={user} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('nearpet-user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('nearpet-user', JSON.stringify(user));
      return;
    }

    localStorage.removeItem('nearpet-user');
  }, [user]);

  return (
    <Router>
      <AppRoutes user={user} setUser={setUser} />
    </Router>
  );
}

export default App;
