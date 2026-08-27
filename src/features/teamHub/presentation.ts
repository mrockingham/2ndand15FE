import type { Game } from '@/features/games/types';
import type {
  NormalizedTeamHubUrlState,
  TeamHubOverview,
} from '@/features/teamHub/types';
import type { Team } from '@/features/teams/types';

export const groupTeams = (teams: readonly Team[]) =>
  (['AFC', 'NFC'] as const).map((conference) => ({
    conference,
    divisions: (['East', 'North', 'South', 'West'] as const).map(
      (division) => ({
        division,
        teams: teams
          .filter(
            (team) =>
              team.conference === conference && team.division === division,
          )
          .sort((left, right) => left.fullName.localeCompare(right.fullName)),
      }),
    ),
  }));

export const teamGameResult = (game: Game, teamId: string) => {
  if (
    game.status !== 'FINAL' ||
    game.homeScore === null ||
    game.awayScore === null
  )
    return null;
  const teamIsHome = game.homeTeam.id === teamId;
  if (!teamIsHome && game.awayTeam.id !== teamId) return null;
  const teamScore = teamIsHome ? game.homeScore : game.awayScore;
  const opponentScore = teamIsHome ? game.awayScore : game.homeScore;
  return teamScore === opponentScore
    ? 'Tie'
    : teamScore > opponentScore
      ? 'Win'
      : 'Loss';
};

/** Approximate module count known synchronously at TeamHubPage, used only
 * to pick the adaptive grid ratio -- avoids waiting on the at-a-glance
 * queries (which would otherwise reflow the layout once they resolve). */
export const teamHubRailModuleCount = (
  overview: TeamHubOverview,
  leader: NormalizedTeamHubUrlState['leader'],
) => {
  const hasGame =
    overview.schedule.upcoming.length > 0 ||
    overview.schedule.recent.length > 0;
  const hasGlanceCandidate =
    overview.historicalData.statSeasons.length > 0 && leader !== undefined;
  return (hasGame ? 1 : 0) + (hasGlanceCandidate ? 1 : 0) + 1;
};
