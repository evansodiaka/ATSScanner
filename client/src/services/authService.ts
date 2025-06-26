import axios, { AxiosResponse } from "axios";
import { User, AuthResponse, Resume, ResumeAnalysis } from "../types/user";

const API_URL = "https://localhost:7291/api/auth";

interface AuthService {
  register(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResponse>;
  login(usernameOrEmail: string, password: string): Promise<AuthResponse>;
  logout(): void;
  getCurrentUser(): User | null;
  googleAuth(idToken: string): Promise<AuthResponse>;
}

const authService: AuthService = {
  async register(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      console.log("Registration request:", { username, email });
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_URL}/register`,
        {
          username,
          email,
          password,
        },
      );
      console.log("Registration response:", response.data);
      if (response.data.token) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    } catch (error) {
      console.error("Registration error details:", {
        message: (error as Error).message,
        response: (error as any).response?.data,
        status: (error as any).response?.status,
      });
      throw error;
    }
  },

  async login(
    usernameOrEmail: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      console.log("Login request:", { usernameOrEmail });
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_URL}/login`,
        {
          usernameOrEmail,
          password,
        },
      );
      console.log("Login response:", response.data);

      // Check if we have a token in the response
      if (response.data.token) {
        // Store the entire response data
        const userData: User = {
          token: response.data.token,
          username: response.data.username,
          email: response.data.email,
        };
        console.log("Storing user data:", userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        console.error("No token in response:", response.data);
        throw new Error("No authentication token received");
      }
      return response.data;
    } catch (error) {
      console.error("Login error details:", {
        message: (error as Error).message,
        response: (error as any).response?.data,
        status: (error as any).response?.status,
        errors: (error as any).response?.data?.errors,
      });
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem("user");
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem("user");
    console.log("Current user from storage:", user);
    return user ? JSON.parse(user) : null;
  },

  async googleAuth(idToken: string): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_URL}/google`,
        {
          idToken,
        },
      );

      if (response.data.token) {
        const userData: User = {
          token: response.data.token,
          username: response.data.username,
          email: response.data.email,
        };
        localStorage.setItem("user", JSON.stringify(userData));
      }

      return response.data;
    } catch (error) {
      console.error("Google auth error:", error);
      throw error;
    }
  },
};

export default authService;
