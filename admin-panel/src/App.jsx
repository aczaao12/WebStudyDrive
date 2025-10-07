import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

import AdminAuth from './components/AdminAuth';
import DocumentManager from './components/DocumentManager';
// import BorrowRequestManager from './components/BorrowRequestManager';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // Indigo
    },
    secondary: {
      main: '#f50057', // Pink
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
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin-login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Panel
          </Typography>
          {user ? (
            <>
              <Typography color="inherit" sx={{ mr: 2 }}>
                Xin chào, {user.email}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button color="inherit" component={Link} to="/admin-login">
              Đăng nhập Admin
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Routes>
          <Route path="/admin-login" element={<AdminAuth />} />
          <Route path="/documents" element={user ? <DocumentManager /> : <AdminAuth />} />
          <Route path="*" element={user ? <DocumentManager /> : <AdminAuth />} />
        </Routes>
      </Container>
    </ThemeProvider>
  );
}

export default App;