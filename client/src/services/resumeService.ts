import axios, { AxiosResponse } from "axios";
import authService from "./authService";

const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://YOUR_AZURE_APP_NAME.azurewebsites.net/api/resume"
  : "https://localhost:7291/api/resume";

export interface UploadResponse {
  resumeId: number;
  content: string;
  atsScore: number;
  aiAnalysis: {
    score: number;
    analysis: string;
    optimizedResume: string;
  };
  remainingScans: number;
  hasRegisteredAccount: boolean;
  hasPaidMembership: boolean;
}

export interface ResumeItem {
  id: number;
  fileName: string;
  uploadDate: string;
  atsScore: number;
  aiScore: number;
}

export interface ResumeDetails {
  id: number;
  fileName: string;
  content: string;
  uploadDate: string;
  analysis: {
    atsScore: number;
    aiScore: number;
    feedback: string;
  } | null;
}

const resumeService = {
  async uploadResume(
    file: File, 
    industry: string = "General",
    jobDescription?: {
      jobTitle?: string;
      companyName?: string;
      description?: string;
    }
  ): Promise<UploadResponse> {
    try {
      const user = authService.getCurrentUser();
      console.log("Resume service - Current user:", user);
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("industry", industry);
      
      if (jobDescription) {
        if (jobDescription.jobTitle) {
          formData.append("jobTitle", jobDescription.jobTitle);
        }
        if (jobDescription.companyName) {
          formData.append("companyName", jobDescription.companyName);
        }
        if (jobDescription.description) {
          formData.append("jobDescription", jobDescription.description);
        }
      }

      // Prepare headers - include auth token if user is authenticated
      const headers: any = {
        "Content-Type": "multipart/form-data",
      };
      
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
        console.log("Resume service - Authenticated user, making request to:", `${API_URL}/upload`);
      } else {
        console.log("Resume service - Anonymous user, making request to:", `${API_URL}/upload`);
      }

      const response: AxiosResponse<UploadResponse> = await axios.post(
        `${API_URL}/upload`,
        formData,
        { headers }
      );

      return response.data;
    } catch (error) {
      console.error("Resume upload error:", error);
      throw error;
    }
  },

  async getMyResumes(): Promise<ResumeItem[]> {
    try {
      const user = authService.getCurrentUser();
      if (!user?.token) {
        throw new Error("User not authenticated");
      }

      const response: AxiosResponse<ResumeItem[]> = await axios.get(
        `${API_URL}/my-resumes`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching resumes:", error);
      throw error;
    }
  },

  async getResume(id: number): Promise<ResumeDetails> {
    try {
      const user = authService.getCurrentUser();
      if (!user?.token) {
        throw new Error("User not authenticated");
      }

      const response: AxiosResponse<ResumeDetails> = await axios.get(
        `${API_URL}/${id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching resume:", error);
      throw error;
    }
  },
};

export default resumeService; 