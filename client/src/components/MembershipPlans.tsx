import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Check,
  Star,
  Speed,
  Support,
  Analytics,
  CloudUpload,
  Bolt,
} from '@mui/icons-material';
import paymentService, { MembershipPlan } from '../services/paymentService';

interface MembershipPlansProps {
  onSelectPlan: (plan: MembershipPlan) => void;
  selectedPlanId?: number;
  loading?: boolean;
}

const MembershipPlans: React.FC<MembershipPlansProps> = ({
  onSelectPlan,
  selectedPlanId,
  loading = false
}) => {
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        setError("");
        const membershipPlans = await paymentService.getMembershipPlans();
        // Show all plans including the free plan
        setPlans(membershipPlans);
      } catch (error: any) {
        console.error("Error fetching membership plans:", error);
        setError("Failed to load membership plans");
      } finally {
        setLoadingPlans(false);
      }
    };

    fetchPlans();
  }, []);

  const getPlanIcon = (type: number) => {
    switch (type) {
      case 0: return <Check color="success" />;
      case 1: return <Speed color="primary" />;
      case 2: return <Star color="secondary" />;
      case 3: return <Bolt color="error" />;
      default: return <Check />;
    }
  };

  const getPlanColor = (type: number) => {
    switch (type) {
      case 0: return "success";
      case 1: return "primary";
      case 2: return "secondary";
      case 3: return "error";
      default: return "default";
    }
  };

  const isPopular = (type: number) => type === 2; // Premium is popular

  const getPlanFeatures = (plan: MembershipPlan) => {
    let features = [];
    
    if (plan.type === 0) {
      // Free plan features
      features = [
        { text: "3 daily scans", icon: <Check color="success" /> },
        { text: "AI-powered analysis", icon: <Check color="success" /> },
        { text: "ATS optimization tips", icon: <Check color="success" /> },
      ];
    } else {
      // Paid plan features
      features = [
        { text: "Unlimited resume scans", icon: <Check color="success" /> },
        { text: "AI-powered analysis", icon: <Check color="success" /> },
        { text: "ATS optimization tips", icon: <Check color="success" /> },
      ];
    }

    if (plan.hasAdvancedAnalytics) {
      features.push({ text: "Advanced analytics dashboard", icon: <Analytics color="primary" /> });
    }

    if (plan.hasPrioritySupport) {
      features.push({ text: "Priority customer support", icon: <Support color="primary" /> });
    }

    if (plan.hasBulkUpload) {
      features.push({ text: "Bulk resume upload", icon: <CloudUpload color="primary" /> });
    }

    return features;
  };

  if (loadingPlans) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ my: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Choose Your Plan
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Unlock unlimited resume scans and advanced features
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { 
          xs: '1fr', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(3, 1fr)' 
        },
        gap: 3,
        justifyContent: 'center'
      }}>
        {plans.map((plan) => {
          const features = getPlanFeatures(plan);
          const isSelected = selectedPlanId === plan.id;
          const popular = isPopular(plan.type);
          
          return (
            <Box key={plan.id}>
              <Card
                elevation={popular ? 8 : 2}
                sx={{
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isSelected ? 2 : 0,
                  borderColor: isSelected ? 'primary.main' : 'transparent',
                  transform: popular ? 'scale(1.05)' : 'none',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: popular ? 'scale(1.08)' : 'scale(1.02)',
                    elevation: 6,
                  }
                }}
              >
                {popular && (
                  <Chip
                    label="Most Popular"
                    color="secondary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      {getPlanIcon(plan.type)}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom>
                      {plan.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', mb: 2 }}>
                      <Typography variant="h3" component="span" color="primary">
                        ${plan.price}
                      </Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                        /month
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense sx={{ py: 0 }}>
                    {features.map((feature, index) => (
                      <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {feature.icon}
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature.text}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <Box sx={{ p: 3, pt: 0 }}>
                  <Button
                    variant={plan.type === 0 ? "outlined" : (popular ? "contained" : "outlined")}
                    color={getPlanColor(plan.type) as any}
                    fullWidth
                    size="large"
                    onClick={() => plan.type !== 0 && onSelectPlan(plan)}
                    disabled={loading || plan.type === 0}
                    startIcon={loading && isSelected ? <CircularProgress size={20} /> : undefined}
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                    }}
                  >
                    {plan.type === 0 
                      ? 'Current Plan' 
                      : (loading && isSelected ? 'Processing...' : `Choose ${plan.name}`)
                    }
                  </Button>
                </Box>
              </Card>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 4, py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          All plans include a 30-day money-back guarantee
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Cancel anytime • No long-term commitments
        </Typography>
      </Box>
    </Box>
  );
};

export default MembershipPlans; 