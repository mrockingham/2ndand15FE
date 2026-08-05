export type SeasonType = 'PRE' | 'REG' | 'POST';

export type GameStatus =
  | 'SCHEDULED'
  | 'PREGAME'
  | 'IN_PROGRESS'
  | 'HALFTIME'
  | 'FINAL'
  | 'POSTPONED'
  | 'CANCELED'
  | 'SUSPENDED';

export interface GameTeam {
  readonly id: string;
  readonly fullName: string;
  readonly abbreviation: string;
  readonly logoUrl: string | null;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface Game {
  readonly id: string;
  readonly league: 'NFL';
  readonly season: number;
  readonly seasonType: SeasonType;
  readonly week: number | null;
  readonly startTime: string | null;
  readonly status: GameStatus;
  readonly homeTeam: GameTeam;
  readonly awayTeam: GameTeam;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly quarter: number | null;
  readonly clock: string | null;
  readonly venue: {
    readonly name: string | null;
    readonly city: string | null;
  };
  readonly broadcastNetwork: string | null;
  readonly isNeutralSite: boolean;
}

export interface GameListFilters {
  readonly season?: number;
  readonly seasonType?: SeasonType;
  readonly week?: number;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly teamId?: string;
  readonly status?: GameStatus;
  readonly limit?: number;
}

export interface GameListPage {
  readonly games: readonly Game[];
  readonly nextCursor: string | null;
}
