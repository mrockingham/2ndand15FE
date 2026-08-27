import type {
  AdminArticleListItem,
  PublicArticleListItem,
} from '@/features/articles/types';
import type { GameTeam } from '@/features/games/types';

export type HeroRichTextMark = 'bold' | 'italic';
export type HeroRichTextAlign = 'left' | 'center' | 'right';

export interface HeroRichTextTextNode {
  readonly type: 'text';
  readonly text: string;
  readonly marks?: readonly HeroRichTextMark[];
}

export interface HeroRichTextLinkNode {
  readonly type: 'link';
  readonly href: string;
  readonly children: readonly HeroRichTextTextNode[];
}

export type HeroRichTextInlineNode =
  HeroRichTextTextNode | HeroRichTextLinkNode;

export interface HeroRichTextParagraphBlock {
  readonly type: 'paragraph';
  readonly align?: HeroRichTextAlign;
  readonly children: readonly HeroRichTextInlineNode[];
}

export interface HeroRichTextHeadingBlock {
  readonly type: 'heading';
  readonly level: 1 | 2 | 3;
  readonly align?: HeroRichTextAlign;
  readonly children: readonly HeroRichTextInlineNode[];
}

export type HeroRichTextBlockNode =
  HeroRichTextParagraphBlock | HeroRichTextHeadingBlock;

export interface HeroRichTextDocument {
  readonly type: 'doc';
  readonly children: readonly HeroRichTextBlockNode[];
}

export type HeroContentSlot =
  | 'TOP_LEFT'
  | 'TOP_CENTER'
  | 'TOP_RIGHT'
  | 'MIDDLE_LEFT'
  | 'MIDDLE_CENTER'
  | 'MIDDLE_RIGHT'
  | 'BOTTOM_LEFT'
  | 'BOTTOM_CENTER'
  | 'BOTTOM_RIGHT';

export const HERO_CONTENT_SLOTS: readonly HeroContentSlot[] = [
  'TOP_LEFT',
  'TOP_CENTER',
  'TOP_RIGHT',
  'MIDDLE_LEFT',
  'MIDDLE_CENTER',
  'MIDDLE_RIGHT',
  'BOTTOM_LEFT',
  'BOTTOM_CENTER',
  'BOTTOM_RIGHT',
];

export interface HeroContentBlock {
  readonly slot: HeroContentSlot;
  readonly content: HeroRichTextDocument;
}

export type HeroCtaVariant = 'PRIMARY' | 'SECONDARY';

export interface HeroCta {
  readonly id: string;
  readonly position: number;
  readonly label: string;
  readonly url: string;
  readonly variant: HeroCtaVariant;
}

export interface HeroImagePresentation {
  readonly imageUrl: string;
  readonly imageAlt: string | null;
  readonly imageBrightness: number;
  readonly imageContrast: number;
  readonly imageSaturation: number;
  readonly overlayOpacity: number;
  readonly focalPointX: number;
  readonly focalPointY: number;
  readonly imageScale: number;
}

export interface PublicHeroSlide extends HeroImagePresentation {
  readonly id: string;
  readonly position: number;
  readonly contentBlocks: readonly HeroContentBlock[];
  readonly ctas: readonly HeroCta[];
}

export interface AdminHeroSlide extends PublicHeroSlide {
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AdminHeroListMeta {
  readonly activeCount: number;
  readonly totalCount: number;
  readonly readyForPublish: boolean;
}

export interface AdminHeroList {
  readonly slides: readonly AdminHeroSlide[];
  readonly meta: AdminHeroListMeta;
}

export interface TopStory<TArticle> {
  readonly id: string;
  readonly position: number;
  readonly article: TArticle;
}

export type PublicTopStory = TopStory<PublicArticleListItem>;
export type AdminTopStory = TopStory<AdminArticleListItem>;

export type HomepageHighlightMediaType = 'CURATED' | 'AUTOMATIC';

export interface HomepageHighlight {
  readonly gameId: string;
  readonly title: string;
  readonly thumbnailUrl: string | null;
  readonly canonicalUrl: string | null;
  readonly embedUrl: string | null;
  readonly canEmbed: boolean;
  readonly mediaType: HomepageHighlightMediaType;
  readonly awayTeam: GameTeam;
  readonly homeTeam: GameTeam;
  readonly gameDate: string | null;
  readonly homepageSelection: HomepageHighlightMediaType;
}

export interface HomepageLeaderPlayer {
  readonly id: string;
  readonly displayName: string;
  readonly position: string | null;
  readonly positionGroup: string | null;
  readonly headshotUrl: string | null;
}

export interface HomepageLeaderTeam {
  readonly id: string;
  readonly abbreviation: string;
  readonly fullName: string;
}

export interface HomepageLeader {
  readonly rank: number;
  readonly player: HomepageLeaderPlayer;
  readonly team: HomepageLeaderTeam | null;
  readonly value: number;
}

export type HomepageLeaderCategory = 'passing' | 'rushing' | 'receiving';

export interface HomepageLeaders {
  readonly season: number;
  readonly seasonType: 'REG';
  readonly passing: readonly HomepageLeader[];
  readonly rushing: readonly HomepageLeader[];
  readonly receiving: readonly HomepageLeader[];
}

export interface HomepageInsightTeam {
  readonly id: string;
  readonly fullName: string;
  readonly abbreviation: string;
}

export interface HomepageInsightGame {
  readonly gameId: string;
  readonly startTime: string | null;
  readonly homeTeam: HomepageInsightTeam;
  readonly awayTeam: HomepageInsightTeam;
}

export interface HomepageInsightPick {
  readonly game: HomepageInsightGame;
  readonly favoriteTeam: HomepageInsightTeam;
  readonly favoriteProbability: number;
  readonly projectedScore: {
    readonly home: number;
    readonly away: number;
  } | null;
  readonly projectedTotal: number | null;
}

export type HomepageInsightSeasonType = 'PRE' | 'REG' | 'POST';

export interface HomepageAiHubSnapshot {
  readonly season: number;
  readonly week: number;
  readonly seasonType: HomepageInsightSeasonType;
  readonly strongestPick: HomepageInsightPick | null;
  readonly closestMatchup: HomepageInsightPick | null;
  readonly highestProjectedTotal: HomepageInsightPick | null;
}

export interface HomepageWeeklyLeader {
  readonly playerId: string;
  readonly playerName: string;
  readonly team: string;
  readonly value: number;
  readonly metric: string;
  readonly week: number;
  readonly season: number;
}

export interface HomepageWeeklyLeaders {
  readonly season: number;
  readonly week: number;
  readonly seasonType: 'REG' | 'POST';
  readonly passing: HomepageWeeklyLeader | null;
  readonly rushing: HomepageWeeklyLeader | null;
  readonly receiving: HomepageWeeklyLeader | null;
}

export interface HomepageInsights {
  readonly aiHub: HomepageAiHubSnapshot | null;
  readonly weeklyLeaders: HomepageWeeklyLeaders | null;
}

export interface PublicHomepage {
  readonly heroSlides: readonly PublicHeroSlide[];
  readonly topStories: readonly PublicTopStory[];
  readonly highlights: readonly HomepageHighlight[];
  readonly leaders: HomepageLeaders;
  readonly insights: HomepageInsights;
}

export interface HeroContentBlockInput {
  readonly slot: HeroContentSlot;
  readonly content: HeroRichTextDocument;
}

export interface HeroCtaInput {
  readonly label: string;
  readonly url: string;
  readonly variant: HeroCtaVariant;
}

export interface HeroSlideFields {
  readonly isActive: boolean;
  readonly imageUrl: string;
  readonly imageAlt: string | null;
  readonly imageBrightness: number;
  readonly imageContrast: number;
  readonly imageSaturation: number;
  readonly overlayOpacity: number;
  readonly focalPointX: number;
  readonly focalPointY: number;
  readonly imageScale: number;
  readonly contentBlocks: readonly HeroContentBlockInput[];
  readonly ctas: readonly HeroCtaInput[];
}

export type CreateHeroSlideInput = HeroSlideFields;
export type UpdateHeroSlideInput = Partial<HeroSlideFields>;

export interface ReorderHeroSlidesInput {
  readonly slideIds: readonly string[];
}

export interface ReorderTopStoriesInput {
  readonly articleIds: readonly string[];
}

export const HERO_IMAGE_DEFAULTS: HeroImagePresentation = {
  imageUrl: '',
  imageAlt: null,
  imageBrightness: 100,
  imageContrast: 100,
  imageSaturation: 100,
  overlayOpacity: 0,
  focalPointX: 50,
  focalPointY: 50,
  imageScale: 100,
};

export const MAX_HERO_SLIDES = 10;
export const MIN_ACTIVE_HERO_SLIDES_FOR_PUBLISH = 3;
export const MAX_HERO_CTAS_PER_SLIDE = 2;
export const MAX_TOP_STORIES = 6;

export type HighlightSourceType = 'GAME_HIGHLIGHT' | 'CURATED_GAME_VIDEO';

export interface HomepageHighlightCandidate {
  readonly sourceType: HighlightSourceType;
  readonly sourceId: string;
  readonly gameId: string;
  readonly matchup: {
    readonly awayTeam: GameTeam;
    readonly homeTeam: GameTeam;
  };
  readonly title: string;
  readonly thumbnailUrl: string | null;
  readonly gameDate: string | null;
  readonly isSelected: boolean;
}

export interface HighlightCandidatePage {
  readonly candidates: readonly HomepageHighlightCandidate[];
  readonly nextCursor: string | null;
}

export interface HighlightCandidateListFilters {
  readonly gameId?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
  readonly mediaType?: HighlightSourceType;
  readonly limit?: number;
}

export interface AdminHomepageHighlight {
  readonly id: string;
  readonly position: number;
  readonly sourceType: HighlightSourceType;
  readonly sourceId: string;
  readonly gameId: string;
  readonly matchup: {
    readonly awayTeam: GameTeam;
    readonly homeTeam: GameTeam;
  };
  readonly gameDate: string | null;
  readonly preview: {
    readonly title: string;
    readonly thumbnailUrl: string | null;
  } | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface HomepageHighlightSettings {
  readonly displayLimit: number;
  readonly fillWithAutomatic: boolean;
}

export interface AdminHomepageHighlightList {
  readonly placements: readonly AdminHomepageHighlight[];
  readonly settings: HomepageHighlightSettings;
}

export interface AddHighlightPlacementInput {
  readonly sourceType: HighlightSourceType;
  readonly sourceId: string;
}

export interface ReorderHighlightPlacementsInput {
  readonly placementIds: readonly string[];
}

export type UpdateHighlightSettingsInput = Partial<HomepageHighlightSettings>;

export const MAX_HOMEPAGE_HIGHLIGHT_PLACEMENTS = 10;
export const MIN_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT = 3;
export const MAX_HOMEPAGE_HIGHLIGHT_DISPLAY_LIMIT = 10;
