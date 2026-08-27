import { ApiError } from '@/services/api/apiClient';

export const getContactErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return "We couldn't send your message right now. Please try again.";
  if (error.status === 0)
    return 'The server could not be reached. Check your connection and try again.';
  if (error.status === 429)
    return "You've sent several messages recently. Please try again later.";
  if (error.status === 400 || error.status === 422)
    return 'Check the highlighted fields and try again.';
  return "We couldn't send your message right now. Please try again.";
};
