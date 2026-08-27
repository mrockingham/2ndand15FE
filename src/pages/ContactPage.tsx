import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink } from 'react-router-dom';

import { FormSubmitButton } from '@/features/auth/components/FormSubmitButton';
import { getContactErrorMessage } from '@/features/contact/errorMessages';
import { useSubmitContactMessageMutation } from '@/features/contact/queries';
import {
  contactFormSchema,
  type ContactFormValues,
} from '@/features/contact/schemas';
import { ApiError } from '@/services/api/apiClient';

export const ContactPage = () => {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const {
    handleSubmit,
    register,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
      website: '',
    },
  });
  const mutation = useSubmitContactMessageMutation();

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError(null);
    try {
      const response = await mutation.mutateAsync(values);
      setSuccessMessage(response.message);
    } catch (error: unknown) {
      if (error instanceof ApiError && error.fieldErrors !== undefined) {
        for (const field of ['name', 'email', 'subject', 'message'] as const) {
          const message = error.fieldErrors[field]?.[0];
          if (message !== undefined)
            setError(field, { type: 'server', message });
        }
      }
      setSubmissionError(getContactErrorMessage(error));
    }
  });

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 5, sm: 7, md: 9 } }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="overline" color="primary.light">
            CONTACT 2ND & 15
          </Typography>
          <Typography variant="h2" component="h1" sx={{ mt: 1, mb: 2 }}>
            Get in touch
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ fontWeight: 450 }}
          >
            Have feedback, found a problem, or want to get in touch? Send us a
            message.
          </Typography>
        </Box>
        <Card sx={{ p: { xs: 3, sm: 4 } }}>
          {successMessage === null ? (
            <Stack
              component="form"
              noValidate
              spacing={2.25}
              onSubmit={onSubmit}
            >
              {submissionError === null ? null : (
                <Alert severity="error" aria-live="polite">
                  {submissionError}
                </Alert>
              )}
              <TextField
                {...register('name')}
                fullWidth
                autoComplete="name"
                disabled={mutation.isPending}
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                label="Name"
                id="contact-name"
                slotProps={{
                  formHelperText: { id: 'contact-name-helper' },
                  htmlInput: {
                    'aria-describedby': errors.name
                      ? 'contact-name-helper'
                      : undefined,
                  },
                }}
              />
              <TextField
                {...register('email')}
                fullWidth
                autoComplete="email"
                disabled={mutation.isPending}
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
                inputMode="email"
                label="Email"
                id="contact-email"
                slotProps={{
                  formHelperText: { id: 'contact-email-helper' },
                  htmlInput: {
                    'aria-describedby': errors.email
                      ? 'contact-email-helper'
                      : undefined,
                  },
                }}
              />
              <TextField
                {...register('subject')}
                fullWidth
                disabled={mutation.isPending}
                error={Boolean(errors.subject)}
                helperText={errors.subject?.message}
                label="Subject"
                id="contact-subject"
                slotProps={{
                  formHelperText: { id: 'contact-subject-helper' },
                  htmlInput: {
                    'aria-describedby': errors.subject
                      ? 'contact-subject-helper'
                      : undefined,
                  },
                }}
              />
              <TextField
                {...register('message')}
                fullWidth
                multiline
                minRows={5}
                disabled={mutation.isPending}
                error={Boolean(errors.message)}
                helperText={errors.message?.message}
                label="Message"
                id="contact-message"
                slotProps={{
                  formHelperText: { id: 'contact-message-helper' },
                  htmlInput: {
                    'aria-describedby': errors.message
                      ? 'contact-message-helper'
                      : undefined,
                  },
                }}
              />
              <Box
                aria-hidden="true"
                sx={{
                  position: 'absolute',
                  width: 1,
                  height: 1,
                  overflow: 'hidden',
                  left: -9999,
                }}
              >
                <TextField
                  {...register('website')}
                  tabIndex={-1}
                  autoComplete="off"
                  label=""
                />
              </Box>
              <FormSubmitButton
                isPending={mutation.isPending}
                pendingLabel="Sending…"
                size="large"
              >
                Send message
              </FormSubmitButton>
            </Stack>
          ) : (
            <Stack
              spacing={2.5}
              aria-live="polite"
              sx={{ alignItems: 'center', textAlign: 'center' }}
            >
              <CheckCircleRounded color="success" sx={{ fontSize: 54 }} />
              <Typography variant="h5">Message sent</Typography>
              <Typography color="text.secondary">
                Thanks for reaching out. Your message has been received.
              </Typography>
              <Button
                component={RouterLink}
                to="/"
                variant="contained"
                fullWidth
              >
                Back to home
              </Button>
            </Stack>
          )}
        </Card>
      </Stack>
    </Container>
  );
};
