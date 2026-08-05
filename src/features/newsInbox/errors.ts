import { ApiError } from '@/services/api/apiClient';

const conflictMessages: Readonly<Record<string, string>> = {
  NEWS_SOURCE_SLUG_CONFLICT: 'A news source already uses this slug.',
  NEWS_CANDIDATE_DUPLICATE:
    'A candidate with this canonical URL already exists.',
  NEWS_CANDIDATE_STATUS_CONFLICT:
    'This candidate changed and cannot make that transition now.',
  NEWS_CANDIDATE_CONVERSION_CONFLICT:
    'The candidate changed, was already converted, has invalid teams, or the article slug is unavailable.',
  NEWS_INGESTION_ALREADY_RUNNING:
    'An ingestion run is already active for this source.',
  NEWS_SOURCE_NOT_FETCHABLE:
    'Manual-only sources cannot be tested or ingested.',
  NEWS_SOURCE_NOT_ACTIVE: 'This source is not active for ingestion.',
  NEWS_SOURCE_STATUS_CONFLICT: 'The source already has that status.',
};

export const getNewsInboxErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'The request could not be completed. Try again.';
  if (error.status === 0)
    return 'The server could not be reached. Check your connection and try again.';
  if (error.status === 403)
    return 'Your account no longer has permission for this action. Your role is being refreshed.';
  if (error.status === 404)
    return 'The requested source or candidate was not found.';
  if (error.status === 409)
    return (
      (error.code && conflictMessages[error.code]) ??
      'This request conflicts with newer or duplicate data.'
    );
  if (error.status === 413) return 'The submitted input is too large.';
  if (error.status === 429)
    return 'The ingestion rate limit was reached. Wait before trying again.';
  if (error.status === 400 || error.status === 422)
    return error.code === 'NEWS_CANDIDATE_SUMMARY_NOT_ORIGINAL'
      ? 'Write an original summary instead of copying the publisher description.'
      : 'Some submitted values are invalid. Review the form and try again.';
  return error.status >= 500
    ? 'The server could not complete the request. Try again.'
    : 'The request could not be completed.';
};
