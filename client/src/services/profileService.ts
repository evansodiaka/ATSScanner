import axios, { AxiosResponse } from 'axios';
import { UserProfile, UpdateUserProfile } from '../types/userProfile';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://YOUR_AZURE_APP_NAME.azurewebsites.net/api/profile'
  : 'https://localhost:7291/api/profile';

export class ProfileService {
  private static getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private static getAuthHeaders() {
    const token = this.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Get user profile
  static async getProfile(): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await axios.get(API_URL, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in again');
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }

  // Update user profile
  static async updateProfile(profileData: UpdateUserProfile): Promise<UserProfile> {
    try {
      const response: AxiosResponse<UserProfile> = await axios.put(API_URL, profileData, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in again');
      }
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }

  // Cancel subscription
  static async cancelSubscription(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.post(
        `${API_URL}/cancel-subscription`,
        {},
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in again');
      }
      throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
}