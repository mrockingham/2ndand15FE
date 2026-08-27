import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Enter your name.')
    .max(100, 'Name must be 100 characters or fewer.'),
  email: z
    .string()
    .trim()
    .min(1, 'Enter your email address.')
    .max(254, 'Email must be 254 characters or fewer.')
    .email('Enter a valid email address.'),
  subject: z
    .string()
    .trim()
    .max(150, 'Subject must be 150 characters or fewer.')
    .optional(),
  message: z
    .string()
    .trim()
    .min(10, 'Message must be at least 10 characters.')
    .max(5000, 'Message must be 5000 characters or fewer.'),
  website: z.string().max(1000).optional(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
