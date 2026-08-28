export type StandingsSeasonType = 'PRE' | 'REG' | 'POST';
export type StandingsView = 'division' | 'conference' | 'league';

export interface StandingTeam {
  readonly teamId: string;
  readonly name: string;
  readonly abbreviation: string;
  readonly conference: 'AFC' | 'NFC';
  readonly division: 'East' | 'North' | 'South' | 'West';
  readonly season: number;
  readonly seasonType: StandingsSeasonType;
  readonly wins: number | null;
  readonly losses: number | null;
  readonly ties: number | null;
  readonly winPercentage: number | null;
  readonly homeWins: number | null;
  readonly homeLosses: number | null;
  readonly homeTies: number | null;
  readonly awayWins: number | null;
  readonly awayLosses: number | null;
  readonly awayTies: number | null;
  readonly divisionWins: number | null;
  readonly divisionLosses: number | null;
  readonly divisionTies: number | null;
  readonly conferenceWins: number | null;
  readonly conferenceLosses: number | null;
  readonly conferenceTies: number | null;
  readonly nonConferenceWins: null;
  readonly nonConferenceLosses: null;
  readonly nonConferenceTies: null;
  readonly pointsFor: number | null;
  readonly pointsAgainst: number | null;
  readonly pointDifferential: number | null;
  readonly streakType: string | null;
  readonly streakLength: number | null;
  readonly streakDisplay: string | null;
  readonly lastFiveWins: null;
  readonly lastFiveLosses: null;
  readonly lastFiveTies: null;
  readonly lastFiveDisplay: null;
  readonly conferenceRank: number | null;
  readonly playoffSeed: number | null;
  readonly divisionRank: number | null;
  readonly leagueRank: number | null;
  readonly clinchedCode: null;
  readonly eliminated: null;
}

export interface StandingsGroup {
  readonly key: string;
  readonly label: string;
  readonly teams?: readonly StandingTeam[];
  readonly children?: readonly StandingsGroup[];
}

export interface StandingsData {
  readonly season: number;
  readonly seasonType: StandingsSeasonType;
  readonly view: StandingsView;
  readonly groups: readonly StandingsGroup[];
}

export interface StandingsMeta {
  readonly availableViews: readonly StandingsView[];
  readonly availableSeasonTypes: readonly StandingsSeasonType[];
  readonly provider: string;
  readonly updatedAt: string;
}

export interface StandingsResponse {
  readonly data: StandingsData;
  readonly meta: StandingsMeta;
}

export interface StandingsFilters {
  readonly season: number;
  readonly seasonType: Exclude<StandingsSeasonType, 'POST'>;
  readonly view: StandingsView;
}
