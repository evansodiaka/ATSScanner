import React, { useState } from 'react';
import { ProfileService } from '../services/profileService';
import './CancelSubscriptionModal.css';

interface CancelSubscriptionModalProps {
  planName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  planName,
  onCancel,
  onConfirm
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'success' | 'error'>('confirm');

  const handleCancel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await ProfileService.cancelSubscription();
      setStep('success');
      
      // Auto-close modal and refresh after success
      setTimeout(() => {
        onConfirm(); // This will refresh the profile data
        onCancel(); // This will close the modal
      }, 2000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderConfirmStep = () => (
    <>
      <div className="modal-header">
        <h2>Cancel Subscription</h2>
      </div>
      
      <div className="modal-body">
        <div className="warning-icon">⚠️</div>
        <p>
          Are you sure you want to cancel your <strong>{planName}</strong> subscription?
        </p>
        
        <div className="cancellation-details">
          <h4>What happens when you cancel:</h4>
          <ul>
            <li>Your subscription will remain active until the end of your current billing period</li>
            <li>You'll continue to have access to premium features until then</li>
            <li>After that, you'll be moved to the free plan with limited features</li>
            <li>Your scan history and data will be preserved</li>
            <li>You can resubscribe at any time</li>
          </ul>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
      
      <div className="modal-actions">
        <button 
          className="btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Keep Subscription
        </button>
        <button 
          className="btn-danger"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {isLoading ? 'Cancelling...' : 'Yes, Cancel Subscription'}
        </button>
      </div>
    </>
  );

  const renderSuccessStep = () => (
    <>
      <div className="modal-header">
        <h2>Subscription Cancelled</h2>
      </div>
      
      <div className="modal-body">
        <div className="success-icon">✅</div>
        <p>
          Your <strong>{planName}</strong> subscription has been successfully cancelled.
        </p>
        <p>
          You'll continue to have access to premium features until the end of your current billing period.
        </p>
      </div>
    </>
  );

  const renderErrorStep = () => (
    <>
      <div className="modal-header">
        <h2>Cancellation Failed</h2>
      </div>
      
      <div className="modal-body">
        <div className="error-icon">❌</div>
        <p>
          We encountered an error while cancelling your subscription:
        </p>
        <div className="error-message">
          {error}
        </div>
        <p>
          Please try again or contact support if the problem persists.
        </p>
      </div>
      
      <div className="modal-actions">
        <button 
          className="btn-secondary"
          onClick={onCancel}
        >
          Close
        </button>
        <button 
          className="btn-primary"
          onClick={() => {
            setStep('confirm');
            setError(null);
          }}
        >
          Try Again
        </button>
      </div>
    </>
  );

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {step === 'confirm' && renderConfirmStep()}
        {step === 'success' && renderSuccessStep()}
        {step === 'error' && renderErrorStep()}
      </div>
    </div>
  );
};

export default CancelSubscriptionModal;