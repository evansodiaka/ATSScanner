import React from "react";
import { Box, Container, Typography, Link, Grid2 as Grid } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "primary.main",
        color: "white",
        py: 3,
        mt: "auto",
        minHeight: "120px"
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="center" alignItems="center">
          <Grid xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Resumatrix
            </Typography>
            <Typography variant="body2" color="inherit" paragraph>
              AI-powered resume optimization that beats the bots and lands interviews.
            </Typography>
          </Grid>
          
          <Grid xs={12} sm={6} md={4}>
            <Typography variant="h6" gutterBottom>
              Legal
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Link
                component={RouterLink}
                to="/privacy"
                color="inherit"
                underline="hover"
                variant="body2"
              >
                Privacy Policy
              </Link>
              <Link
                component={RouterLink}
                to="/terms"
                color="inherit"
                underline="hover"
                variant="body2"
              >
                Terms of Service
              </Link>
            </Box>
          </Grid>
          
          <Grid xs={12} sm={12} md={4}>
            <Typography variant="h6" gutterBottom>
              Contact
            </Typography>
            <Typography variant="body2" color="inherit">
              Email: support@resumatrix.co
            </Typography>
            <Typography variant="body2" color="inherit">
              Website: https://resumatrix.co
            </Typography>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          <Typography variant="body2" align="center" color="inherit">
            © {new Date().getFullYear()} Resumatrix. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;