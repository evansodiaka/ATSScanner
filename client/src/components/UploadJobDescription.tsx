import React, { useState } from "react";
import {
  Container,
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  IconButton,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const UploadJobDescription: React.FC = () => {
  const navigate = useNavigate();
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    navigate("/dashboard");
  };

  const handleSave = async () => {
    if (!jobDescription.trim()) {
      setError("Please enter a job description.");
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
      };
      
      const existingJobs = JSON.parse(localStorage.getItem("jobDescriptions") || "[]");
      existingJobs.push(jobData);
      localStorage.setItem("jobDescriptions", JSON.stringify(existingJobs));

      setSuccess(true);
      
      setTimeout(() => {
        setJobDescription("");
        setCompanyName("");
        setJobTitle("");
        setSuccess(false);
      }, 2000);

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
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Box>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Save job descriptions to help tailor your resume for specific positions.
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
            sx={{ mb: 2 }}
          />

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

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              sx={{ flexGrow: 1 }}
            >
              {saving ? "Saving..." : "Save Job Description"}
            </Button>

            <Button
              variant="outlined"
              onClick={handleClear}
              disabled={saving}
            >
              Clear
            </Button>
          </Box>

          <Typography variant="caption" color="textSecondary">
            Tip: Copy and paste the full job description from the job posting for best results.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default UploadJobDescription; 