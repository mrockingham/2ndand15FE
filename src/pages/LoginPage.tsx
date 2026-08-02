import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Link, Stack, TextField } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { login } from '@/features/auth/api';
import {
  applyApiFieldErrors,
  getAuthErrorMessage,
} from '@/features/auth/errorMessages';
import { getPostAuthenticationNavigation } from '@/features/auth/postAuthenticationNavigation';
import { loginFormSchema, type LoginFormValues } from '@/features/auth/schemas';
import { establishSession } from '@/features/auth/session';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { FormSubmitButton } from '@/features/auth/components/FormSubmitButton';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { useApiClients } from '@/services/api/useApiClients';

export const LoginPage = () => {
  const { publicClient } = useApiClients();
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    register: registerField,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });
  const loginMutation = useMutation({
    mutationFn: (values: LoginFormValues) => login(publicClient, values),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    try {
      const session = await loginMutation.mutateAsync(values);
      establishSession(queryClient, session);
      const destination = getPostAuthenticationNavigation(
        session.user,
        location.state,
      );
      await navigate(destination.pathname, {
        replace: true,
        state: destination.state,
      });
    } catch (error: unknown) {
      applyApiFieldErrors(error, setError, ['email', 'password']);
      setSubmissionError(getAuthErrorMessage(error, 'login'));
    }
  });

  return (
    <AuthPageShell
      eyebrow="WELCOME BACK"
      title="Sign in to your huddle"
      description="Restore your personalized 2nd & 15 experience securely."
      footer={
        <Stack spacing={1.25} sx={{ alignItems: 'center' }}>
          <Link component={RouterLink} to="/forgot-password">
            Forgot your password?
          </Link>
          <span>
            New to 2nd &amp; 15?{' '}
            <Link component={RouterLink} to="/register" state={location.state}>
              Create an account
            </Link>
          </span>
        </Stack>
      }
    >
      <Stack component="form" noValidate spacing={2.25} onSubmit={onSubmit}>
        {submissionError === null ? null : (
          <Alert severity="error" aria-live="polite">
            {submissionError}
          </Alert>
        )}
        <TextField
          {...registerField('email')}
          fullWidth
          autoComplete="email"
          disabled={loginMutation.isPending}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          inputMode="email"
          label="Email"
        />
        <PasswordField
          autoComplete="current-password"
          control={control}
          disabled={loginMutation.isPending}
          label="Password"
          name="password"
        />
        <FormSubmitButton
          isPending={loginMutation.isPending}
          pendingLabel="Signing in…"
          size="large"
        >
          Sign in
        </FormSubmitButton>
      </Stack>
    </AuthPageShell>
  );
};
