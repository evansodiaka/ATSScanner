import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Button,
  Alert,
  Stack,
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import paymentService, { UsageStatus as UsageStatusType } from '../services/paymentService';
import authService from '../services/authService';

interface UsageStatusProps {
  onUpgradeClick?: () => void;
  onLoginClick?: () => void;
  refreshTrigger?: number; // To trigger refresh from parent components
}

const UsageStatus: React.FC<UsageStatusProps> = ({ 
  onUpgradeClick, 
  onLoginClick,
  refreshTrigger 
}) => {
  const [usageStatus, setUsageStatus] = useState<UsageStatusType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchUsageStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const status = await paymentService.getUsageStatus();
      setUsageStatus(status);
    } catch (error: any) {
      console.error("Error fetching usage status:", error);
      setError("Failed to load usage status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageStatus();
  }, [refreshTrigger]);

  const getMembershipTypeLabel = (type: number) => {
    switch (type) {
      case 0: return "Free";
      case 1: return "Basic";
      case 2: return "Premium";
      case 3: return "Enterprise";
      default: return "Unknown";
    }
  };

  const getMembershipColor = (type: number, hasActive: boolean) => {
    if (!hasActive) return "default";
    switch (type) {
      case 1: return "primary";
      case 2: return "secondary";
      case 3: return "error";
      default: return "default";
    }
  };

  const getProgressColor = (remaining: number, total: number = 3) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 66) return "success";
    if (percentage > 33) return "warning";
    return "error";
  };

  const isAuthenticated = authService.getCurrentUser() !== null;

  if (loading) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Usage Status
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card elevation={2}>
        <CardContent>
          <Alert severity="error" action={
            <Button size="small" onClick={fetchUsageStatus}>
              Retry
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!usageStatus) return null;

  const isUnlimited = usageStatus.remainingScans === -1;
  const hasActiveMembership = usageStatus.hasActiveMembership;
  const remainingScans = usageStatus.remainingScans;
  const scanCount = usageStatus.scanCount;

  return (
    <Card elevation={2} sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasActiveMembership ? <Star color="primary" /> : <TrendingUp color="action" />}
            Usage Status
          </Typography>
          <Chip
            label={getMembershipTypeLabel(usageStatus.membershipType)}
            color={getMembershipColor(usageStatus.membershipType, hasActiveMembership) as any}
            size="small"
            icon={hasActiveMembership ? <CheckCircle /> : undefined}
          />
        </Box>

        {/* For users with active paid membership */}
        {hasActiveMembership && isUnlimited && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              🎉 You have unlimited scans with your {getMembershipTypeLabel(usageStatus.membershipType)} membership!
            </Typography>
          </Alert>
        )}

        {/* For free tier users (both registered and unregistered) */}
        {!hasActiveMembership && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {isAuthenticated ? 'Daily Scans' : 'Free Scans'}
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {remainingScans} of 3 remaining
              </Typography>
            </Box>
            
            <LinearProgress 
              variant="determinate" 
              value={((3 - remainingScans) / 3) * 100}
              color={getProgressColor(remainingScans)}
              sx={{ mb: 2, height: 8, borderRadius: 4 }}
            />

            {remainingScans <= 1 && (
              <Alert 
                severity={remainingScans === 0 ? "error" : "warning"} 
                sx={{ mb: 2 }}
                icon={<Warning />}
              >
                <Typography variant="body2">
                  {remainingScans === 0 
                    ? "You've reached your scan limit! Upgrade to continue scanning." 
                    : `Only ${remainingScans} scan remaining today!`
                  }
                </Typography>
              </Alert>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {!isAuthenticated ? (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={onLoginClick}
                  >
                    Login for More Scans
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={onUpgradeClick}
                    startIcon={<Star />}
                  >
                    Upgrade Now
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  onClick={onUpgradeClick}
                  startIcon={<Star />}
                >
                  Upgrade to Unlimited
                </Button>
              )}
            </Stack>
          </Box>
        )}

        {/* Show scan count for all users */}
        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {isAuthenticated 
                              ? `Total scans today: ${scanCount}`
              : `IP-based tracking: ${scanCount} scans used`
            }
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UsageStatus; 