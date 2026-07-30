export interface ApiErrorDetails {
  code?: string;
  fieldErrors?: Record<string, string[]>;
  requestId?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string[]>;
  readonly requestId?: string;

  constructor(status: number, message: string, details: ApiErrorDetails = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = details.code;
    this.fieldErrors = details.fieldErrors;
    this.requestId = details.requestId;
  }
}

export interface ApiClientOptions {
  baseUrl: string;
  fetchImplementation?: typeof fetch;
  getAccessToken?: () => string | null;
}

export interface ApiRequestOptions extends Omit<
  RequestInit,
  'body' | 'credentials' | 'headers'
> {
  body?: unknown;
  headers?: HeadersInit;
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

const readFieldErrors = (
  value: unknown,
): Record<string, string[]> | undefined => {
  if (!isRecord(value)) {
    return undefined;
  }

  const entries = Object.entries(value).filter(
    (entry): entry is [string, string[]] =>
      Array.isArray(entry[1]) &&
      entry[1].every((message) => typeof message === 'string'),
  );

  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
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

  if (!isRecord(payload)) {
    return new ApiError(response.status, fallbackMessage, {
      requestId: response.headers.get('x-request-id') ?? undefined,
    });
  }

  return new ApiError(
    response.status,
    readString(payload, 'message') ?? fallbackMessage,
    {
      code: readString(payload, 'code'),
      fieldErrors: readFieldErrors(payload.fieldErrors ?? payload.errors),
      requestId:
        readString(payload, 'requestId') ??
        response.headers.get('x-request-id') ??
        undefined,
    },
  );
};

const createRequestUrl = (baseUrl: string, path: string) =>
  `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

export const createApiClient = ({
  baseUrl,
  fetchImplementation = fetch,
  getAccessToken,
}: ApiClientOptions): ApiClient => ({
  request: async <ResponseBody>(
    path: string,
    options: ApiRequestOptions = {},
  ) => {
    const { body, headers: providedHeaders, ...requestOptions } = options;
    const headers = new Headers(providedHeaders);
    const accessToken = getAccessToken?.();

    headers.set('Accept', 'application/json');
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    let requestBody: BodyInit | undefined;
    if (body !== undefined) {
      headers.set('Content-Type', 'application/json');
      requestBody = JSON.stringify(body);
    }

    const response = await fetchImplementation(
      createRequestUrl(baseUrl, path),
      {
        ...requestOptions,
        body: requestBody,
        credentials: 'include',
        headers,
      },
    );
    const payload = await readResponsePayload(response);

    if (!response.ok) {
      throw createApiError(response, payload);
    }

    return payload as ResponseBody;
  },
});
