import type {
  AddEditorialInput,
  AddHighlightInput,
  AdminEditorialPlacement,
  AdminHighlightPlacement,
  AdminTeamHomepage,
  AdminTeamHomepageMediaSource,
  CandidatePage,
  EditorialCandidate,
  ReorderPlacementsInput,
  TeamHomepageHighlightSettings,
  UpdateTeamBannerInput,
} from '@/features/teamHomepage/types';
import type { TeamHomepageBanner } from '@/features/teamHub/types';
import type { ApiClient } from '@/services/api/apiClient';

interface DataResponse<T> {
  readonly data: T;
}

const path = (teamId: string, suffix = '') =>
  `/admin/teams/${encodeURIComponent(teamId)}/homepage${suffix}`;

const candidatePath = (
  teamId: string,
  kind: 'editorial-candidates' | 'highlight-candidates',
  cursor?: string,
) => {
  const query = new URLSearchParams({ limit: '25' });
  if (cursor) query.set('cursor', cursor);
  return `${path(teamId, `/${kind}`)}?${query.toString()}`;
};

export const getAdminTeamHomepage = async (
  client: ApiClient,
  teamId: string,
  signal?: AbortSignal,
) =>
  (
    await client.request<DataResponse<AdminTeamHomepage>>(path(teamId), {
      authenticated: true,
      method: 'GET',
      signal,
    })
  ).data;

export const updateTeamHomepageBanner = async (
  client: ApiClient,
  teamId: string,
  input: UpdateTeamBannerInput,
) =>
  (
    await client.request<DataResponse<TeamHomepageBanner>>(
      path(teamId, '/banner'),
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;

export const listEditorialCandidates = async (
  client: ApiClient,
  teamId: string,
  signal?: AbortSignal,
  cursor?: string,
) =>
  (
    await client.request<DataResponse<CandidatePage<EditorialCandidate>>>(
      candidatePath(teamId, 'editorial-candidates', cursor),
      { authenticated: true, method: 'GET', signal },
    )
  ).data;

export const addEditorialPlacement = async (
  client: ApiClient,
  teamId: string,
  input: AddEditorialInput,
) =>
  (
    await client.request<DataResponse<AdminEditorialPlacement>>(
      path(teamId, '/editorial'),
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;

export const updateEditorialPlacement = async (
  client: ApiClient,
  teamId: string,
  placementId: string,
  isLeadReplacement: boolean,
) =>
  (
    await client.request<DataResponse<AdminEditorialPlacement>>(
      path(teamId, `/editorial/${encodeURIComponent(placementId)}`),
      {
        authenticated: true,
        method: 'PUT',
        body: { isLeadReplacement },
      },
    )
  ).data;

export const removeEditorialPlacement = async (
  client: ApiClient,
  teamId: string,
  placementId: string,
) =>
  client.request<void>(
    path(teamId, `/editorial/${encodeURIComponent(placementId)}`),
    { authenticated: true, method: 'DELETE' },
  );

export const reorderEditorialPlacements = async (
  client: ApiClient,
  teamId: string,
  input: ReorderPlacementsInput,
) =>
  client.request<unknown>(path(teamId, '/editorial/order'), {
    authenticated: true,
    method: 'PUT',
    body: input,
  });

export const listHighlightCandidates = async (
  client: ApiClient,
  teamId: string,
  signal?: AbortSignal,
  cursor?: string,
) =>
  (
    await client.request<
      DataResponse<
        CandidatePage<
          AdminTeamHomepageMediaSource & { readonly isSelected: boolean }
        >
      >
    >(candidatePath(teamId, 'highlight-candidates', cursor), {
      authenticated: true,
      method: 'GET',
      signal,
    })
  ).data;

export const addHighlightPlacement = async (
  client: ApiClient,
  teamId: string,
  input: AddHighlightInput,
) =>
  (
    await client.request<DataResponse<AdminHighlightPlacement>>(
      path(teamId, '/highlights'),
      { authenticated: true, method: 'POST', body: input },
    )
  ).data;

export const removeHighlightPlacement = async (
  client: ApiClient,
  teamId: string,
  placementId: string,
) =>
  client.request<void>(
    path(teamId, `/highlights/${encodeURIComponent(placementId)}`),
    { authenticated: true, method: 'DELETE' },
  );

export const reorderHighlightPlacements = async (
  client: ApiClient,
  teamId: string,
  input: ReorderPlacementsInput,
) =>
  client.request<unknown>(path(teamId, '/highlights/order'), {
    authenticated: true,
    method: 'PUT',
    body: input,
  });

export const updateTeamHighlightSettings = async (
  client: ApiClient,
  teamId: string,
  input: TeamHomepageHighlightSettings,
) =>
  (
    await client.request<DataResponse<TeamHomepageHighlightSettings>>(
      path(teamId, '/highlights/settings'),
      { authenticated: true, method: 'PUT', body: input },
    )
  ).data;
