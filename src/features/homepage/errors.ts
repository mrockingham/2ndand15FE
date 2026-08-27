import { ApiError } from '@/services/api/apiClient';

export const getHomepageErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'The homepage request could not be completed.';
  if (error.status === 404) {
    if (error.code === 'HOMEPAGE_HIGHLIGHT_SOURCE_NOT_FOUND')
      return 'That media item could not be found. It may no longer be available.';
    if (error.code === 'HOMEPAGE_HIGHLIGHT_PLACEMENT_NOT_FOUND')
      return 'This highlight was not found. It may have already been removed.';
    return 'The requested Hero slide was not found. It may have already been deleted.';
  }
  if (error.status === 403)
    return 'Your account does not have permission for this homepage action.';
  if (error.status === 409) {
    if (error.code === 'HOMEPAGE_HERO_SLIDE_LIMIT_REACHED')
      return 'The homepage Hero carousel may have at most 10 slides.';
    if (error.code === 'HOMEPAGE_TOP_STORY_LIMIT_REACHED')
      return 'The homepage may have at most 6 Top Stories.';
    if (error.code === 'HOMEPAGE_HIGHLIGHT_DUPLICATE')
      return 'This item is already curated on the homepage.';
    if (error.code === 'HOMEPAGE_HIGHLIGHT_LIMIT_REACHED')
      return 'The homepage may have at most 10 curated highlights.';
    return 'The homepage state conflicts with this action. Reload and try again.';
  }
  if (error.status === 422) {
    if (error.code === 'HOMEPAGE_HERO_SLIDE_REORDER_MISMATCH')
      return 'The reorder request must include every current Hero slide exactly once. Reload and try again.';
    if (error.code === 'HOMEPAGE_TOP_STORY_REORDER_MISMATCH')
      return 'The reorder request must include every current Top Story exactly once. Reload and try again.';
    if (error.code === 'HOMEPAGE_HIGHLIGHT_REORDER_MISMATCH')
      return 'The reorder request must include every current highlight exactly once. Reload and try again.';
    return 'Review the homepage fields and try again.';
  }
  if (error.status === 429)
    return 'Too many requests were made. Wait a moment and try again.';
  if (error.status >= 500 || error.status === 0)
    return 'The server could not complete the homepage request. Try again.';
  return 'Review the homepage fields and try again.';
};
