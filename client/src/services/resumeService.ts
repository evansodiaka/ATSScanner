import axios, { AxiosResponse } from "axios";
import authService from "./authService";

const API_URL = "https://localhost:7291/api/resume";

export interface UploadResponse {
  resumeId: number;
  content: string;
  atsScore: number;
  aiAnalysis: {
    score: number;
    analysis: string;
  };
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
  async uploadResume(file: File, industry: string = "General"): Promise<UploadResponse> {
    try {
      const user = authService.getCurrentUser();
      if (!user?.token) {
        throw new Error("User not authenticated");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response: AxiosResponse<UploadResponse> = await axios.post(
        `${API_URL}/upload?industry=${encodeURIComponent(industry)}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${user.token}`,
          },
        }
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