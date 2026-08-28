export const adminTeamHomepageKeys = {
  all: ['teamHomepage', 'admin'] as const,
  team: (teamId: string) => [...adminTeamHomepageKeys.all, teamId] as const,
  detail: (teamId: string) =>
    [...adminTeamHomepageKeys.team(teamId), 'detail'] as const,
  editorialCandidates: (teamId: string) =>
    [...adminTeamHomepageKeys.team(teamId), 'editorial-candidates'] as const,
  highlightCandidates: (teamId: string) =>
    [...adminTeamHomepageKeys.team(teamId), 'highlight-candidates'] as const,
};
