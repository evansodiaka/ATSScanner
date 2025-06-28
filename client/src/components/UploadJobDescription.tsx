import React, { useState } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
// Removed CloseIcon import to fix React child error
import { useNavigate } from "react-router-dom";

const UploadJobDescription: React.FC = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [inputMethod, setInputMethod] = useState<"text" | "file">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);

  const validateFile = (file: File) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a PDF, DOCX, or TXT file only.");
      return false;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB.");
      return false;
    }

    return true;
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        if (typeof text === 'string') {
          resolve(text);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && validateFile(file)) {
      setSelectedFile(file);
      setError("");
      
      // Auto-populate job title from filename if not already filled
      if (!jobTitle.trim()) {
        const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
        setJobTitle(fileName);
      }

      // Extract text from file for preview
      setProcessing(true);
      try {
        const text = await extractTextFromFile(file);
        setJobDescription(text);
      } catch (error) {
        console.error("Failed to extract text from file:", error);
        setError("Failed to read file content. Please try again or use manual text input.");
      } finally {
        setProcessing(false);
      }
    } else if (file) {
      setSelectedFile(null);
    }
  };

  const handleInputMethodChange = (
    event: React.MouseEvent<HTMLElement>,
    newMethod: "text" | "file"
  ) => {
    if (newMethod !== null) {
      setInputMethod(newMethod);
      setError("");
      
      // Clear relevant fields when switching methods
      if (newMethod === "text") {
        setSelectedFile(null);
      } else {
        setJobDescription("");
      }
    }
  };

  const handleClose = () => {
    navigate("/dashboard");
  };

  const handleSave = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description or upload a file.");
      return;
    }

    if (!jobTitle.trim()) {
      setError("Please enter a job title.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const jobData = {
        id: Date.now(),
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        description: jobDescription.trim(),
        savedAt: new Date().toISOString(),
        source: inputMethod === "file" ? "file_upload" : "manual_input",
        fileName: selectedFile ? selectedFile.name : undefined,
      };
      
      const existingJobs = JSON.parse(localStorage.getItem("jobDescriptions") || "[]");
      existingJobs.push(jobData);
      localStorage.setItem("jobDescriptions", JSON.stringify(existingJobs));

      setSuccess(true);
      
      // Show success message briefly, then redirect to upload page
      setTimeout(() => {
        navigate("/upload");
      }, 1500);

    } catch (error: any) {
      console.error("Save failed:", error);
      
      // Ensure we always set a string error message
      let errorMessage = "Failed to save job description. Please try again.";
      
      if (error.response?.data?.message && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (error.message && typeof error.message === 'string') {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setJobDescription("");
    setCompanyName("");
    setJobTitle("");
    setSelectedFile(null);
    setError("");
    setSuccess(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h4">
              Upload Job Description
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
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Enter job descriptions to help tailor your resume for specific positions. 
            Choose to either paste text or upload a Job Description.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {String(error)}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Job description saved successfully!
            </Alert>
          )}

          <TextField
            fullWidth
            label="Job Title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Company Name (Optional)"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            sx={{ mb: 3 }}
          />

          {/* Input Method Toggle */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Choose Input Method
            </Typography>
            <ToggleButtonGroup
              value={inputMethod}
              exclusive
              onChange={handleInputMethodChange}
              aria-label="input method"
              sx={{ mb: 2 }}
            >
              <ToggleButton value="text" aria-label="Paste Job Description">
                📝 Paste Job Description
              </ToggleButton>
              <ToggleButton value="file" aria-label="Upload Job Description">
                📁 File Upload
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* File Upload Section */}
          {inputMethod === "file" && (
            <Box sx={{ mb: 3 }}>
              <input
                accept=".pdf,.docx,.txt"
                style={{ display: "none" }}
                id="job-description-file-input"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="job-description-file-input">
                <Button
                  variant="outlined"
                  component="span"
                  fullWidth
                  sx={{ mb: 2 }}
                  disabled={processing}
                  startIcon={processing ? <CircularProgress size={20} /> : null}
                >
                  {processing ? "Processing..." : "📁 Choose Job Description File"}
                </Button>
              </label>

              {selectedFile && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}

              <Typography variant="caption" color="textSecondary" sx={{ display: "block", mb: 2 }}>
                Supported formats: PDF, DOCX, TXT (max 10MB)
              </Typography>
            </Box>
          )}

          {/* Text Input Section */}
          {inputMethod === "text" && (
            <TextField
              fullWidth
              label="Job Description"
              multiline
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              sx={{ mb: 3 }}
              required
            />
          )}

          {/* File Content Preview */}
          {inputMethod === "file" && jobDescription && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                File Content Preview
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={8}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="File content will appear here..."
                helperText="You can edit the extracted text if needed"
              />
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving || processing}
              sx={{ flexGrow: 1 }}
              startIcon={saving ? <CircularProgress size={20} /> : null}
            >
              {saving ? "Saving..." : "Save Job Description"}
            </Button>

            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={saving || processing}
            >
              Clear
            </Button>
          </Box>

          <Typography variant="caption" color="textSecondary">
            {inputMethod === "text" 
              ? "Tip: Copy and paste the full job description from the job posting for best results."
              : "Tip: Upload a job description file in PDF, DOCX, or TXT format. The text will be extracted automatically."
            }
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default UploadJobDescription; 