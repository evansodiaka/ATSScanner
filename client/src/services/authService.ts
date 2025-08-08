import axios, { AxiosResponse } from "axios";
import { User, AuthResponse } from "../types/user";

const API_URL = process.env.NODE_ENV === 'production'
  ? `${window.location.origin}/api/auth`
  : "https://localhost:7291/api/auth";

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
  storeUserWithExpiration(userData: User): void;
  updateActivity(): void;
  clearSession(): void; // Helper for testing
}

const SESSION_TIMEOUT = 3 * 60 * 60 * 1000; // 3 hours in milliseconds

const authService: AuthService = {
  // Helper method to store user with expiration
  storeUserWithExpiration(userData: User): void {
    const userWithExpiration = {
      ...userData,
      expiresAt: Date.now() + SESSION_TIMEOUT,
      lastActivity: Date.now(),
    };
    localStorage.setItem("user", JSON.stringify(userWithExpiration));
  },

  // Update last activity time
  updateActivity(): void {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      userData.lastActivity = Date.now();
      userData.expiresAt = Date.now() + SESSION_TIMEOUT;
      localStorage.setItem("user", JSON.stringify(userData));
    }
  },

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
        const userData: User = {
          token: response.data.token,
          username: response.data.username,
          email: response.data.email,
        };
        this.storeUserWithExpiration(userData);
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
        this.storeUserWithExpiration(userData);
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
    
    if (!user) {
      return null;
    }

    try {
      const userData = JSON.parse(user);
      
      // Check if session has expired
      if (userData.expiresAt && Date.now() > userData.expiresAt) {
        console.log("Session expired, logging out");
        this.logout();
        return null;
      }

      // Update activity if session is still valid
      if (userData.expiresAt) {
        this.updateActivity();
      }

      // Return user data without expiration fields
      return {
        token: userData.token,
        username: userData.username,
        email: userData.email,
      };
    } catch (error) {
      console.error("Error parsing user data:", error);
      this.logout();
      return null;
    }
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
        this.storeUserWithExpiration(userData);
      }

      return response.data;
    } catch (error) {
      console.error("Google auth error:", error);
      throw error;
    }
  },

  clearSession(): void {
    localStorage.removeItem("user");
    console.log("Session cleared");
  },
};

export default authService;
