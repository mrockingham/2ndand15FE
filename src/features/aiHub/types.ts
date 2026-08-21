export type PredictionConfidence = 'LOW' | 'MEDIUM' | 'HIGH';

export interface WeeklyInsightTeam {
  readonly id: string;
  readonly fullName: string;
  readonly abbreviation: string;
}

export interface WeeklyInsightGame {
  readonly id: string;
  readonly startTime: string | null;
  readonly homeTeam: WeeklyInsightTeam;
  readonly awayTeam: WeeklyInsightTeam;
}

export type AiHubSeasonType = 'PRE' | 'REG' | 'POST';

export interface PredictionFactor {
  readonly code: string;
  readonly favors: 'HOME' | 'AWAY' | 'EVEN';
  readonly label: string;
}

export interface WeeklyInsightCard {
  readonly rank: number;
  readonly game: WeeklyInsightGame;
  readonly favorite: WeeklyInsightTeam;
  readonly underdog: WeeklyInsightTeam;
  readonly favoriteProbability: number;
  readonly underdogProbability: number;
  readonly probabilityGap: number;
  readonly projectedScore: {
    readonly home: number;
    readonly away: number;
  } | null;
  readonly projectedMargin: number | null;
  readonly projectedTotal: number | null;
  readonly confidence: PredictionConfidence;
  readonly factors: readonly PredictionFactor[];
}

export interface FavoriteTeamPrediction {
  readonly team: WeeklyInsightTeam;
  readonly opponent: WeeklyInsightTeam;
  readonly game: WeeklyInsightGame;
  readonly teamWinProbability: number;
  readonly isPredictedWinner: boolean;
  readonly projectedScore: {
    readonly home: number;
    readonly away: number;
  } | null;
  readonly confidence: PredictionConfidence;
  readonly factors: readonly PredictionFactor[];
  readonly weeklyRank: number;
}

export interface ModelPerformanceRecord {
  readonly gamesEvaluated: number;
  readonly correct: number;
  readonly incorrect: number;
  readonly tiesOrExcluded: number;
  readonly accuracy: number | null;
  readonly brierScore: number | null;
}

export interface WeeklyInsights {
  readonly context: {
    readonly season: number;
    readonly seasonType: 'PRE' | 'REG' | 'POST';
    readonly week: number;
    readonly modelVersion: string;
    readonly predictionCount: number;
  };
  readonly strongestPick: WeeklyInsightCard | null;
  readonly strongestPicks: readonly WeeklyInsightCard[];
  readonly closestMatchup: WeeklyInsightCard | null;
  readonly closestMatchups: readonly WeeklyInsightCard[];
  readonly upsetWatch:
    | (WeeklyInsightCard & {
        readonly opportunityTeam: WeeklyInsightTeam;
        readonly basis: 'HISTORICAL_STRENGTH_REVERSAL' | 'MODEL_UNCERTAINTY';
      })
    | null;
  readonly mostLikelyBlowout:
    (WeeklyInsightCard & { readonly blowoutScore: number }) | null;
  readonly blowoutWatch: readonly (WeeklyInsightCard & {
    readonly blowoutScore: number;
  })[];
  readonly projectedHighestScoringGame: WeeklyInsightCard | null;
  readonly projectedHighestScoringGames: readonly WeeklyInsightCard[];
  readonly projectedLowestScoringGame: WeeklyInsightCard | null;
  readonly projectedLowestScoringGames: readonly WeeklyInsightCard[];
  readonly offensiveEdge: WeeklyFeatureEdge | null;
  readonly defensiveEdge: WeeklyFeatureEdge | null;
  readonly turnoverProfileEdge: WeeklyFeatureEdge | null;
  readonly confidenceRanking: readonly WeeklyInsightCard[];
  readonly favoriteTeamPrediction: FavoriteTeamPrediction | null;
  readonly modelPerformance: {
    readonly label: string;
    readonly modelVersion: string;
    readonly season: number;
    readonly seasonType: 'PRE' | 'REG' | 'POST';
    readonly seasonRecord: ModelPerformanceRecord;
    readonly previousWeek:
      ({ readonly week: number } & ModelPerformanceRecord) | null;
  };
}

export interface WeeklyInsightsFilters {
  readonly season: number;
  readonly seasonType: 'PRE' | 'REG' | 'POST';
  readonly week: number;
  readonly top: number;
  readonly teamId?: string;
}

export interface WeeklyFeatureEdge {
  readonly gameId: string;
  readonly team: WeeklyInsightTeam;
  readonly opponent: WeeklyInsightTeam;
  readonly edgeScore: number;
  readonly supportingFactors: readonly string[];
  readonly dataCoverage: {
    readonly historicalScores: boolean;
    readonly historicalPlayerStats: boolean;
    readonly currentSeasonResults: boolean;
  };
}

export interface PublicPrediction {
  readonly id: string;
  readonly game: {
    readonly id: string;
    readonly season: number;
    readonly seasonType: AiHubSeasonType;
    readonly week: number | null;
    readonly startTime: string | null;
    readonly isNeutralSite: boolean;
    readonly homeTeam: WeeklyInsightTeam;
    readonly awayTeam: WeeklyInsightTeam;
  };
  readonly modelVersion: string;
  readonly revision: number;
  readonly status: 'PUBLISHED' | 'LOCKED' | 'EVALUATED';
  readonly homeWinProbability: number;
  readonly awayWinProbability: number;
  readonly projectedHomeScore: number | null;
  readonly projectedAwayScore: number | null;
  readonly predictedWinner: WeeklyInsightTeam | null;
  readonly confidence: PredictionConfidence;
  readonly factors: readonly PredictionFactor[];
  readonly explanation: {
    readonly summary: string;
    readonly keyReasons: readonly string[];
    readonly watchFor: readonly string[];
  } | null;
  readonly dataCoverage: {
    readonly historicalScores: boolean;
    readonly historicalPlayerStats: boolean;
    readonly currentSeasonResults: boolean;
    readonly unavailable: readonly string[];
  };
  readonly generatedAt: string;
  readonly publishedAt: string | null;
  readonly lockedAt: string | null;
  readonly evaluation: {
    readonly evaluatedAt: string;
    readonly actualHomeScore: number | null;
    readonly actualAwayScore: number | null;
    readonly actualWinner: WeeklyInsightTeam | null;
    readonly wasCorrect: boolean | null;
    readonly isTie: boolean;
    readonly brierScore: number | null;
  } | null;
}

export interface PredictionListFilters {
  readonly season: number;
  readonly seasonType: AiHubSeasonType;
  readonly week: number;
  readonly limit: number;
}

export interface PublicModelPerformance {
  readonly modelVersion: string;
  readonly evaluated: number;
  readonly decided: number;
  readonly tiesExcludedFromAccuracy: number;
  readonly correct: number;
  readonly incorrect: number;
  readonly accuracy: number | null;
  readonly meanBrierScore: number | null;
}
