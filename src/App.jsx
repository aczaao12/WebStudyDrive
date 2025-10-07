import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Auth from './components/Auth';
import BorrowForm from './components/BorrowForm';
import HomePage from './pages/HomePage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5e35b1', // Deep Purple
    },
    secondary: {
      main: '#ffb300', // Amber
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
});

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // No automatic redirection on login, HomePage will handle initial display
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Routes>
        <Route path="/" element={<HomePage currentUser={user} />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/borrow/:documentId" element={<BorrowForm user={user} />} />
      </Routes>
      <ToastContainer position="bottom-right" />
    </ThemeProvider>
  );
}

export default App;