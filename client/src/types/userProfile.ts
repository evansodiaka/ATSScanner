export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: string;
  lastUpdated: string;
  subscription?: UserSubscription;
  scanCount: number;
  lastScanDate?: string;
}

export interface UserSubscription {
  planName: string;
  type: string;
  price: number;
  scanLimit: number;
  scansUsed: number;
  scansRemaining: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  stripeSubscriptionId?: string;
  canCancel: boolean;
}

export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: string;
}