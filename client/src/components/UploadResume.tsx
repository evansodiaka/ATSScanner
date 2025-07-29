import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CloudUpload,
  Login,
  Star,
} from "@mui/icons-material";
import resumeService, { UploadResponse } from "../services/resumeService";
import authService from "../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import UsageStatus from "./UsageStatus";
import UpgradeModal from "./UpgradeModal";

// Utility function to strip triple backticks and language identifiers from AI HTML output
function stripBackticks(html: string): string {
  return html.replace(/```[a-z]*\n?|```/gi, '').trim();
}

const UploadResume: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [industry, setIndustry] = useState<string>("General");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [currentJobDescription, setCurrentJobDescription] = useState<any>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalData, setLimitModalData] = useState<any>(null);
  const [usageRefreshTrigger, setUsageRefreshTrigger] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load the most recent job description and check authentication
  useEffect(() => {
    const checkAuthAndLoadData = () => {
      const user = authService.getCurrentUser();
      setIsAuthenticated(!!user);
      
      // No need to redirect if not authenticated - anonymous users can upload
      if (user) {
        console.log("User authenticated:", user.username);
      } else {
        console.log("Anonymous user - can use 3 free scans");
      }
    };

    checkAuthAndLoadData();

    // Load saved job description from localStorage
    const savedJobDescription = localStorage.getItem('currentJobDescription');
    if (savedJobDescription) {
      try {
        setCurrentJobDescription(JSON.parse(savedJobDescription));
      } catch (error) {
        console.error('Error parsing saved job description:', error);
        localStorage.removeItem('currentJobDescription');
      }
    }

    // Check if there's a result passed from a previous upload
    if (location.state?.uploadResult) {
      setUploadResult(location.state.uploadResult);
      // Clear the state to prevent it from persisting on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const validateFile = (file: File, fileType: string) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return "File size must be less than 10MB";
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    if (!allowedTypes.includes(fileType)) {
      return "Only PDF, DOCX, and TXT files are supported";
    }

    return null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const validationError = file ? validateFile(file, file.type) : null;

    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setUploadResult(null);
    } else if (file) {
      setSelectedFile(file);
      setError("");
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a resume file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // Prepare job description data if available
      let jobDescriptionData = undefined;
      if (currentJobDescription) {
        jobDescriptionData = {
          jobTitle: currentJobDescription.jobTitle,
          companyName: currentJobDescription.companyName,
          description: currentJobDescription.description
        };
      }

      // Upload resume with job description data
      const result = await resumeService.uploadResume(selectedFile, industry, jobDescriptionData);
      
      setUploadResult(result);
      
      // Refresh usage status after successful upload
      setUsageRefreshTrigger(prev => prev + 1);
      
    } catch (error: any) {
      console.error("Upload failed:", error);
      
      // Handle usage limit exceeded (429 status)
      if (error.response?.status === 429) {
        const limitData = error.response.data;
        setLimitModalData(limitData);
        setShowLimitModal(true);
        return;
      }
      
      // Check for authentication errors
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }
      
      // Handle other errors
      let errorMessage = "Failed to upload resume. Please try again.";
      
      if (error.response?.data?.message && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleNewUpload = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError("");
  };

  const handleViewOptimizedResume = () => {
    navigate("/optimized-resume", { state: { uploadResult } });
  };

  const handleClose = () => {
    navigate(isAuthenticated ? "/dashboard" : "/");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleUpgradeClick = () => {
    if (!isAuthenticated) {
      // For anonymous users, redirect to registration first
      navigate("/register", { 
        state: { 
          message: "Create an account to upgrade and get unlimited scans!" 
        }
      });
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleUpgradeSuccess = () => {
    setShowUpgradeModal(false);
    setShowLimitModal(false);
    setUsageRefreshTrigger(prev => prev + 1);
    // Show success message or refresh page
    setError("");
  };

  const handleLimitModalClose = () => {
    setShowLimitModal(false);
    setLimitModalData(null);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        {/* Usage Status Component */}
        <UsageStatus
          onUpgradeClick={handleUpgradeClick}
          onLoginClick={handleLoginClick}
          refreshTrigger={usageRefreshTrigger}
        />

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4">
              Upload Your Resume
            </Typography>
            <Button 
              onClick={handleClose}
              variant="text"
              size="small"
              sx={{ minWidth: 'auto', p: 1 }}
            >
              ✕
            </Button>
          </Box>
          
          {!uploadResult ? (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" color="textSecondary" gutterBottom>
                  {isAuthenticated 
                    ? "Upload your resume to get AI-powered analysis and optimization suggestions."
                    : "Get 3 free resume scans! No account required to start."
                  }
                </Typography>

                <input
                  accept=".pdf,.docx,.txt"
                  style={{ display: "none" }}
                  id="resume-file-input"
                  type="file"
                  onChange={handleFileChange}
                />
                <label htmlFor="resume-file-input">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                    sx={{ mt: 2, mb: 2 }}
                  >
                    Choose Resume File
                  </Button>
                </label>
                
                {selectedFile && (
                  <Typography variant="body2" sx={{ mt: 1, color: 'success.main' }}>
                    Selected: {selectedFile.name}
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    label="Industry"
                  >
                    <MenuItem value="General">General</MenuItem>
                    <MenuItem value="Tech">Technology</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Marketing">Marketing</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                    <MenuItem value="Retail">Retail</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Job Description Section */}
              {currentJobDescription ? (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Job Description Added ✓
                  </Typography>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {currentJobDescription.jobTitle || 'Job Title Not Specified'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {currentJobDescription.companyName || 'Company Not Specified'}
                          </Typography>
                        </Box>
                        <Chip 
                          label="Targeted Analysis" 
                          color="primary" 
                          size="small"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {currentJobDescription.description 
                          ? `${currentJobDescription.description.substring(0, 200)}...`
                          : 'Description available'
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => navigate("/job-description")}
                    sx={{ mb: 2 }}
                  >
                    📝 Edit Job Description
                  </Button>
                </Box>
              ) : (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    No Job Description Available
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Add a job description to get more targeted resume analysis and recommendations.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/job-description")}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    📝 Add Job Description
                  </Button>
                </Box>
              )}

              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                fullWidth
                size="large"
                sx={{ mt: 2 }}
                startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
              >
                {uploading ? "Analyzing Resume..." : "Upload and Analyze Resume"}
              </Button>

              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                Supported formats: PDF, DOCX, TXT (Max size: 10MB)
              </Typography>
            </>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Resume uploaded and analyzed successfully!
                {currentJobDescription && (
                  <><br />Analysis includes comparison with your saved job description.</>
                )}
              </Alert>

              <Typography variant="h6" gutterBottom>
                Analysis Results
              </Typography>

              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>ATS Score:</strong> {uploadResult.aiAnalysis?.score || 0}/100
                </Typography>
                {uploadResult.remainingScans !== undefined && (
                  <Typography variant="body2" color="text.secondary">
                    {uploadResult.remainingScans === -1 
                      ? "Unlimited scans remaining"
                      : `${uploadResult.remainingScans} scans remaining today`
                    }
                  </Typography>
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                AI Feedback
              </Typography>
              <Paper 
                elevation={1} 
                sx={{ p: 2, backgroundColor: "#f5f5f5", mb: 3 }}
              >
                <div
                  className="analysis-section"
                  style={{ whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{ 
                    __html: stripBackticks(uploadResult.aiAnalysis?.analysis || "No analysis available") 
                  }}
                />
              </Paper>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Button
                  variant="contained"
                  onClick={handleNewUpload}
                >
                  Upload Another Resume
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleViewOptimizedResume}
                >
                  View Optimized Resume
                </Button>
                {!uploadResult.hasPaidMembership && uploadResult.remainingScans !== undefined && uploadResult.remainingScans <= 1 && (
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleUpgradeClick}
                    startIcon={<Star />}
                  >
                    Upgrade for Unlimited
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>

        {/* Usage Limit Modal */}
        <Dialog open={showLimitModal} onClose={handleLimitModalClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h5" component="h2">
              {limitModalData?.needsPayment ? "Upgrade Required" : "Scan Limit Reached"}
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              {limitModalData?.message || "You've reached your scan limit."}
            </Alert>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {isAuthenticated 
                ? "Upgrade to a paid plan to get unlimited resume scans and premium features."
                : "Sign up for an account and upgrade to continue scanning resumes."
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLimitModalClose}>
              Cancel
            </Button>
            {!isAuthenticated && (
              <Button 
                variant="outlined" 
                onClick={handleLoginClick}
                startIcon={<Login />}
              >
                Sign In
              </Button>
            )}
            <Button 
              variant="contained" 
              onClick={handleUpgradeClick}
              startIcon={<Star />}
            >
              {isAuthenticated ? "Upgrade Now" : "Sign Up & Upgrade"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Upgrade Modal */}
        <UpgradeModal
          open={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          onUpgradeSuccess={handleUpgradeSuccess}
        />
      </Box>
    </Container>
  );
};

export default UploadResume; 