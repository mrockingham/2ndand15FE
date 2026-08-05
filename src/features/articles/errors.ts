import { ApiError } from '@/services/api/apiClient';

export const getArticleErrorMessage = (error: unknown) => {
  if (!(error instanceof ApiError))
    return 'The article request could not be completed.';
  if (error.status === 404) return 'The requested article was not found.';
  if (error.status === 403)
    return 'Your account does not have permission for this editorial action.';
  if (error.status === 409) {
    if (error.code === 'ARTICLE_VERSION_CONFLICT')
      return 'Another editor changed this article. Your unsaved content is still here; reload the latest version before saving again.';
    if (error.code === 'ARTICLE_SLUG_CONFLICT')
      return 'Another article already uses this slug. Choose a different slug.';
    if (error.code === 'PUBLISHED_ARTICLE_SLUG_IMMUTABLE')
      return 'A published article slug cannot be changed.';
    return 'The article state conflicts with this action. Reload the latest version and review it.';
  }
  if (error.status === 429)
    return 'Too many requests were made. Wait a moment and try again.';
  if (error.status >= 500 || error.status === 0)
    return 'The server could not complete the article request. Try again.';
  return 'Review the article fields and try again.';
};
