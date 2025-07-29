import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Slide,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import MembershipPlans from './MembershipPlans';
import PaymentModal from './PaymentModal';
import { MembershipPlan } from '../services/paymentService';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  onUpgradeSuccess: () => void;
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onClose,
  onUpgradeSuccess
}) => {
  const [step, setStep] = useState<'plans' | 'payment'>('plans');
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const handleClose = () => {
    if (processingPayment) return; // Don't allow closing during payment
    setStep('plans');
    setSelectedPlan(null);
    setProcessingPayment(false);
    onClose();
  };

  const handleSelectPlan = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setStep('payment');
  };

  const handleBackToPlans = () => {
    setStep('plans');
    setSelectedPlan(null);
  };

  const handlePaymentSuccess = () => {
    setProcessingPayment(false);
    onUpgradeSuccess();
    handleClose();
  };

  return (
    <>
      {/* Main upgrade modal with plans */}
      <Dialog
        open={open && step === 'plans'}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Transition}
        PaperProps={{
          sx: { 
            borderRadius: 2,
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          pb: 2
        }}>
          <Box>
            <Box component="span" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Upgrade Your Account
            </Box>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 3, overflow: 'visible' }}>
          <MembershipPlans
            onSelectPlan={handleSelectPlan}
            selectedPlanId={selectedPlan?.id}
            loading={processingPayment}
          />
        </DialogContent>
      </Dialog>

      {/* Payment modal */}
      <PaymentModal
        open={step === 'payment'}
        onClose={handleBackToPlans}
        plan={selectedPlan}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default UpgradeModal; 