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
  IconButton,
  Tooltip,
  Snackbar,
} from "@mui/material";
// Removed CloudUpload import to fix React child error
import resumeService, { UploadResponse } from "../services/resumeService";
import { useNavigate } from "react-router-dom";

const UploadResume: React.FC = () => {
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [industry, setIndustry] = useState<string>("General");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [showOptimizedView, setShowOptimizedView] = useState<boolean>(false);
  const [currentJobDescription, setCurrentJobDescription] = useState<any>(null);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Load the most recent job description on component mount
  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      const user = await import("../services/authService").then(module => module.default.getCurrentUser());
      if (!user) {
        console.log("User not authenticated, redirecting to login");
        navigate("/login");
        return;
      }
      console.log("User authenticated:", user.username);
    };

    checkAuth();

    try {
      const savedJobs = JSON.parse(localStorage.getItem("jobDescriptions") || "[]");
      if (savedJobs.length > 0) {
        // Get the most recently saved job description
        const mostRecent = savedJobs[savedJobs.length - 1];
        setCurrentJobDescription(mostRecent);
      }
    } catch (error) {
      console.error("Error loading job descriptions:", error);
    }
  }, [navigate]);

  const industries = [
    "General",
    "Technology",
    "Healthcare",
    "Finance",
    "Marketing",
    "Engineering",
    "Education",
    "Sales",
    "Human Resources",
    "Legal",
    "Manufacturing",
    "Retail",
  ];

  const validateFile = (file: File, fileType: string) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError(`Please upload a PDF, DOCX, or TXT file only for ${fileType}.`);
      return false;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`File size must be less than 10MB for ${fileType}.`);
      return false;
    }

    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file, "resume")) {
      setSelectedFile(file);
      setError("");
      setUploadResult(null);
    } else if (file) {
      setSelectedFile(null);
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
    } catch (error: any) {
      console.error("Upload failed:", error);
      
      // Check for authentication errors
      if (error.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }
      
      // Ensure we always set a string error message
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
    setShowOptimizedView(false);
  };

  const handleViewOptimizedResume = () => {
    setShowOptimizedView(true);
  };

  const handleBackToResults = () => {
    setShowOptimizedView(false);
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

  const handleClose = () => {
    navigate("/dashboard");
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
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
              <Typography variant="body1" paragraph>
                Upload your resume to get ATS compatibility scoring and AI-powered feedback. 
                Optionally upload a job description file to save it for later comparison.
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Industry</InputLabel>
                  <Select
                    value={industry}
                    label="Industry"
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    {industries.map((ind) => (
                      <MenuItem key={ind} value={ind}>
                        {ind}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

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
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    📁 Choose Resume File
                  </Button>
                </label>

                {selectedFile && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Selected resume: {selectedFile.name || "Unknown file"}
                  </Typography>
                )}

                {/* Current Job Description Display */}
                {currentJobDescription && (
                  <Box sx={{ mt: 3, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Job Description to Analyze Against
                    </Typography>
                    <Card variant="outlined" sx={{ mb: 2 }}>
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                          <Typography variant="h6" component="h3">
                            {currentJobDescription.jobTitle}
                          </Typography>
                          <Chip 
                            label={currentJobDescription.source === "file_upload" ? "File Upload" : "Manual Input"} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                        {currentJobDescription.companyName && (
                          <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                            Company: {currentJobDescription.companyName}
                          </Typography>
                        )}
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          Saved: {new Date(currentJobDescription.savedAt).toLocaleDateString()}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          maxHeight: "100px", 
                          overflow: "auto", 
                          backgroundColor: "#f5f5f5", 
                          p: 1, 
                          borderRadius: 1 
                        }}>
                          {currentJobDescription.description.substring(0, 200)}
                          {currentJobDescription.description.length > 200 && "..."}
                        </Typography>
                      </CardContent>
                    </Card>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => navigate("/job-description")}
                      sx={{ mb: 2 }}
                    >
                      📝 Add New Job Description
                    </Button>
                  </Box>
                )}

                {!currentJobDescription && (
                  <Box sx={{ mt: 3, mb: 2 }}>
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
                  sx={{ mt: 2 }}
                  startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  {uploading ? "Analyzing Resume..." : "Upload and Analyze Resume"}
                </Button>
              </Box>

              <Typography variant="caption" color="textSecondary">
                Supported formats for both files: PDF, DOCX, TXT (Max size: 10MB each)
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
                  <strong>ATS Score:</strong> {uploadResult.atsScore || 0}/100
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>AI Score:</strong> {uploadResult.aiAnalysis?.score || 0}/100
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                AI Feedback
              </Typography>
              <Paper 
                elevation={1} 
                sx={{ p: 2, backgroundColor: "#f5f5f5", mb: 3 }}
              >
                <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                  {uploadResult.aiAnalysis?.analysis || "No analysis available"}
                </Typography>
              </Paper>

              <Box sx={{ display: "flex", gap: 2 }}>
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
              </Box>
                          </Box>
            )}
        </Paper>

        {/* Optimized Resume View Section */}
        {showOptimizedView && uploadResult && (
          <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
              <Typography variant="h4">
                Optimized Resume Results
              </Typography>
              <Button 
                onClick={handleBackToResults}
                variant="text"
                size="small"
                sx={{ minWidth: 'auto', p: 1 }}
              >
                ← Back to Analysis
              </Button>
            </Box>

            <Typography variant="body1" sx={{ mb: 3 }}>
              Your resume has been analyzed and optimized based on ATS requirements and AI recommendations.
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

            {/* Detailed Analysis */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Detailed AI Analysis & Recommendations
              </Typography>
              <Paper 
                elevation={1} 
                sx={{ p: 3, backgroundColor: "#f8f9fa", border: "1px solid #e0e0e0" }}
              >
                <Typography variant="body1" style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                  {uploadResult.aiAnalysis?.analysis || "No detailed analysis available"}
                </Typography>
              </Paper>
            </Box>

            {/* AI-Generated Optimized Resume */}
            {uploadResult.aiAnalysis?.optimizedResume && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Typography variant="h5">
                    🤖 AI-Generated Optimized Resume (90% ATS Target)
                  </Typography>
                  <Tooltip title="Copy optimized resume to clipboard">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCopyOptimizedResume}
                      sx={{ minWidth: "auto", px: 2 }}
                    >
                      📋 Copy
                    </Button>
                  </Tooltip>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  This is a completely rewritten version of your resume, optimized by AI to achieve 90%+ ATS compatibility for the target job.
                </Typography>
                <Paper 
                  elevation={2} 
                  sx={{ 
                    p: 3, 
                    backgroundColor: "#f0f8ff", 
                    border: "2px solid #2196f3",
                    maxHeight: "500px",
                    overflow: "auto",
                    mb: 2
                  }}
                >
                  <Typography 
                    variant="body2" 
                    component="pre" 
                    sx={{ 
                      fontFamily: "Arial, sans-serif", 
                      whiteSpace: "pre-wrap", 
                      lineHeight: 1.5,
                      fontSize: "0.9rem"
                    }}
                  >
                    {uploadResult.aiAnalysis.optimizedResume}
                  </Typography>
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

            {/* Original Resume Content */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                📄 Your Original Resume
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Your original resume content for reference and comparison.
              </Typography>
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 3, 
                  backgroundColor: "#ffffff", 
                  border: "1px solid #e0e0e0",
                  maxHeight: "400px",
                  overflow: "auto"
                }}
              >
                <Typography 
                  variant="body2" 
                  component="pre" 
                  sx={{ 
                    fontFamily: "monospace", 
                    whiteSpace: "pre-wrap", 
                    lineHeight: 1.4,
                    fontSize: "0.85rem",
                    color: "#666"
                  }}
                >
                  {uploadResult.content || "Resume content not available"}
                </Typography>
              </Paper>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                onClick={handleNewUpload}
                sx={{ px: 4 }}
              >
                Upload New Resume
              </Button>
              <Button
                variant="outlined"
                onClick={handleBackToResults}
                sx={{ px: 4 }}
              >
                Back to Analysis
              </Button>
            </Box>
          </Paper>
        )}
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

export default UploadResume; 