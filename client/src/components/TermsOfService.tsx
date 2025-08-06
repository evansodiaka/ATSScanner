import React from "react";
import { Container, Typography, Box, Paper, Divider } from "@mui/material";

const TermsOfService: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Terms of Service
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" gutterBottom>
          Last updated: {new Date().toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ "& > *": { mb: 3 } }}>
          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              1. Acceptance of Terms
            </Typography>
            <Typography variant="body1" paragraph>
              By accessing and using Resumatrix ("Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these Terms of Service, you should 
              not use this Service.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              2. Description of Service
            </Typography>
            <Typography variant="body1" paragraph>
              Resumatrix is an AI-powered resume analysis and optimization platform that helps users:
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1">Analyze resumes for ATS (Applicant Tracking System) compatibility</Typography>
              <Typography component="li" variant="body1">Provide AI-powered feedback and suggestions</Typography>
              <Typography component="li" variant="body1">Generate optimized resume versions</Typography>
              <Typography component="li" variant="body1">Track usage and provide analytics</Typography>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              3. User Accounts and Registration
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Account Creation:</strong> You must create an account to use our Service. You may register 
              using Google Sign-In or other provided authentication methods.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Account Security:</strong> You are responsible for safeguarding your account credentials 
              and all activities that occur under your account.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Accurate Information:</strong> You agree to provide accurate, current, and complete 
              information during registration and to update such information as necessary.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              4. Subscription Plans and Billing
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Free Tier:</strong> Limited access to basic features with usage restrictions.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Paid Subscriptions:</strong> Premium features require a paid subscription. Billing is 
              processed through Stripe and is subject to their terms and conditions.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Billing Cycle:</strong> Subscriptions are billed monthly or annually based on your selection. 
              Charges are non-refundable except as required by law.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Cancellation:</strong> You may cancel your subscription at any time. Cancellation will 
              take effect at the end of your current billing period.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              5. Acceptable Use Policy
            </Typography>
            <Typography variant="body1" paragraph>
              You agree not to:
            </Typography>
            <Typography component="ul" sx={{ pl: 2 }}>
              <Typography component="li" variant="body1">Use the Service for any illegal or unauthorized purpose</Typography>
              <Typography component="li" variant="body1">Upload malicious files, viruses, or harmful content</Typography>
              <Typography component="li" variant="body1">Attempt to gain unauthorized access to the Service</Typography>
              <Typography component="li" variant="body1">Share your account credentials with others</Typography>
              <Typography component="li" variant="body1">Reverse engineer or attempt to extract source code</Typography>
              <Typography component="li" variant="body1">Use the Service to spam or send unsolicited communications</Typography>
              <Typography component="li" variant="body1">Violate any applicable laws or regulations</Typography>
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              6. Intellectual Property Rights
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Service Content:</strong> The Service and its original content, features, and functionality 
              are owned by Resumatrix and are protected by international copyright, trademark, patent, trade 
              secret, and other intellectual property laws.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>User Content:</strong> You retain ownership of your resume content and data. By using 
              our Service, you grant us a limited license to process, analyze, and store your content for 
              the purpose of providing our services.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>AI-Generated Content:</strong> Analysis results and suggestions generated by our AI 
              are provided as-is and may be used by you without restriction.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              7. Privacy and Data Protection
            </Typography>
            <Typography variant="body1" paragraph>
              Your privacy is important to us. Our collection and use of personal information is governed 
              by our Privacy Policy, which is incorporated into these Terms by reference.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              8. Service Availability and Modifications
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Availability:</strong> We strive to maintain high availability but do not guarantee 
              uninterrupted access to the Service. Maintenance, updates, or technical issues may cause 
              temporary service disruptions.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Modifications:</strong> We reserve the right to modify, suspend, or discontinue any 
              part of the Service at any time with reasonable notice.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              9. Disclaimers and Limitation of Liability
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Service Disclaimer:</strong> The Service is provided "as is" without warranties of any 
              kind. We do not guarantee the accuracy, completeness, or effectiveness of resume analysis or suggestions.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Career Outcomes:</strong> We do not guarantee job interviews, employment, or career 
              advancement as a result of using our Service.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Limitation of Liability:</strong> To the maximum extent permitted by law, Resumatrix 
              shall not be liable for any indirect, incidental, special, consequential, or punitive damages.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              10. Indemnification
            </Typography>
            <Typography variant="body1" paragraph>
              You agree to indemnify and hold Resumatrix harmless from any claims, damages, or expenses 
              arising from your use of the Service or violation of these Terms.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              11. Termination
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Termination by You:</strong> You may terminate your account at any time by contacting us 
              or using account deletion features.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Termination by Us:</strong> We may terminate or suspend your account for violations of 
              these Terms, illegal activity, or other reasonable causes.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Effect of Termination:</strong> Upon termination, your access to the Service will cease, 
              and we may delete your data in accordance with our Privacy Policy.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              12. Governing Law and Dispute Resolution
            </Typography>
            <Typography variant="body1" paragraph>
              These Terms are governed by the laws of Manitoba, Canada. Any disputes shall be resolved 
              through binding arbitration or in the courts of Manitoba, Canada.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              13. Changes to Terms
            </Typography>
            <Typography variant="body1" paragraph>
              We reserve the right to modify these Terms at any time. We will notify users of material 
              changes via email or through the Service. Continued use after changes constitutes acceptance 
              of the new Terms.
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              14. Contact Information
            </Typography>
            <Typography variant="body1" paragraph>
              For questions about these Terms of Service, please contact us at:
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Email:</strong> legal@resumatrix.co<br />
              <strong>Website:</strong> https://resumatrix.co<br />
              <strong>Address:</strong> Winnipeg, MB, Canada
            </Typography>
          </Box>

          <Box>
            <Typography variant="h5" component="h2" gutterBottom>
              15. Severability
            </Typography>
            <Typography variant="body1" paragraph>
              If any provision of these Terms is found to be unenforceable, the remaining provisions will 
              remain in full force and effect.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;