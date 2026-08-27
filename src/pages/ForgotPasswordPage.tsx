import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import MailLockRounded from '@mui/icons-material/MailLockRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

import { forgotPassword } from '@/features/auth/api';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { FormSubmitButton } from '@/features/auth/components/FormSubmitButton';
import {
  applyApiFieldErrors,
  getAuthErrorMessage,
} from '@/features/auth/errorMessages';
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormValues,
} from '@/features/auth/schemas';
import { readAppEnvironment } from '@/services/api/environment';
import { useApiClients } from '@/services/api/useApiClients';

export const ForgotPasswordPage = () => {
  const { publicClient } = useApiClients();
  const { passwordRecoveryEnabled } = readAppEnvironment(import.meta.env);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordFormValues) =>
      forgotPassword(publicClient, values),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    try {
      const response = await mutation.mutateAsync(values);
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      applyApiFieldErrors(error, setError, ['email']);
      setSubmissionError(getAuthErrorMessage(error, 'forgot'));
    }
  });

  if (!passwordRecoveryEnabled) {
    return (
      <AuthPageShell
        eyebrow="ACCOUNT RECOVERY"
        title="Password recovery is temporarily unavailable"
        description="We're unable to send reset emails right now. Please contact support if you need help accessing your account."
        footer={
          <Typography sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login">
              Back to sign in
            </Link>
          </Typography>
        }
      >
        <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <MailLockRounded color="disabled" sx={{ fontSize: 54 }} />
          <Typography color="text.secondary">
            Password reset by email isn't available yet. Check back soon, or
            reach out through the{' '}
            <Link component={RouterLink} to="/contact">
              contact page
            </Link>
            .
          </Typography>
        </Stack>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      eyebrow="ACCOUNT RECOVERY"
      title={
        successMessage === null ? 'Reset your password' : 'Check your inbox'
      }
      description={
        successMessage === null
          ? 'Enter your email and we’ll request secure reset instructions.'
          : 'For privacy, the response is the same whether or not an account exists.'
      }
      footer={
        <Typography sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/login">
            Back to sign in
          </Link>
        </Typography>
      }
    >
      {successMessage === null ? (
        <Stack component="form" noValidate spacing={2.25} onSubmit={onSubmit}>
          {submissionError === null ? null : (
            <Alert severity="error" aria-live="polite">
              {submissionError}
            </Alert>
          )}
          <TextField
            {...register('email')}
            fullWidth
            autoComplete="email"
            disabled={mutation.isPending}
            error={Boolean(errors.email)}
            helperText={errors.email?.message}
            inputMode="email"
            label="Email"
          />
          <FormSubmitButton
            isPending={mutation.isPending}
            pendingLabel="Requesting reset…"
            size="large"
          >
            Send reset instructions
          </FormSubmitButton>
        </Stack>
      ) : (
        <Stack
          spacing={2.5}
          aria-live="polite"
          sx={{ alignItems: 'center', textAlign: 'center' }}
        >
          <CheckCircleRounded color="success" sx={{ fontSize: 54 }} />
          <Typography>{successMessage}</Typography>
          <Button
            component={RouterLink}
            to="/login"
            variant="contained"
            fullWidth
          >
            Return to sign in
          </Button>
        </Stack>
      )}
    </AuthPageShell>
  );
};
