import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Tooltip,
  Snackbar,
} from "@mui/material";
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useNavigate, useLocation } from "react-router-dom";
import { UploadResponse } from "../services/resumeService";

// Utility function to strip triple backticks and language identifiers from AI HTML output
function stripBackticks(html: string): string {
  return html.replace(/```[a-z]*\n?|```/gi, '').trim();
}

const OptimizedResume: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const user = await import("../services/authService").then(module => module.default.getCurrentUser());
      if (!user) {
        console.log("User not authenticated, redirecting to login");
        navigate("/login");
        return;
      }
    };

    checkAuth();

    // Get the upload result from location state
    if (location.state?.uploadResult) {
      setUploadResult(location.state.uploadResult);
    } else {
      // If no upload result, redirect back to upload page
      navigate("/upload-resume");
    }
  }, [navigate, location]);

  const handleBackToAnalysis = () => {
    navigate("/upload-resume", { state: { uploadResult } });
  };

  const handleCopyOptimizedResume = async () => {
    if (uploadResult?.aiAnalysis?.optimizedResume) {
      try {
        await navigator.clipboard.writeText(uploadResult.aiAnalysis.optimizedResume);
        setCopySuccess(true);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  const handleCloseCopyAlert = () => {
    setCopySuccess(false);
  };

  const handleDownloadOptimizedResume = () => {
    if (!uploadResult?.aiAnalysis?.optimizedResume) return;
    
    // Create HTML content for download
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Optimized Resume</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .analysis-section ul, .optimized-section ul { margin: 0.1em 0; padding-left: 1.5em; }
          .analysis-section li, .optimized-section li { margin: 0.1em 0; line-height: 1.0; }
          h1, h2, h3 { margin: 0.1em 0 0.1em 0; }
          h1 { margin: 0.1em 0 0.1em 0; }
          h2 { margin: 0.1em 0 0.1em 0; }
          h3 { margin: 0.1em 0 0.1em 0; } 
          .section-title { margin: 0.25em 0 0.1em 0; }
          @media print {
            body { margin: 20px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        ${uploadResult.aiAnalysis.optimizedResume}
      </body>
      </html>
    `;
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-resume.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleNewUpload = () => {
    navigate("/upload-resume");
  };

  if (!uploadResult) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" gutterBottom>
              No Resume Data Available
            </Typography>
            <Typography variant="body1" paragraph>
              Please upload a resume to view the optimized version.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/upload-resume")}
            >
              Upload Resume
            </Button>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h4">
              🤖 Optimized Resume
            </Typography>
            <Button 
              onClick={handleBackToAnalysis}
              variant="text"
              size="small"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              ← Back to Analysis
            </Button>
          </Box>

          <Typography variant="body1" sx={{ mb: 3 }}>
            Your resume has been optimized by AI to achieve 90%+ ATS compatibility for the target job.
          </Typography>

          {/* Score Summary */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Performance Scores
            </Typography>
            <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
              <Paper elevation={1} sx={{ p: 2, flex: 1, textAlign: "center", backgroundColor: "#e3f2fd" }}>
                <Typography variant="h3" color="primary" sx={{ fontWeight: "bold" }}>
                  {uploadResult.atsScore || 0}
                </Typography>
                <Typography variant="subtitle1">
                  ATS Compatibility Score
                </Typography>
              </Paper>
              <Paper elevation={1} sx={{ p: 2, flex: 1, textAlign: "center", backgroundColor: "#f3e5f5" }}>
                <Typography variant="h3" color="secondary" sx={{ fontWeight: "bold" }}>
                  {uploadResult.aiAnalysis?.score || 0}
                </Typography>
                <Typography variant="subtitle1">
                  AI Quality Score
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h5">
              Your Optimized Resume
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Download optimized resume as HTML file">
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleDownloadOptimizedResume}
                  sx={{ 
                    minWidth: "auto", 
                    px: 2,
                    backgroundColor: "#2e7d32",
                    color: "white",
                    fontWeight: "bold",
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: "#1b5e20"
                    }
                  }}
                  startIcon={<CloudDownloadIcon />}
                >
                  Download
                </Button>
              </Tooltip>
              <Tooltip title="Copy optimized resume to clipboard">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCopyOptimizedResume}
                  sx={{ 
                    minWidth: "auto", 
                    px: 2,
                    borderColor: "#1976d2",
                    color: "#1976d2",
                    '&:hover': {
                      borderColor: "#1565c0",
                      backgroundColor: "rgba(25, 118, 210, 0.04)"
                    }
                  }}
                  startIcon={<ContentCopyIcon />}
                >
                  Copy
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Optimized Resume Content */}
          {uploadResult.aiAnalysis?.optimizedResume && (
            <Box sx={{ mb: 4 }}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 3, 
                  backgroundColor: "#f0f8ff", 
                  border: "2px solid #2196f3",
                  mb: 2
                }}
              >
                <div
                  className="optimized-resume-section"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.6,
                    fontSize: "1rem"
                  }}
                  dangerouslySetInnerHTML={{ __html: stripBackticks(uploadResult.aiAnalysis.optimizedResume) }}
                />
              </Paper>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <Alert severity="success" sx={{ flex: 1 }}>
                  <strong>🎯 Target Achieved:</strong> This resume is optimized for 90%+ ATS compatibility
                </Alert>
                <Alert severity="info" sx={{ flex: 1 }}>
                  <strong>⚠️ Please verify:</strong> Review all information for accuracy before using
                </Alert>
              </Box>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 4 }}>
            <Button
              variant="contained"
              onClick={handleNewUpload}
              sx={{ px: 4 }}
            >
              Upload New Resume
            </Button>
            <Button
              variant="outlined"
              onClick={handleBackToAnalysis}
              sx={{ px: 4 }}
            >
              Back to Analysis
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseCopyAlert}
        message="✅ Optimized resume copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default OptimizedResume; 