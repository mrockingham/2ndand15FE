import type { PublicArticleListItem } from '@/features/articles/types';
import type { Game } from '@/features/games/types';
import type { PlayerAttribution } from '@/features/players/types';
import type {
  LeaderboardFilters,
  LeaderboardPage,
  NormalizedStatsUrlState,
  SeasonLeader,
} from '@/features/statsHub/types';
import type { Team } from '@/features/teams/types';

export interface TeamHubOverview {
  readonly team: Team;
  readonly schedule: {
    readonly season: number;
    readonly upcoming: readonly Game[];
    readonly recent: readonly Game[];
  };
  readonly news: { readonly articles: readonly PublicArticleListItem[] };
  readonly historicalData: {
    readonly defaultSeason: number | null;
    readonly rosterSeasons: readonly number[];
    readonly statSeasons: readonly number[];
    readonly positions: readonly string[];
    readonly positionGroups: readonly string[];
    readonly coverageNotes: readonly string[];
  };
}

export interface TeamHubResult {
  readonly overview: TeamHubOverview;
  readonly attribution: PlayerAttribution;
}

export interface TeamRosterFilters {
  readonly season: number;
  readonly position?: string;
  readonly positionGroup?: string;
  readonly search?: string;
  readonly limit: number;
}

export interface TeamRosterRow {
  readonly player: {
    readonly id: string;
    readonly displayName: string;
    readonly headshotUrl: string | null;
  };
  readonly season: number;
  readonly historicalTeam: {
    readonly id: string;
    readonly abbreviation: string;
    readonly fullName: string;
  };
  readonly latestKnownTeam: {
    readonly id: string;
    readonly abbreviation: string;
    readonly fullName: string;
  } | null;
  readonly position: string | null;
  readonly positionGroup: string | null;
  readonly jerseyNumber: number | null;
  readonly status: string | null;
  readonly firstWeek: number;
  readonly lastWeek: number;
  readonly rosterWeekCount: number;
}

export interface TeamRosterPage {
  readonly team: Team;
  readonly season: number;
  readonly roster: readonly TeamRosterRow[];
  readonly nextCursor: string | null;
  readonly semantics: {
    readonly membership: string;
    readonly firstWeek: string;
    readonly lastWeek: string;
    readonly latestKnownTeam: string;
  };
  readonly attribution: PlayerAttribution;
}

export type TeamLeaderFilters = Omit<LeaderboardFilters, 'teamId' | 'week'>;
export type TeamLeaderPage = LeaderboardPage<SeasonLeader>;

export interface NormalizedTeamHubUrlState {
  readonly rosterSeason?: number;
  readonly rosterPosition?: string;
  readonly rosterPositionGroup?: string;
  readonly rosterSearch?: string;
  readonly leader?: Pick<
    NormalizedStatsUrlState,
    | 'season'
    | 'seasonType'
    | 'category'
    | 'metric'
    | 'position'
    | 'positionGroup'
  >;
}
