import React, { useState } from 'react';
import { UserSubscription } from '../types/userProfile';
import CancelSubscriptionModal from './CancelSubscriptionModal';
import './SubscriptionCard.css';

interface SubscriptionCardProps {
  subscription?: UserSubscription;
  scanCount: number;
  lastScanDate?: string;
  onCancellationSuccess: () => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  scanCount,
  lastScanDate,
  onCancellationSuccess
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString();
  };

  const getProgressPercentage = () => {
    if (!subscription) return 0;
    return Math.min((subscription.scansUsed / subscription.scanLimit) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage >= 90) return '#ef4444'; // Red
    if (percentage >= 70) return '#f59e0b'; // Orange
    return '#10b981'; // Green
  };

  if (!subscription) {
    return (
      <div className="profile-section">
        <h2>Subscription</h2>
        <div className="subscription-card free-plan">
          <div className="plan-info">
            <h3>Free Plan</h3>
            <p>No active subscription</p>
            <div className="usage-info">
              <p>You're using the free tier with limited features.</p>
              <button className="upgrade-btn">Upgrade Plan</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <h2>Subscription</h2>
      <div className={`subscription-card ${subscription.isActive ? 'active' : 'inactive'}`}>
        <div className="plan-header">
          <div className="plan-info">
            <h3>{subscription.planName} Plan</h3>
            <div className="plan-price">
              ${subscription.price.toFixed(2)}/month
            </div>
            <div className={`plan-status ${subscription.isActive ? 'active' : 'inactive'}`}>
              {subscription.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>

        {/* Usage Progress */}
        <div className="usage-section">
          <div className="usage-header">
            <span>Scans Used</span>
            <span>{subscription.scansUsed} / {subscription.scanLimit}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${getProgressPercentage()}%`,
                backgroundColor: getProgressColor()
              }}
            />
          </div>
          <div className="scans-remaining">
            {subscription.scansRemaining} scans remaining this month
          </div>
        </div>

        {/* Subscription Details */}
        <div className="subscription-details">
          <div className="detail-row">
            <span>Plan Type:</span>
            <span>{subscription.type}</span>
          </div>
          {subscription.startDate && (
            <div className="detail-row">
              <span>Started:</span>
              <span>{formatDate(subscription.startDate)}</span>
            </div>
          )}
          {subscription.endDate && (
            <div className="detail-row">
              <span>Next Billing:</span>
              <span>{formatDate(subscription.endDate)}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="subscription-actions">
          {subscription.isActive && subscription.canCancel && (
            <button 
              className="cancel-btn"
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Subscription
            </button>
          )}
          <button className="manage-btn">
            Manage Billing
          </button>
        </div>

        {/* Features List */}
        <div className="plan-features">
          <h4>Plan Features</h4>
          <ul>
            <li>✓ {subscription.scanLimit} resume scans per month</li>
            <li>✓ Detailed ATS compatibility analysis</li>
            <li>✓ AI-powered optimization suggestions</li>
            {subscription.planName === 'Premium' && (
              <>
                <li>✓ Priority customer support</li>
                <li>✓ Advanced analytics dashboard</li>
                <li>✓ Bulk resume upload</li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <CancelSubscriptionModal
          planName={subscription.planName}
          onCancel={() => setShowCancelModal(false)}
          onConfirm={onCancellationSuccess}
        />
      )}
    </div>
  );
};

export default SubscriptionCard;