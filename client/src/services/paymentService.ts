import axios, { AxiosResponse } from "axios";
import authService from "./authService";

const API_URL = process.env.NODE_ENV === 'production' 
  ? "https://atsscanner-personal-server-gbhacthqdpakayf3.canadacentral-01.azurewebsites.net/api"
  : "https://localhost:7291/api";

export interface MembershipPlan {
  id: number;
  name: string;
  type: number;
  price: number;
  scanLimit: number;
  isActive: boolean;
  stripePriceId?: string;
  hasAdvancedAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasBulkUpload: boolean;
}

export interface UsageStatus {
  isValid: boolean;
  userId?: number;
  scanCount: number;
  lastScanDate?: string;
  hasActiveMembership: boolean;
  membershipType: number;
  startDate?: string;
  endDate?: string;
  remainingScans: number;
  hasRegisteredAccount?: boolean;
  canScan?: boolean;
  isFirstTime?: boolean;
}

export interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
  planId: number;
  amount: number;
}

export interface CreatePaymentIntentRequest {
  planId: number;
}

export interface ConfirmPaymentRequest {
  planId: number;
  paymentIntentId: string;
}

const paymentService = {
  // Get available membership plans
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    try {
      const response: AxiosResponse<MembershipPlan[]> = await axios.get(
        `${API_URL}/payment/membership-plans`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching membership plans:", error);
      throw error;
    }
  },

  // Get current usage status (works for both authenticated and anonymous users)
  async getUsageStatus(): Promise<UsageStatus> {
    try {
      const user = authService.getCurrentUser();
      const headers: any = {};
      
      if (user?.token) {
        headers.Authorization = `Bearer ${user.token}`;
      }

      const response: AxiosResponse<UsageStatus> = await axios.get(
        `${API_URL}/resume/usage-status`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching usage status:", error);
      throw error;
    }
  },

  // Create payment intent for one-time payment
  async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    try {
      const user = authService.getCurrentUser();
      if (!user?.token) {
        throw new Error("User not authenticated");
      }

      const response: AxiosResponse<PaymentIntent> = await axios.post(
        `${API_URL}/payment/create-payment-intent`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating payment intent:", error);
      throw error;
    }
  },

  // Confirm payment after successful Stripe payment
  async confirmPayment(request: ConfirmPaymentRequest): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      if (!user?.token) {
        throw new Error("User not authenticated");
      }

      await axios.post(
        `${API_URL}/payment/confirm-payment`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error confirming payment:", error);
      throw error;
    }
  },

  // Get subscription status
  async getSubscriptionStatus(): Promise<UsageStatus> {
    try {
      const user = authService.getCurrentUser();
      if (!user?.token) {
        throw new Error("User not authenticated");
      }

      const response: AxiosResponse<UsageStatus> = await axios.get(
        `${API_URL}/payment/subscription-status`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(): Promise<void> {
    try {
      const user = authService.getCurrentUser();
      if (!user?.token) {
        throw new Error("User not authenticated");
      }

      await axios.post(
        `${API_URL}/payment/cancel-subscription`,
        {},
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  },
};

export default paymentService; 