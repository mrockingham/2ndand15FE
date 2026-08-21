import {
  formatBrierScore,
  formatNullableRate,
  formatProbability,
  projectedScoreForTeam,
} from '@/features/aiHub/presentation';
import type { FavoriteTeamPrediction } from '@/features/aiHub/types';

const prediction: FavoriteTeamPrediction = {
  team: { id: 'away', abbreviation: 'BUF', fullName: 'Buffalo Bills' },
  opponent: { id: 'home', abbreviation: 'MIA', fullName: 'Miami Dolphins' },
  game: {
    id: 'game',
    startTime: null,
    awayTeam: { id: 'away', abbreviation: 'BUF', fullName: 'Buffalo Bills' },
    homeTeam: { id: 'home', abbreviation: 'MIA', fullName: 'Miami Dolphins' },
  },
  teamWinProbability: 0.785,
  isPredictedWinner: true,
  projectedScore: { away: 26, home: 21 },
  confidence: 'LOW',
  factors: [],
  weeklyRank: 1,
};

describe('AI Hub presentation', () => {
  it('formats probabilities and absent evaluation values honestly', () => {
    expect(formatProbability(0.785)).toBe('78.5%');
    expect(formatNullableRate(null)).toBe('—');
    expect(formatBrierScore(null)).toBe('—');
  });

  it('orients a projected score to the selected team', () => {
    expect(projectedScoreForTeam(prediction)).toEqual({
      team: 26,
      opponent: 21,
    });
  });
});
