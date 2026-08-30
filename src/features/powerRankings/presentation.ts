import type {
  PowerRankingConference,
  PowerRankingDivision,
  PowerRankingEntry,
} from '@/features/powerRankings/types';

export type MovementTone = 'up' | 'down' | 'flat' | 'new';

export interface MovementDisplay {
  readonly label: string;
  readonly tone: MovementTone;
}

/** Movement semantics: positive = moved up, negative = moved down, 0 =
 * unchanged, null (or no previous edition) = NEW. Never renumber or infer
 * movement client-side beyond this mapping. */
export const movementDisplay = (
  movement: number | null,
  previousRank: number | null,
): MovementDisplay => {
  if (movement === null || previousRank === null)
    return { label: 'NEW', tone: 'new' };
  if (movement > 0) return { label: `▲ ${String(movement)}`, tone: 'up' };
  if (movement < 0)
    return { label: `▼ ${String(Math.abs(movement))}`, tone: 'down' };
  return { label: '—', tone: 'flat' };
};

export const movementToneColor: Readonly<Record<MovementTone, string>> = {
  up: 'success.main',
  down: 'error.main',
  flat: 'text.secondary',
  new: 'primary.main',
};

export const CONFERENCE_OPTIONS: readonly PowerRankingConference[] = [
  'AFC',
  'NFC',
];
export const DIVISION_OPTIONS: readonly PowerRankingDivision[] = [
  'East',
  'North',
  'South',
  'West',
];

export const uniqueTiers = (entries: readonly PowerRankingEntry[]) => [
  ...new Set(entries.map((entry) => entry.tier)),
];

export interface PowerRankingsFilterState {
  readonly search: string;
  readonly conference: PowerRankingConference | '';
  readonly division: PowerRankingDivision | '';
  readonly tier: string;
}

export const EMPTY_POWER_RANKINGS_FILTERS: PowerRankingsFilterState = {
  search: '',
  conference: '',
  division: '',
  tier: '',
};

export const hasActivePowerRankingsFilters = (
  filters: PowerRankingsFilterState,
) =>
  filters.search.trim() !== '' ||
  filters.conference !== '' ||
  filters.division !== '' ||
  filters.tier !== '';

/** Client-side only -- the payload is a single full list, never re-fetched
 * for filtering. Must never mutate or renumber `rank`. */
export const filterRankings = (
  entries: readonly PowerRankingEntry[],
  filters: PowerRankingsFilterState,
): readonly PowerRankingEntry[] => {
  const search = filters.search.trim().toLowerCase();
  return entries.filter((entry) => {
    if (filters.conference && entry.team.conference !== filters.conference)
      return false;
    if (filters.division && entry.team.division !== filters.division)
      return false;
    if (filters.tier && entry.tier !== filters.tier) return false;
    if (search === '') return true;
    return (
      entry.team.name.toLowerCase().includes(search) ||
      entry.team.abbreviation.toLowerCase().includes(search) ||
      entry.headline.toLowerCase().includes(search)
    );
  });
};

export const formatAsOfDate = (asOf: string) => {
  const date = new Date(asOf);
  if (Number.isNaN(date.getTime())) return asOf;
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const powerRankingsPageTitle = (edition: { readonly title: string }) =>
  edition.title;
