import { ApiError } from '@/services/api/apiClient';

const conflictMessages: Readonly<Record<string, string>> = {
  GAME_CURATED_VIDEO_LIMIT_REACHED:
    'This game already has the maximum of 4 curated videos. Remove one before adding another.',
  GAME_CURATED_VIDEO_DUPLICATE_EMBED_URL:
    'This video is already curated for this game.',
};

const validationMessages: Readonly<Record<string, string>> = {
  GAME_CURATED_VIDEO_HOST_NOT_ALLOWED:
    'This video host is not supported. Use an approved embed URL.',
  GAME_CURATED_VIDEO_INSECURE_URL: 'All video URLs must use HTTPS.',
};

export const getGameMediaErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'The request could not be completed. Try again.';
  if (error.status === 0)
    return 'The server could not be reached. Check your connection and try again.';
  if (error.status === 403)
    return 'Your account no longer has permission for this action. Your role is being refreshed.';
  if (error.status === 404) return 'The requested game or video was not found.';
  if (error.status === 409)
    return (
      (error.code && conflictMessages[error.code]) ??
      'This request conflicts with existing curated video data.'
    );
  if (error.status === 400 || error.status === 422)
    return (
      (error.code && validationMessages[error.code]) ??
      'Some submitted values are invalid. Review the form and try again.'
    );
  return error.status >= 500
    ? 'The server could not complete the request. Try again.'
    : 'The request could not be completed.';
};
