import React, { useState } from "react";
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
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import resumeService, { UploadResponse } from "../services/resumeService";

const UploadResume: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [industry, setIndustry] = useState<string>("General");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string>("");

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ];
      
      if (!allowedTypes.includes(file.type)) {
        setError("Please upload a PDF, DOCX, or TXT file only.");
        setSelectedFile(null);
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB.");
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
      setError("");
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const result = await resumeService.uploadResume(selectedFile, industry);
      setUploadResult(result);
    } catch (error: any) {
      console.error("Upload failed:", error);
      
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
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Upload Your Resume
          </Typography>
          
          {!uploadResult ? (
            <>
              <Typography variant="body1" paragraph>
                Upload your resume to get ATS compatibility scoring and AI-powered feedback.
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
                    startIcon={<CloudUpload />}
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Choose Resume File
                  </Button>
                </label>

                {selectedFile && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    Selected file: {selectedFile.name || "Unknown file"}
                  </Typography>
                )}

                                                 <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  fullWidth
                  sx={{ mt: 2 }}
                  startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUpload />}
                >
                  {uploading ? "Analyzing Resume..." : "Upload and Analyze"}
                </Button>
              </Box>

              <Typography variant="caption" color="textSecondary">
                Supported formats: PDF, DOCX, TXT (Max size: 10MB)
              </Typography>
            </>
          ) : (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Resume uploaded and analyzed successfully!
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

              <Button
                variant="contained"
                onClick={handleNewUpload}
                sx={{ mr: 2 }}
              >
                Upload Another Resume
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UploadResume; 