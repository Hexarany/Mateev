import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Button,
  Divider,
  Chip,
  Grid,
} from '@mui/material'
import {
  VerifiedUser as VerifiedIcon,
  Error as ErrorIcon,
  CheckCircle as CheckIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Fingerprint as FingerprintIcon,
  WorkspacePremium as CertificateIcon,
} from '@mui/icons-material'
import api from '@/services/api'

interface VerifiedCertificate {
  certificateNumber: string
  certificateType: string
  title: { ru: string; ro: string }
  issuedAt: string
  recipientName: string
  credentialId: string
  institution: string
}

export default function CertificateVerifyPage() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [valid, setValid] = useState(false)
  const [certificate, setCertificate] = useState<VerifiedCertificate | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (certificateNumber) {
      verifyCertificate()
    } else {
      setError('Invalid certificate number')
      setLoading(false)
    }
  }, [certificateNumber])

  const verifyCertificate = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/certificates/verify/${certificateNumber}`)
      setValid(response.data.valid)
      if (response.data.valid) {
        setCertificate(response.data.certificate)
      } else {
        setError(response.data.message || 'Certificate not found')
      }
    } catch (err: any) {
      console.error('Error verifying certificate:', err)
      setValid(false)
      setError(err.response?.data?.message || 'Certificate not found or invalid')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    )
  }

  if (!valid || error) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px solid',
            borderColor: (theme) => theme.palette.error.main,
          }}
        >
          <ErrorIcon sx={{ fontSize: 80, color: (theme) => theme.palette.error.main, mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight={600} color="error.main">
            Invalid Certificate
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            {error || 'The certificate number you provided could not be verified.'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Certificate Number: <strong>{certificateNumber}</strong>
          </Typography>
          <Button variant="outlined" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Paper>
      </Container>
    )
  }

  if (!certificate) return null

  const formattedDate = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Success Badge */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 100,
            height: 100,
            borderRadius: '50%',
            bgcolor: 'success.light',
            mb: 2,
          }}
        >
          <VerifiedIcon sx={{ fontSize: 60, color: 'success.dark' }} />
        </Box>
        <Typography variant="h4" gutterBottom fontWeight={700} color="success.dark">
          Verified Certificate
        </Typography>
        <Typography variant="body1" color="textSecondary">
          This certificate has been verified and is authentic
        </Typography>
      </Box>

      {/* Certificate Details */}
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, md: 4 },
          border: '3px solid',
          borderColor: (theme) => theme.palette.success.main,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            background: 'radial-gradient(circle, rgba(46, 125, 50, 0.1) 0%, transparent 70%)',
            borderRadius: '50%',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Certificate Icon and Type */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <CertificateIcon sx={{ fontSize: 48, color: (theme) => theme.palette.primary.main, mr: 2 }} />
            <Box>
              <Typography variant="h5" fontWeight={700}>
                {certificate.title.ru}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {certificate.title.ro}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Details Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <PersonIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Recipient
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {certificate.recipientName}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <CalendarIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Issued On
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formattedDate}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <BusinessIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Institution
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {certificate.institution}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <FingerprintIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Certificate Number
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {certificate.certificateNumber}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <FingerprintIcon sx={{ color: 'text.secondary', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    Credential ID
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                    }}
                  >
                    {certificate.credentialId}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Verification Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              p: 2,
              bgcolor: 'success.50',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'success.light',
            }}
          >
            <CheckIcon sx={{ color: 'success.dark' }} />
            <Typography variant="body2" fontWeight={600} color="success.dark">
              This certificate is valid and has been verified by Anatomia Study Platform
            </Typography>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Return to Home
            </Button>
            <Button variant="contained" onClick={() => window.print()}>
              Print Verification
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Additional Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Typography variant="body2">
          <strong>Note:</strong> This page verifies the authenticity of certificates issued by
          Anatomia Study Platform. Anyone can verify a certificate by entering its certificate
          number.
        </Typography>
      </Alert>
    </Container>
  )
}
