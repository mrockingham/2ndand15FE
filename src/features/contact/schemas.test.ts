import { contactFormSchema } from '@/features/contact/schemas';

describe('contact form schema', () => {
  it('accepts a valid submission without a subject', () => {
    const result = contactFormSchema.safeParse({
      name: 'Fourth Down Fan',
      email: 'fan@example.com',
      message: 'The play-by-play feed seems to be missing plays.',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a message shorter than the backend minimum', () => {
    const result = contactFormSchema.safeParse({
      name: 'Fourth Down Fan',
      email: 'fan@example.com',
      message: 'too short',
    });

    expect(result.success).toBe(false);
  });

  it('rejects a name longer than 100 characters', () => {
    const result = contactFormSchema.safeParse({
      name: 'a'.repeat(101),
      email: 'fan@example.com',
      message: 'The play-by-play feed seems to be missing plays.',
    });

    expect(result.success).toBe(false);
  });
});
