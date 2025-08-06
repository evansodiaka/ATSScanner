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
  ThemeProvider,
  createTheme,
} from "@mui/material";
import Login from "./components/Login";
import Homepage from "./components/Homepage";
import UploadResume from "./components/UploadResume";
import UploadJobDescription from "./components/UploadJobDescription";
import OptimizedResume from "./components/OptimizedResume";
import UserProfile from "./components/UserProfile";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";
import Footer from "./components/Footer";
//import Homepage from "./components/Homepage";
import authService from "./services/authService";
import { User } from "./types/user";

const Home: React.FC<{ user: User | null }> = ({ user }) => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Welcome to Resumatrix
          </Typography>
          <Typography variant="h6" gutterBottom>
            Hello, {user?.username}!
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              Create your personalized resume?
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/job-description"
              >
                Upload Job Description
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

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

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

  // Activity tracker to extend session on user interaction
  useEffect(() => {
    if (!currentUser) return;

    const activities = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      if (currentUser) {
        authService.updateActivity();
      }
    };

    // Add event listeners for user activity
    activities.forEach(activity => {
      document.addEventListener(activity, handleActivity, true);
    });

    // Check session expiration periodically
    const sessionCheckInterval = setInterval(() => {
      const user = authService.getCurrentUser();
      if (!user && currentUser) {
        // Session expired
        setCurrentUser(null);
        console.log("Session expired - user logged out");
      }
    }, 60000); // Check every minute

    return () => {
      // Clean up event listeners
      activities.forEach(activity => {
        document.removeEventListener(activity, handleActivity, true);
      });
      clearInterval(sessionCheckInterval);
    };
  }, [currentUser]);

  return (
    <ThemeProvider theme={theme}>
      <Router>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 600, fontFamily: "cursive" }}
          >
            <Link 
              to={currentUser ? "/dashboard" : "/"} 
              style={{ color: 'inherit', textDecoration: 'none' }}
            >
              Resumatrix.
            </Link>
          </Typography>
          {currentUser ? (
            <>
              <Button color="inherit" component={Link} to="/profile" sx={{ mr: 1 }}>
                Profile
              </Button>
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

      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Container className={currentUser ? "dashboard-container" : ""} sx={{ flex: 1 }}>
          <Routes>
          <Route
            path="/"
            element={currentUser ? <Navigate to="/dashboard" /> : <Homepage />}
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
              currentUser ? <Home user={currentUser} /> : <Navigate to="/" />
            }
          />
          <Route
            path="/upload"
            element={<UploadResume />}
          />
          <Route
            path="/upload-resume"
            element={<UploadResume />}
          />
          <Route
            path="/optimized-resume"
            element={<OptimizedResume />}
          />
          <Route
            path="/job-description"
            element={<UploadJobDescription />}
          />
          <Route
            path="/profile"
            element={
              currentUser ? <UserProfile /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/privacy"
            element={<PrivacyPolicy />}
          />
          <Route
            path="/terms"
            element={<TermsOfService />}
          />
          {/* Add more routes as needed */}
          </Routes>
        </Container>
        <Footer />
      </Box>
    </Router>
    </ThemeProvider>
  );
};

export default App;
