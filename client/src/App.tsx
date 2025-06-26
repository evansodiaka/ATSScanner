import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Paper,
} from "@mui/material";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
//import Homepage from "./components/Homepage";
import authService from "./services/authService";
import { User } from "./types/user";

const Home: React.FC<{ user: User | null }> = ({ user }) => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Resumetrics
          </Typography>
          <Typography variant="h6" gutterBottom>
            Hello, {user?.username}!
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              What would you like to do?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
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
  const [currentUser, setCurrentUser] = useState<User | null>(
    authService.getCurrentUser(),
  );

  // Handle logout
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  // Listen for login events (for when user logs in via Google or form)
  useEffect(() => {
    const checkUser = () => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
    };

    // Check user on component mount and when localStorage changes
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  return (
    <Router>
            <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontFamily: 'cursive' }}>
            Resumetrics.
          </Typography>
          {currentUser ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {currentUser.username}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
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
            element={
              currentUser ? (
                <Navigate to="/dashboard" />
              ) : (
                <Homepage />
              )
            }
          />
          <Route
            path="/login"
            element={!currentUser ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/register"
            element={!currentUser ? <Login /> : <Navigate to="/dashboard" />}
          />
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <Home user={currentUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          {/* Add more routes as needed */}
        </Routes>
      </Container>
    </Router>
  );
};

export default App;
