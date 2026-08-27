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

export interface PublicHomepage {
  readonly heroSlides: readonly PublicHeroSlide[];
  readonly topStories: readonly PublicTopStory[];
  readonly highlights: readonly HomepageHighlight[];
  readonly leaders: HomepageLeaders;
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
