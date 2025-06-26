export interface User {
  username: string;
  email: string;
  token?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  imageUrl?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
}

export interface Resume {
  id: string;
  filename: string;
  uploadDate: string;
  // Add other resume properties as needed
}

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  score: number;
  feedback: string;
  // Add other analysis properties as needed
}
