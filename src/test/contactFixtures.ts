import type { ContactMessageRecord } from '@/features/contact/types';

export const contactMessageFixture: ContactMessageRecord = {
  id: 'a2c1c7d0-7c1c-4a3a-9b0c-8a7f6a4e1234',
  name: 'Fourth Down Fan',
  email: 'fan@example.com',
  subject: 'Question about game data',
  message: 'The play-by-play feed seems to be missing the fourth quarter.',
  status: 'NEW',
  createdAt: '2026-08-20T18:00:00.000Z',
  updatedAt: '2026-08-20T18:00:00.000Z',
};
