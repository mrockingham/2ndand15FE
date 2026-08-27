import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import LinkOffRounded from '@mui/icons-material/LinkOffRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Button, Link, Stack, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';

import { resetPassword } from '@/features/auth/api';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { FormSubmitButton } from '@/features/auth/components/FormSubmitButton';
import { PasswordField } from '@/features/auth/components/PasswordField';
import {
  applyApiFieldErrors,
  getAuthErrorMessage,
} from '@/features/auth/errorMessages';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '@/features/auth/schemas';
import { clearAuthentication } from '@/features/auth/session';
import { useApiClients } from '@/services/api/useApiClients';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const tokenHasValidShape =
    token !== null && token.length >= 32 && token.length <= 512;
  const { publicClient } = useApiClients();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const { control, handleSubmit, setError } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { confirmPassword: '', password: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword(publicClient, {
        token: token as string,
        password: values.password,
      }),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    try {
      const response = await mutation.mutateAsync(values);
      clearAuthentication(queryClient);
      window.history.replaceState(window.history.state, '', '/reset-password');
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      applyApiFieldErrors(error, setError, ['password']);
      setSubmissionError(getAuthErrorMessage(error, 'reset'));
    }
  });

  if (!tokenHasValidShape) {
    return (
      <AuthPageShell
        eyebrow="INVALID RESET LINK"
        title="Request a fresh link"
        description="This password reset link is missing its secure token or is malformed."
      >
        <Stack spacing={2.5} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <LinkOffRounded color="error" sx={{ fontSize: 54 }} />
          <Button
            component={RouterLink}
            to="/forgot-password"
            variant="contained"
            fullWidth
          >
            Request another reset
          </Button>
          <Button component={RouterLink} to="/login" variant="text">
            Back to sign in
          </Button>
        </Stack>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      eyebrow="SECURE PASSWORD RESET"
      title={
        successMessage === null ? 'Choose a new password' : 'Password updated'
      }
      description={
        successMessage === null
          ? 'Set a new password for your account. Every existing session will be signed out.'
          : 'Your old sessions have been revoked. Sign in again with your new password.'
      }
      footer={
        successMessage === null ? (
          <Typography sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login">
              Back to sign in
            </Link>
          </Typography>
        ) : undefined
      }
    >
      {successMessage === null ? (
        <Stack component="form" noValidate spacing={2.25} onSubmit={onSubmit}>
          {submissionError === null ? null : (
            <Alert severity="error" aria-live="polite">
              {submissionError}
            </Alert>
          )}
          <PasswordField
            autoComplete="new-password"
            control={control}
            disabled={mutation.isPending}
            label="New password"
            name="password"
            textFieldProps={{ helperText: 'Use 12–128 characters.' }}
          />
          <PasswordField
            autoComplete="new-password"
            control={control}
            disabled={mutation.isPending}
            label="Confirm new password"
            name="confirmPassword"
          />
          <FormSubmitButton
            isPending={mutation.isPending}
            pendingLabel="Updating password…"
            size="large"
          >
            Reset password
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
            Sign in again
          </Button>
        </Stack>
      )}
    </AuthPageShell>
  );
};
