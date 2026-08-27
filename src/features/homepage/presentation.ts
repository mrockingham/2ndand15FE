import type {
  AdminHeroSlide,
  HeroContentSlot,
  HomepageAiHubSnapshot,
  HomepageInsightPick,
  HomepageInsightTeam,
  HomepageLeader,
  HomepageLeaderCategory,
  HomepageLeaders,
  HomepageWeeklyLeader,
  HomepageWeeklyLeaders,
  PublicHeroSlide,
} from '@/features/homepage/types';

export const sortByPosition = <T extends { readonly position: number }>(
  items: readonly T[],
) => [...items].sort((a, b) => a.position - b.position);

export const moveOrder = (
  orderedIds: readonly string[],
  id: string,
  direction: 'up' | 'down',
): readonly string[] | null => {
  const index = orderedIds.indexOf(id);
  if (index === -1) return null;
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= orderedIds.length) return null;
  const next = [...orderedIds];
  const [moved] = next.splice(index, 1);
  next.splice(targetIndex, 0, moved!);
  return next;
};

/** CSS `filter` value for a slide's non-destructive image adjustments --
 * never modifies the source image, only how it's displayed. */
export const heroImageFilter = (
  slide: Pick<
    PublicHeroSlide,
    'imageBrightness' | 'imageContrast' | 'imageSaturation'
  >,
) =>
  `brightness(${String(slide.imageBrightness)}%) contrast(${String(slide.imageContrast)}%) saturate(${String(slide.imageSaturation)}%)`;

export const heroImageObjectPosition = (
  slide: Pick<PublicHeroSlide, 'focalPointX' | 'focalPointY'>,
) => `${String(slide.focalPointX)}% ${String(slide.focalPointY)}%`;

export const heroImageTransform = (
  slide: Pick<PublicHeroSlide, 'imageScale'>,
) =>
  slide.imageScale === 100
    ? undefined
    : `scale(${String(slide.imageScale / 100)})`;

export const heroSlotAlign: Readonly<
  Record<HeroContentSlot, 'left' | 'center' | 'right'>
> = {
  TOP_LEFT: 'left',
  TOP_CENTER: 'center',
  TOP_RIGHT: 'right',
  MIDDLE_LEFT: 'left',
  MIDDLE_CENTER: 'center',
  MIDDLE_RIGHT: 'right',
  BOTTOM_LEFT: 'left',
  BOTTOM_CENTER: 'center',
  BOTTOM_RIGHT: 'right',
};

export const heroSlideReadyLabel = (slide: AdminHeroSlide) =>
  slide.isActive ? 'Active' : 'Inactive';

export const leaderCategoryLabel: Readonly<
  Record<HomepageLeaderCategory, string>
> = {
  passing: 'Passing',
  rushing: 'Rushing',
  receiving: 'Receiving',
};

export const leaderMetricLabel: Readonly<
  Record<HomepageLeaderCategory, string>
> = {
  passing: 'Passing Yards',
  rushing: 'Rushing Yards',
  receiving: 'Receiving Yards',
};

export const formatLeaderValue = (value: number) =>
  `${value.toLocaleString('en-US')} YDS`;

export const leaderAccessibleLabel = (
  leader: HomepageLeader,
  category: HomepageLeaderCategory,
) =>
  `Rank ${String(leader.rank)}, ${leaderCategoryLabel[category]}: ${leader.player.displayName}${
    leader.team ? `, ${leader.team.fullName}` : ''
  }, ${formatLeaderValue(leader.value)}`;

export const insightPickOpponent = (
  pick: HomepageInsightPick,
): HomepageInsightTeam =>
  pick.favoriteTeam.id === pick.game.homeTeam.id
    ? pick.game.awayTeam
    : pick.game.homeTeam;

export const insightPickMatchupLabel = (pick: HomepageInsightPick) =>
  `${pick.favoriteTeam.abbreviation} vs ${insightPickOpponent(pick).abbreviation}`;

export const weeklyLeaderMetricLabel: Readonly<Record<string, string>> = {
  passing_yards: 'Passing Yards',
  rushing_yards: 'Rushing Yards',
  receiving_yards: 'Receiving Yards',
};

export const formatWeeklyLeaderValue = (leader: HomepageWeeklyLeader) =>
  `${leader.value.toLocaleString('en-US')} YDS`;

export const weeklyLeaderAccessibleLabel = (
  leader: HomepageWeeklyLeader,
  categoryLabel: string,
) =>
  `${categoryLabel}: ${leader.playerName}, ${leader.team}, ${formatWeeklyLeaderValue(leader)}`;

interface HomepageInsightRailQueryState {
  readonly data?: {
    readonly insights: {
      readonly aiHub: HomepageAiHubSnapshot | null;
      readonly weeklyLeaders: HomepageWeeklyLeaders | null;
    };
    readonly leaders: HomepageLeaders;
  };
  readonly isError: boolean;
  readonly isPending: boolean;
}

const aiHubHasContent = (aiHub: HomepageAiHubSnapshot | null | undefined) =>
  !!aiHub &&
  (aiHub.strongestPick !== null ||
    aiHub.closestMatchup !== null ||
    aiHub.highestProjectedTotal !== null);

export const weeklyLeadersHaveContent = (
  weeklyLeaders: HomepageWeeklyLeaders | null | undefined,
) =>
  !!weeklyLeaders &&
  (weeklyLeaders.passing !== null ||
    weeklyLeaders.rushing !== null ||
    weeklyLeaders.receiving !== null);

const seasonLeadersHaveContent = (leaders: HomepageLeaders | undefined) =>
  !!leaders &&
  (leaders.passing.length > 0 ||
    leaders.rushing.length > 0 ||
    leaders.receiving.length > 0);

/** Number of rail modules the current homepage data resolves to -- drives
 * the adaptive main/rail grid ratio so a short rail never reserves an empty
 * fixed-width column next to a much taller main column. */
export const homepageInsightRailModuleCount = (
  homepageQuery: HomepageInsightRailQueryState,
) => {
  if (homepageQuery.isPending) return 2;
  if (homepageQuery.isError) return 1;
  const data = homepageQuery.data;
  if (!data) return 0;
  const hasAiHub = aiHubHasContent(data.insights.aiHub);
  const hasLeaderModule =
    weeklyLeadersHaveContent(data.insights.weeklyLeaders) ||
    seasonLeadersHaveContent(data.leaders);
  return (hasAiHub ? 1 : 0) + (hasLeaderModule ? 1 : 0);
};
