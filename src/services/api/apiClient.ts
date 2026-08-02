export interface ValidationDetail {
  readonly field: string;
  readonly message: string;
}

export interface ApiErrorDetails {
  readonly code?: string;
  readonly details?: unknown;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly requestId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
  readonly requestId?: string;

  constructor(status: number, message: string, details: ApiErrorDetails = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = details.code;
    this.details = details.details;
    this.fieldErrors = details.fieldErrors;
    this.requestId = details.requestId;
  }
}

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly fetchImplementation?: typeof fetch;
  readonly getAccessToken?: () => string | null;
  readonly refreshAccessToken?: () => Promise<string>;
  readonly onAuthenticationFailure?: () => void;
}

export interface ApiRequestOptions extends Omit<
  RequestInit,
  'body' | 'credentials' | 'headers'
> {
  readonly authenticated?: boolean;
  readonly body?: unknown;
  readonly headers?: HeadersInit;
}

export interface ApiClient {
  request: <ResponseBody = void>(
    path: string,
    options?: ApiRequestOptions,
  ) => Promise<ResponseBody>;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readString = (
  record: Record<string, unknown>,
  key: string,
): string | undefined => {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
};

const readValidationDetails = (value: unknown): readonly ValidationDetail[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is ValidationDetail =>
      isRecord(item) &&
      typeof item.field === 'string' &&
      typeof item.message === 'string',
  );
};

const groupFieldErrors = (
  details: readonly ValidationDetail[],
): Readonly<Record<string, readonly string[]>> | undefined => {
  if (details.length === 0) {
    return undefined;
  }

  const grouped: Record<string, string[]> = {};
  for (const detail of details) {
    grouped[detail.field] = [...(grouped[detail.field] ?? []), detail.message];
  }
  return grouped;
};

const readResponsePayload = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (text.length === 0) {
    return undefined;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return text;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const createApiError = (response: Response, payload: unknown) => {
  const fallbackMessage = `Request failed with status ${response.status}.`;
  const errorBody =
    isRecord(payload) && isRecord(payload.error) ? payload.error : null;

  if (errorBody === null) {
    return new ApiError(response.status, fallbackMessage, {
      requestId: response.headers.get('x-request-id') ?? undefined,
    });
  }

  const details = errorBody.details;
  return new ApiError(
    response.status,
    readString(errorBody, 'message') ?? fallbackMessage,
    {
      code: readString(errorBody, 'code'),
      details,
      fieldErrors: groupFieldErrors(readValidationDetails(details)),
      requestId:
        readString(errorBody, 'requestId') ??
        response.headers.get('x-request-id') ??
        undefined,
    },
  );
};

const createNetworkError = () =>
  new ApiError(
    0,
    'Unable to reach the server. Check your connection and try again.',
    {
      code: 'NETWORK_ERROR',
    },
  );

const createRequestUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

const isAbortError = (error: unknown) =>
  error instanceof DOMException && error.name === 'AbortError';

export const createApiClient = ({
  baseUrl,
  fetchImplementation = fetch,
  getAccessToken,
  refreshAccessToken,
  onAuthenticationFailure,
}: ApiClientOptions): ApiClient => {
  let activeRefresh: Promise<string> | null = null;

  const getSharedRefresh = () => {
    if (refreshAccessToken === undefined) {
      return Promise.reject(
        new ApiError(401, 'Authentication is required.', {
          code: 'UNAUTHORIZED',
        }),
      );
    }

    activeRefresh ??= refreshAccessToken().finally(() => {
      activeRefresh = null;
    });
    return activeRefresh;
  };

  const execute = async <ResponseBody>(
    path: string,
    options: ApiRequestOptions,
    hasRetried: boolean,
  ): Promise<ResponseBody> => {
    const {
      authenticated = false,
      body,
      headers: providedHeaders,
      ...requestOptions
    } = options;
    const headers = new Headers(providedHeaders);
    const accessToken = authenticated ? getAccessToken?.() : null;

    headers.set('Accept', 'application/json');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      headers.set('Content-Type', 'application/json');
      requestBody = JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetchImplementation(createRequestUrl(baseUrl, path), {
        ...requestOptions,
        body: requestBody,
        credentials: 'include',
        headers,
      });
    } catch (error: unknown) {
      if (isAbortError(error)) {
        throw error;
      }
      throw createNetworkError();
    }

    const payload = await readResponsePayload(response);
    if (response.ok) {
      return payload as ResponseBody;
    }

    const apiError = createApiError(response, payload);
    if (response.status !== 401 || !authenticated) {
      throw apiError;
    }

    if (hasRetried) {
      onAuthenticationFailure?.();
      throw apiError;
    }

    try {
      await getSharedRefresh();
    } catch (refreshError: unknown) {
      onAuthenticationFailure?.();
      throw refreshError;
    }

    return execute<ResponseBody>(path, options, true);
  };

  return {
    request: <ResponseBody>(path: string, options: ApiRequestOptions = {}) =>
      execute<ResponseBody>(path, options, false),
  };
};
