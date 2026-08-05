import { safeAverage, safePercentage } from '@/features/players/presentation';
import type {
  PlayerGameStat,
  PlayerSeasonStat,
} from '@/features/players/types';

export interface SeasonMetric {
  readonly key: string;
  readonly label: string;
  readonly value: (stat: PlayerSeasonStat) => number | null;
  readonly suffix?: string;
  readonly higherIsBetter?: boolean;
}

export interface SeasonMetricGroup {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  readonly metrics: readonly SeasonMetric[];
}

export const seasonMetricGroups: readonly SeasonMetricGroup[] = [
  {
    key: 'passing',
    label: 'Passing',
    metrics: [
      {
        key: 'completions',
        label: 'Completions',
        value: (s) => s.passing.completions,
        higherIsBetter: true,
      },
      { key: 'attempts', label: 'Attempts', value: (s) => s.passing.attempts },
      {
        key: 'completionPercentage',
        label: 'Completion %',
        value: (s) => safePercentage(s.passing.completions, s.passing.attempts),
        suffix: '%',
        higherIsBetter: true,
      },
      {
        key: 'yards',
        label: 'Passing yards',
        value: (s) => s.passing.yards,
        higherIsBetter: true,
      },
      {
        key: 'touchdowns',
        label: 'Passing TD',
        value: (s) => s.passing.touchdowns,
        higherIsBetter: true,
      },
      {
        key: 'interceptions',
        label: 'Interceptions',
        value: (s) => s.passing.interceptions,
      },
    ],
  },
  {
    key: 'rushing',
    label: 'Rushing',
    metrics: [
      { key: 'carries', label: 'Carries', value: (s) => s.rushing.carries },
      {
        key: 'yards',
        label: 'Rushing yards',
        value: (s) => s.rushing.yards,
        higherIsBetter: true,
      },
      {
        key: 'yardsPerCarry',
        label: 'Yards / carry',
        value: (s) => safeAverage(s.rushing.yards, s.rushing.carries),
        higherIsBetter: true,
      },
      {
        key: 'touchdowns',
        label: 'Rushing TD',
        value: (s) => s.rushing.touchdowns,
        higherIsBetter: true,
      },
    ],
  },
  {
    key: 'receiving',
    label: 'Receiving',
    metrics: [
      { key: 'targets', label: 'Targets', value: (s) => s.receiving.targets },
      {
        key: 'receptions',
        label: 'Receptions',
        value: (s) => s.receiving.receptions,
        higherIsBetter: true,
      },
      {
        key: 'catchPercentage',
        label: 'Catch %',
        value: (s) =>
          safePercentage(s.receiving.receptions, s.receiving.targets),
        suffix: '%',
        higherIsBetter: true,
      },
      {
        key: 'yards',
        label: 'Receiving yards',
        value: (s) => s.receiving.yards,
        higherIsBetter: true,
      },
      {
        key: 'yardsPerReception',
        label: 'Yards / reception',
        value: (s) => safeAverage(s.receiving.yards, s.receiving.receptions),
        higherIsBetter: true,
      },
      {
        key: 'touchdowns',
        label: 'Receiving TD',
        value: (s) => s.receiving.touchdowns,
        higherIsBetter: true,
      },
    ],
  },
  {
    key: 'defense',
    label: 'Defense',
    metrics: [
      {
        key: 'tacklesSolo',
        label: 'Solo tackles',
        value: (s) => s.defense.tacklesSolo,
        higherIsBetter: true,
      },
      {
        key: 'tackleAssists',
        label: 'Tackle assists',
        value: (s) => s.defense.tackleAssists,
        higherIsBetter: true,
      },
      {
        key: 'sacks',
        label: 'Sacks',
        value: (s) => s.defense.sacks,
        higherIsBetter: true,
      },
      {
        key: 'interceptions',
        label: 'Interceptions',
        value: (s) => s.defense.interceptions,
        higherIsBetter: true,
      },
      {
        key: 'forcedFumbles',
        label: 'Forced fumbles',
        value: (s) => s.defense.forcedFumbles,
        higherIsBetter: true,
      },
      {
        key: 'touchdowns',
        label: 'Defensive TD',
        value: (s) => s.defense.touchdowns,
        higherIsBetter: true,
      },
    ],
  },
  {
    key: 'kicking',
    label: 'Kicking and punting',
    metrics: [
      {
        key: 'fieldGoalsMade',
        label: 'FG made',
        value: (s) => s.kicking.fieldGoalsMade,
        higherIsBetter: true,
      },
      {
        key: 'fieldGoalsAttempted',
        label: 'FG attempts',
        value: (s) => s.kicking.fieldGoalsAttempted,
      },
      {
        key: 'fieldGoalPercentage',
        label: 'FG %',
        value: (s) =>
          safePercentage(
            s.kicking.fieldGoalsMade,
            s.kicking.fieldGoalsAttempted,
          ),
        suffix: '%',
        higherIsBetter: true,
      },
      {
        key: 'extraPointsMade',
        label: 'XP made',
        value: (s) => s.kicking.extraPointsMade,
        higherIsBetter: true,
      },
      {
        key: 'extraPointsAttempted',
        label: 'XP attempts',
        value: (s) => s.kicking.extraPointsAttempted,
      },
      {
        key: 'extraPointPercentage',
        label: 'XP %',
        value: (s) =>
          safePercentage(
            s.kicking.extraPointsMade,
            s.kicking.extraPointsAttempted,
          ),
        suffix: '%',
        higherIsBetter: true,
      },
      { key: 'punts', label: 'Punts', value: (s) => s.kicking.punts },
      {
        key: 'puntYards',
        label: 'Punt yards',
        value: (s) => s.kicking.puntYards,
      },
    ],
  },
  {
    key: 'fantasy',
    label: 'Source fantasy totals',
    description:
      'Source-provided totals; 2nd & 15 does not apply or endorse a scoring formula.',
    metrics: [
      { key: 'standard', label: 'Standard', value: (s) => s.fantasy.standard },
      { key: 'ppr', label: 'PPR', value: (s) => s.fantasy.ppr },
    ],
  },
] as const;

export const visibleSeasonGroups = (stat: PlayerSeasonStat) =>
  seasonMetricGroups
    .map((group) => ({
      ...group,
      metrics: group.metrics.filter((metric) => metric.value(stat) !== null),
    }))
    .filter((group) => group.metrics.length > 0);

export interface GameMetric {
  readonly key: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly value: (stat: PlayerGameStat) => number | null;
}

export const gameMetrics: readonly GameMetric[] = [
  {
    key: 'passCmp',
    label: 'Completions',
    shortLabel: 'CMP',
    value: (s) => s.passing.completions,
  },
  {
    key: 'passAtt',
    label: 'Pass attempts',
    shortLabel: 'ATT',
    value: (s) => s.passing.attempts,
  },
  {
    key: 'passYds',
    label: 'Passing yards',
    shortLabel: 'PASS YDS',
    value: (s) => s.passing.yards,
  },
  {
    key: 'passTd',
    label: 'Passing touchdowns',
    shortLabel: 'PASS TD',
    value: (s) => s.passing.touchdowns,
  },
  {
    key: 'passInt',
    label: 'Interceptions thrown',
    shortLabel: 'INT',
    value: (s) => s.passing.interceptions,
  },
  {
    key: 'carries',
    label: 'Carries',
    shortLabel: 'CAR',
    value: (s) => s.rushing.carries,
  },
  {
    key: 'rushYds',
    label: 'Rushing yards',
    shortLabel: 'RUSH YDS',
    value: (s) => s.rushing.yards,
  },
  {
    key: 'rushTd',
    label: 'Rushing touchdowns',
    shortLabel: 'RUSH TD',
    value: (s) => s.rushing.touchdowns,
  },
  {
    key: 'targets',
    label: 'Targets',
    shortLabel: 'TGT',
    value: (s) => s.receiving.targets,
  },
  {
    key: 'receptions',
    label: 'Receptions',
    shortLabel: 'REC',
    value: (s) => s.receiving.receptions,
  },
  {
    key: 'recYds',
    label: 'Receiving yards',
    shortLabel: 'REC YDS',
    value: (s) => s.receiving.yards,
  },
  {
    key: 'recTd',
    label: 'Receiving touchdowns',
    shortLabel: 'REC TD',
    value: (s) => s.receiving.touchdowns,
  },
  {
    key: 'tackles',
    label: 'Solo tackles',
    shortLabel: 'SOLO',
    value: (s) => s.defense.tacklesSolo,
  },
  {
    key: 'sacks',
    label: 'Defensive sacks',
    shortLabel: 'SACK',
    value: (s) => s.defense.sacks,
  },
  {
    key: 'defInt',
    label: 'Defensive interceptions',
    shortLabel: 'DEF INT',
    value: (s) => s.defense.interceptions,
  },
  {
    key: 'fgm',
    label: 'Field goals made',
    shortLabel: 'FGM',
    value: (s) => s.kicking.fieldGoalsMade,
  },
  {
    key: 'fga',
    label: 'Field goals attempted',
    shortLabel: 'FGA',
    value: (s) => s.kicking.fieldGoalsAttempted,
  },
  {
    key: 'punts',
    label: 'Punts',
    shortLabel: 'PUNT',
    value: (s) => s.kicking.punts,
  },
  {
    key: 'returnYds',
    label: 'Combined return yards',
    shortLabel: 'RET YDS',
    value: (s) =>
      s.returns.puntReturnYards === null &&
      s.returns.kickoffReturnYards === null
        ? null
        : (s.returns.puntReturnYards ?? 0) +
          (s.returns.kickoffReturnYards ?? 0),
  },
] as const;

export const visibleGameMetrics = (stats: readonly PlayerGameStat[]) =>
  gameMetrics
    .filter((metric) => stats.some((stat) => metric.value(stat) !== null))
    .slice(0, 8);
