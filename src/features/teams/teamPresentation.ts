import type { ConferenceFilter, Team } from '@/features/teams/types';

const hexColorPattern = /^#[0-9a-f]{6}$/i;

export const safeTeamColor = (value: string, fallback: string) =>
  hexColorPattern.test(value) ? value : fallback;

export const filterTeams = (
  teams: readonly Team[],
  search: string,
  conference: ConferenceFilter,
) => {
  const normalizedSearch = search.trim().toLocaleLowerCase();

  return teams.filter((team) => {
    const matchesConference =
      conference === 'ALL' || team.conference === conference;
    const matchesSearch =
      normalizedSearch.length === 0 ||
      [team.city, team.name, team.fullName, team.abbreviation].some((value) =>
        value.toLocaleLowerCase().includes(normalizedSearch),
      );
    return matchesConference && matchesSearch;
  });
};
