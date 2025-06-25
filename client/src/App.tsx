import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Container, Box, Paper } from '@mui/material';
import Login from './components/Login';
import authService from './services/authService';
import { User } from './types/user';

const Home: React.FC = () => {
  const user: User | null = authService.getCurrentUser();
  
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to ATSScanner
          </Typography>
          <Typography variant="h6" gutterBottom>
            Hello, {user?.username}!
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              What would you like to do?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/resumes"
              >
                View Resumes
              </Button>
              <Button
                variant="contained"
                color="secondary"
                component={Link}
                to="/upload"
              >
                Upload New Resume
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

const App: React.FC = () => {
  const currentUser: User | null = authService.getCurrentUser();

  return (
    <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            ATSScanner
          </Typography>
          {currentUser ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {currentUser.username}
              </Typography>
              <Button color="inherit" onClick={authService.logout}>
                Logout
              </Button>
            </>
          ) : null}
        </Toolbar>
      </AppBar>

      <Container>
        <Routes>
          <Route 
            path="/" 
            element={currentUser ? <Home /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/login" 
            element={!currentUser ? <Login /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!currentUser ? <Login /> : <Navigate to="/" />} 
          />
          {/* Add more routes as needed */}
        </Routes>
      </Container>
    </Router>
  );
};

export default App; 