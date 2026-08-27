import type { Game } from '@/features/games/types';
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
