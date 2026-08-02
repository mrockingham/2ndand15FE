import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Link, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import { register } from '@/features/auth/api';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { FormSubmitButton } from '@/features/auth/components/FormSubmitButton';
import { PasswordField } from '@/features/auth/components/PasswordField';
import {
  applyApiFieldErrors,
  getAuthErrorMessage,
} from '@/features/auth/errorMessages';
import { getPostAuthenticationNavigation } from '@/features/auth/postAuthenticationNavigation';
import {
  registerFormSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas';
import { establishSession } from '@/features/auth/session';
import { useApiClients } from '@/services/api/useApiClients';

export const RegisterPage = () => {
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
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      confirmPassword: '',
      displayName: '',
      email: '',
      password: '',
    },
  });
  const registerMutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      register(publicClient, {
        email: values.email,
        password: values.password,
        displayName: values.displayName.length > 0 ? values.displayName : null,
      }),
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    try {
      const session = await registerMutation.mutateAsync(values);
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
      applyApiFieldErrors(error, setError, [
        'email',
        'displayName',
        'password',
      ]);
      setSubmissionError(getAuthErrorMessage(error, 'register'));
    }
  });

  return (
    <AuthPageShell
      eyebrow="JOIN THE HUDDLE"
      title="Create your account"
      description="Set up the secure foundation for personalized NFL coverage."
      footer={
        <Typography sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" state={location.state}>
            Sign in
          </Link>
        </Typography>
      }
    >
      <Stack component="form" noValidate spacing={2.1} onSubmit={onSubmit}>
        {submissionError === null ? null : (
          <Alert severity="error" aria-live="polite">
            {submissionError}
          </Alert>
        )}
        <TextField
          {...registerField('email')}
          fullWidth
          autoComplete="email"
          disabled={registerMutation.isPending}
          error={Boolean(errors.email)}
          helperText={errors.email?.message}
          inputMode="email"
          label="Email"
        />
        <TextField
          {...registerField('displayName')}
          fullWidth
          autoComplete="nickname"
          disabled={registerMutation.isPending}
          error={Boolean(errors.displayName)}
          helperText={
            errors.displayName?.message ?? 'Optional · up to 80 characters'
          }
          label="Display name"
        />
        <PasswordField
          autoComplete="new-password"
          control={control}
          disabled={registerMutation.isPending}
          label="Password"
          name="password"
          textFieldProps={{ helperText: 'Use 12–128 characters.' }}
        />
        <PasswordField
          autoComplete="new-password"
          control={control}
          disabled={registerMutation.isPending}
          label="Confirm password"
          name="confirmPassword"
        />
        <FormSubmitButton
          isPending={registerMutation.isPending}
          pendingLabel="Creating account…"
          size="large"
        >
          Create account
        </FormSubmitButton>
      </Stack>
    </AuthPageShell>
  );
};
