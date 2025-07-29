import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Divider,
} from '@mui/material';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  CreditCard,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import paymentService, { MembershipPlan, PaymentIntent } from '../services/paymentService';

// Initialize Stripe - you'll need to set your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RkXwOPNK7jJq4OFWfkoLxqVAha8lbr00F9S38V90YjbEtsqdN8uW1Rm85Jz2ASJMUIFIPIt36qkxpewetUmsos700ztLgCcFv');

// Helper function to get plan description for recurring payments
const getPlanDescription = (plan: MembershipPlan): string => {
  const baseFeatures = "✓ Unlimited resume scans and AI analysis\n✓ ATS optimization recommendations\n✓ Job description matching";
  
  switch (plan.type) {
    case 1: // Basic
      return `Monthly subscription with:\n${baseFeatures}\n✓ Advanced analytics dashboard\n\nRecurring billing: $${plan.price}/month, cancel anytime`;
    case 2: // Premium
      return `Monthly subscription with:\n${baseFeatures}\n✓ Advanced analytics dashboard\n✓ Priority customer support\n✓ Bulk resume upload processing\n\nRecurring billing: $${plan.price}/month, cancel anytime`;
    case 3: // Enterprise
      return `Monthly subscription with:\n${baseFeatures}\n✓ Advanced analytics dashboard\n✓ Priority customer support\n✓ Bulk resume upload processing\n✓ Enterprise-grade features\n\nRecurring billing: $${plan.price}/month, cancel anytime`;
    default:
      return `Monthly subscription with unlimited resume scans and premium features.\n\nRecurring billing: $${plan.price}/month, cancel anytime`;
  }
};

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  plan: MembershipPlan | null;
  onPaymentSuccess: () => void;
}

interface PaymentFormProps {
  plan: MembershipPlan;
  onPaymentSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ plan, onPaymentSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>("");
  const [step, setStep] = useState(0);
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);

  const steps = ['Payment Details', 'Processing', 'Complete'];

  useEffect(() => {
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        const intent = await paymentService.createPaymentIntent({ planId: plan.id });
        setPaymentIntent(intent);
      } catch (error: any) {
        setError("Failed to initialize payment. Please try again.");
        console.error("Error creating payment intent:", error);
      }
    };

    createPaymentIntent();
  }, [plan.id]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentIntent) {
      setError("Payment system not ready. Please try again.");
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card information not found. Please try again.");
      return;
    }

    setProcessing(true);
    setError("");
    setStep(1);

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message || "Payment failed");
      }

      if (confirmedIntent?.status === 'succeeded') {
        // Confirm payment on our backend
        await paymentService.confirmPayment({
          planId: plan.id,
          paymentIntentId: paymentIntent.paymentIntentId,
        });

        setStep(2);
        // Remove timeout to prevent premature modal closure
        onPaymentSuccess();
      } else {
        throw new Error("Payment was not successful");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setError(error.message || "Payment failed. Please try again.");
      setStep(0);
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  if (!paymentIntent) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Initializing payment...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <form onSubmit={handleSubmit}>
        {/* Keep CardElement mounted at all times */}
        <Box sx={{ display: step === 0 ? 'block' : 'none' }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Summary
            </Typography>
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              mb: 2
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body1">{plan.name} Plan</Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${plan.price}/month
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {getPlanDescription(plan)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CreditCard />
              Card Information
            </Typography>
            <Box sx={{ 
              border: '1px solid #ddd', 
              borderRadius: 1, 
              p: 2, 
              mb: 2 
            }}>
              <CardElement options={cardElementOptions} />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Your payment information is secure and encrypted.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={!stripe || processing}
              startIcon={processing ? <CircularProgress size={20} /> : undefined}
              sx={{ minWidth: 140 }}
            >
              {processing ? 'Processing...' : `Pay $${plan.price}`}
            </Button>
          </Box>
        </Box>
      </form>

      <Box sx={{ display: step === 1 ? 'block' : 'none', textAlign: 'center', py: 4 }}>
        <CircularProgress size={60} sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Processing Payment
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please don't close this window...
        </Typography>
      </Box>

      <Box sx={{ display: step === 2 ? 'block' : 'none', textAlign: 'center', py: 4 }}>
        <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Payment Successful!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your {plan.name} membership is now active.
        </Typography>
      </Box>
    </Box>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  plan,
  onPaymentSuccess
}) => {
  const handleClose = () => {
    if (!open) return;
    onClose();
  };

  if (!plan) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle>
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Upgrade to {plan.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Get unlimited access to all features
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Elements stripe={stripePromise}>
          <PaymentForm
            plan={plan}
            onPaymentSuccess={onPaymentSuccess}
            onCancel={handleClose}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal; 